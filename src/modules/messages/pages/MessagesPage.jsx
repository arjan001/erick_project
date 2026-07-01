import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Search, Send, Paperclip, Plus, X, Trash2, Archive, ArchiveRestore, Inbox } from 'lucide-react';

const getConversationId = (a, b) => [a, b].sort().join('__');

export default function MessagesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('active'); // active | archived
  const [messageInput, setMessageInput] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [directory, setDirectory] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 500),
        base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 500),
      ]);
      const all = [...sent, ...received];
      const grouped = {};
      all.forEach(m => {
        if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
        grouped[m.conversation_id].push(m);
      });

      const convs = Object.entries(grouped).map(([id, msgs]) => {
        const sorted = msgs.slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const last = sorted[sorted.length - 1];
        const otherEmail = sorted.find(m => m.sender_email !== user.email)?.sender_email
          || sorted.find(m => m.recipient_email !== user.email)?.recipient_email;
        return {
          id,
          otherEmail,
          messages: sorted,
          lastMessage: last?.text || last?.file_name || '',
          lastMessageTime: last?.created_date,
          isArchived: sorted.every(m => m.is_archived),
        };
      }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      // Enrich with participant display info
      const enriched = await Promise.all(convs.map(async (c) => {
        let name = c.otherEmail;
        let avatar = null;
        try {
          const artists = await base44.entities.Artist.filter({ email: c.otherEmail });
          if (artists.length > 0) {
            name = artists[0].full_name;
            avatar = artists[0].profile_photo_url;
          } else {
            const teams = await base44.entities.Team.filter({ contact_email: c.otherEmail });
            if (teams.length > 0) { name = teams[0].team_name; avatar = teams[0].team_logo_url; }
            else {
              const owners = await base44.entities.ProjectOwner.filter({ email: c.otherEmail });
              if (owners.length > 0) { name = owners[0].full_name; avatar = owners[0].profile_photo_url; }
            }
          }
        } catch (e) { /* keep email as fallback */ }
        return { ...c, name, avatar };
      }));

      setConversations(enriched);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      error('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      const m = event.data;
      if (!m || (m.sender_email !== user?.email && m.recipient_email !== user?.email)) return;
      fetchConversations();
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, conversations]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const text = messageInput;
    setMessageInput('');
    try {
      await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        recipient_email: selectedConversation.otherEmail,
        text,
      });
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      error('Failed', 'Failed to send message');
    }
  };

  const handleFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        recipient_email: selectedConversation.otherEmail,
        text: file.name,
        file_url,
        file_name: file.name,
      });
      fetchConversations();
    } catch (err) {
      console.error('Error uploading file:', err);
      error('Failed', 'Failed to send file');
    } finally {
      e.target.value = null;
    }
  };

  const handleArchive = async (conv, archive) => {
    try {
      await Promise.all(conv.messages.map(m => base44.entities.Message.update(m.id, { is_archived: archive })));
      success(archive ? 'Archived' : 'Unarchived', archive ? 'Conversation archived' : 'Conversation restored');
      if (selectedId === conv.id) setSelectedId(null);
      fetchConversations();
    } catch (err) {
      console.error('Error archiving conversation:', err);
      error('Failed', 'Failed to update conversation');
    }
  };

  const handleDelete = async (conv) => {
    if (!window.confirm(`Delete this conversation with ${conv.name}? This cannot be undone.`)) return;
    try {
      await Promise.all(conv.messages.map(m => base44.entities.Message.delete(m.id)));
      success('Deleted', 'Conversation deleted');
      if (selectedId === conv.id) setSelectedId(null);
      setConversations(prev => prev.filter(c => c.id !== conv.id));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      error('Failed', 'Failed to delete conversation');
    }
  };

  const openDirectory = async () => {
    setShowNewChatModal(true);
    try {
      const [artists, teams, owners] = await Promise.all([
        base44.entities.Artist.filter({ status: 'approved' }),
        base44.entities.Team.filter({ status: 'approved' }),
        base44.entities.ProjectOwner.list(),
      ]);
      const people = [
        ...artists.filter(a => a.email !== user.email).map(a => ({ email: a.email, name: a.full_name, type: 'Artist' })),
        ...teams.map(t => ({ email: t.contact_email, name: t.team_name, type: 'Team' })),
        ...owners.filter(o => o.email !== user.email).map(o => ({ email: o.email, name: o.full_name, type: 'Client' })),
      ];
      setDirectory(people);
    } catch (err) {
      console.error('Error loading directory:', err);
    }
  };

  const startChat = (person) => {
    const id = getConversationId(user.email, person.email);
    const existing = conversations.find(c => c.id === id);
    if (existing) {
      setSelectedId(id);
    } else {
      setConversations(prev => [{ id, otherEmail: person.email, name: person.name, avatar: null, messages: [], lastMessage: '', lastMessageTime: new Date().toISOString(), isArchived: false }, ...prev]);
      setSelectedId(id);
    }
    setShowNewChatModal(false);
    setDirectorySearch('');
  };

  const filteredConversations = conversations.filter(c => {
    if (filterTab === 'active' && c.isArchived) return false;
    if (filterTab === 'archived' && !c.isArchived) return false;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.otherEmail?.toLowerCase().includes(q);
  });

  const filteredDirectory = directory.filter(p =>
    p.name?.toLowerCase().includes(directorySearch.toLowerCase()) || p.email?.toLowerCase().includes(directorySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white">
      {/* Conversation list */}
      <div className="w-96 border-r border-gray-200 flex flex-col h-full bg-white flex-shrink-0">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <button onClick={openDirectory} className="p-2 bg-black text-white rounded-lg hover:bg-gray-800" title="New chat">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${filterTab === 'active' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Inbox className="w-3 h-3" /> Active
            </button>
            <button
              onClick={() => setFilterTab('archived')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${filterTab === 'archived' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Archive className="w-3 h-3" /> Archived
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              {filterTab === 'archived' ? 'No archived conversations' : 'No conversations yet — start a new chat'}
            </div>
          )}
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left cursor-pointer relative group ${selectedId === conv.id ? 'bg-gray-100' : ''}`}
            >
              <div className="flex items-start gap-3 pr-14">
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-gray-600">{conv.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">{conv.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.otherEmail}</p>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                </div>
              </div>
              <div className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); handleArchive(conv, !conv.isArchived); }} title={conv.isArchived ? 'Unarchive' : 'Archive'} className="p-1.5 hover:bg-gray-200 rounded">
                  {conv.isArchived ? <ArchiveRestore className="w-3.5 h-3.5 text-gray-600" /> : <Archive className="w-3.5 h-3.5 text-gray-600" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(conv); }} title="Delete" className="p-1.5 hover:bg-red-50 rounded">
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {selectedConversation.avatar ? <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-600">{selectedConversation.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{selectedConversation.name}</div>
                <div className="text-xs text-gray-500">{selectedConversation.otherEmail}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-3 max-w-2xl mx-auto">
                {selectedConversation.messages.length === 0 && (
                  <div className="text-center text-sm text-gray-400 py-10">Send a message to start the conversation</div>
                )}
                {selectedConversation.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl px-4 py-2.5 ${msg.sender_email === user.email ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                      {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                      {msg.file_url && (
                        <a href={msg.file_url} target="_blank" rel="noreferrer" className="text-xs underline mt-1 block opacity-80">{msg.file_name || 'Attachment'}</a>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.sender_email === user.email ? 'text-gray-300' : 'text-gray-400'}`}>
                        {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center gap-2">
              <input type="file" id="msg-file" className="hidden" onChange={handleFileAttach} />
              <label htmlFor="msg-file" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                <Paperclip className="w-5 h-5" />
              </label>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
              <button onClick={handleSend} className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <p>Select a conversation, or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Start a new chat</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder="Search creators, teams, or clients..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-gray-400"
            />
            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredDirectory.map(p => (
                <button key={p.email} onClick={() => startChat(p)} className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg text-left">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.type}</div>
                  </div>
                </button>
              ))}
              {filteredDirectory.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-6">No matches found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
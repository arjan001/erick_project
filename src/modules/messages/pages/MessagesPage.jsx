import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';
import { Search, Send, Paperclip, Plus, X, Trash2, Archive, ArchiveRestore, Inbox, ArrowLeft, LogOut } from 'lucide-react';
import { confirmDialog } from '@/lib/sweetAlert';

function playMessageTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // audio not supported — ignore
  }
}

const getConversationId = (a, b) => [a, b].sort().join('__');
const ONLINE_THRESHOLD_MS = 90 * 1000; // consider online if active within last 90s

const isOnline = (lastActive) => lastActive && (Date.now() - new Date(lastActive).getTime()) < ONLINE_THRESHOLD_MS;

// Look up a participant's profile across all user types and return display info + tags + presence
async function enrichParticipant(email) {
  try {
    const artists = await base44.entities.Artist.filter({ email });
    if (artists.length > 0) {
      const a = artists[0];
      const tags = [a.role, ...(a.skills_experience || []).slice(0, 2).map(s => s.skill)].filter(Boolean).slice(0, 3);
      return { name: a.full_name, avatar: a.profile_photo_url, type: 'Artist', tags, lastActive: a.last_active };
    }
    const teams = await base44.entities.Team.filter({ contact_email: email });
    if (teams.length > 0) {
      const t = teams[0];
      return { name: t.team_name, avatar: t.team_logo_url, type: 'Team', tags: (t.specialties || []).slice(0, 2), lastActive: t.last_active };
    }
    const owners = await base44.entities.ProjectOwner.filter({ email });
    if (owners.length > 0) {
      const o = owners[0];
      return { name: o.full_name, avatar: o.profile_photo_url, type: 'Client', tags: [], lastActive: o.last_active };
    }
    const backers = await base44.entities.Backer.filter({ contact_email: email });
    if (backers.length > 0) {
      const b = backers[0];
      return { name: b.organization_name, avatar: b.logo_url, type: 'Backer', tags: (b.interests || []).slice(0, 2), lastActive: b.last_active };
    }
  } catch (e) {
    console.error('enrichParticipant error:', e);
  }
  return { name: email, avatar: null, type: null, tags: [], lastActive: null };
}

const typeBadgeColor = {
  Artist: 'bg-indigo-50 text-indigo-600',
  Team: 'bg-purple-50 text-purple-600',
  Client: 'bg-amber-50 text-amber-600',
  Backer: 'bg-emerald-50 text-emerald-600',
};

function PresenceDot({ online, className = '' }) {
  if (!online) return null;
  return <span className={`absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full ${className}`} />;
}

function ParticipantTags({ type, tags }) {
  if (!type && (!tags || tags.length === 0)) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {type && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeBadgeColor[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>}
      {tags?.map((t, i) => (
        <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{String(t).replace(/_/g, ' ')}</span>
      ))}
    </div>
  );
}

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
  const [, setPresenceTick] = useState(0); // forces re-render so "last seen" text stays fresh
  const messagesEndRef = useRef(null);

  const buildConversations = (all) => {
    const grouped = {};
    all.forEach(m => {
      if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
      grouped[m.conversation_id].push(m);
    });

    return Object.entries(grouped).map(([id, msgs]) => {
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
  };

  const fetchConversations = async () => {
    try {
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 500),
        base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 500),
      ]);
      const convs = buildConversations([...sent, ...received]);

      // Enrich with participant display info (name, avatar, type, tags, presence)
      const enriched = await Promise.all(convs.map(async (c) => {
        const info = await enrichParticipant(c.otherEmail);
        return { ...c, ...info };
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

  // Keep "last seen" labels fresh without refetching anything
  useEffect(() => {
    const t = setInterval(() => setPresenceTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Merge a single new message into state in-place — no refetch, no flicker, no "reload" feeling
  const applyIncomingMessage = async (m) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === m.conversation_id);
      if (idx === -1) return prev; // handled async below if conversation is brand new
      const conv = prev[idx];
      if (conv.messages.some(existing => existing.id === m.id)) return prev; // already applied (optimistic)
      const updatedConv = {
        ...conv,
        messages: [...conv.messages, m],
        lastMessage: m.text || m.file_name || '',
        lastMessageTime: m.created_date,
        isArchived: false,
      };
      const rest = prev.filter((_, i) => i !== idx);
      return [updatedConv, ...rest];
    });

    const exists = conversations.some(c => c.id === m.conversation_id);
    if (!exists) {
      const otherEmail = m.sender_email === user.email ? m.recipient_email : m.sender_email;
      const info = await enrichParticipant(otherEmail);
      setConversations(prev => {
        if (prev.some(c => c.id === m.conversation_id)) return prev; // race guard
        return [{
          id: m.conversation_id,
          otherEmail,
          messages: [m],
          lastMessage: m.text || m.file_name || '',
          lastMessageTime: m.created_date,
          isArchived: false,
          ...info,
        }, ...prev];
      });
    }
  };

  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      const m = event.data;
      if (!m || (m.sender_email !== user?.email && m.recipient_email !== user?.email)) return;
      if (event.type === 'create') {
        if (m.sender_email !== user?.email) playMessageTone();
        applyIncomingMessage(m);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, conversations]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const text = messageInput;
    setMessageInput('');
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_email: user.email,
      recipient_email: selectedConversation.otherEmail,
      text,
      created_date: new Date().toISOString(),
    };
    // Optimistic update — instant, no waiting on the network for the UI to feel responsive
    setConversations(prev => prev.map(c => c.id === selectedConversation.id
      ? { ...c, messages: [...c.messages, optimisticMsg], lastMessage: text, lastMessageTime: optimisticMsg.created_date }
      : c));
    try {
      const created = await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        recipient_email: selectedConversation.otherEmail,
        text,
      });
      // Replace temp message with the real saved one
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.map(msg => msg.id === tempId ? created : msg) }
        : c));
    } catch (err) {
      console.error('Error sending message:', err);
      error('Failed', 'Failed to send message');
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.filter(msg => msg.id !== tempId) }
        : c));
    }
  };

  const handleFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const created = await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        recipient_email: selectedConversation.otherEmail,
        text: file.name,
        file_url,
        file_name: file.name,
      });
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: [...c.messages, created], lastMessage: created.text || created.file_name, lastMessageTime: created.created_date }
        : c));
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
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, isArchived: archive } : c));
      success(archive ? 'Archived' : 'Unarchived', archive ? 'Conversation archived' : 'Conversation restored');
      if (selectedId === conv.id) setSelectedId(null);
    } catch (err) {
      console.error('Error archiving conversation:', err);
      error('Failed', 'Failed to update conversation');
    }
  };

  const handleDelete = async (conv) => {
    const confirmed = await confirmDialog('Delete conversation?', `This will permanently delete your conversation with ${conv.name}.`, 'Yes, delete it');
    if (!confirmed) return;
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
      const [artists, teams, owners, backers] = await Promise.all([
        base44.entities.Artist.list(),
        base44.entities.Team.list(),
        base44.entities.ProjectOwner.list(),
        base44.entities.Backer.list(),
      ]);
      const people = [
        ...artists.filter(a => a.email !== user.email).map(a => ({
          email: a.email, name: a.full_name, type: 'Artist',
          tags: [a.role, ...(a.skills_experience || []).slice(0, 2).map(s => s.skill)].filter(Boolean).slice(0, 3),
          avatar: a.profile_photo_url, lastActive: a.last_active,
        })),
        ...teams.map(t => ({
          email: t.contact_email, name: t.team_name, type: 'Team',
          tags: (t.specialties || []).slice(0, 2), avatar: t.team_logo_url, lastActive: t.last_active,
        })),
        ...owners.filter(o => o.email !== user.email).map(o => ({
          email: o.email, name: o.full_name, type: 'Client', tags: [], avatar: o.profile_photo_url, lastActive: o.last_active,
        })),
        ...backers.map(b => ({
          email: b.contact_email, name: b.organization_name, type: 'Backer',
          tags: (b.interests || []).slice(0, 2), avatar: b.logo_url, lastActive: b.last_active,
        })),
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
      setConversations(prev => [{
        id, otherEmail: person.email, name: person.name, avatar: person.avatar || null,
        type: person.type, tags: person.tags || [], lastActive: person.lastActive,
        messages: [], lastMessage: '', lastMessageTime: new Date().toISOString(), isArchived: false,
      }, ...prev]);
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
      <div className={`w-full md:w-96 border-r border-gray-200 flex-col h-full bg-white flex-shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
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
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-gray-600">{conv.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <PresenceDot online={isOnline(conv.lastActive)} className="-bottom-0.5 -right-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">{conv.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString() : ''}</span>
                  </div>
                  <ParticipantTags type={conv.type} tags={conv.tags} />
                  <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage || 'No messages yet'}</p>
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
      <div className={`flex-1 flex-col h-full bg-white ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <button onClick={() => setSelectedId(null)} className="md:hidden p-1.5 -ml-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedConversation.avatar ? <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-600">{selectedConversation.name?.[0]?.toUpperCase()}</span>}
                </div>
                <PresenceDot online={isOnline(selectedConversation.lastActive)} className="-bottom-0.5 -right-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{selectedConversation.name}</div>
                <div className="text-xs text-gray-500">
                  {isOnline(selectedConversation.lastActive)
                    ? <span className="text-green-600 font-medium">Active now</span>
                    : selectedConversation.lastActive
                      ? `Last seen ${formatDistanceToNow(new Date(selectedConversation.lastActive), { addSuffix: true })}`
                      : 'Offline'}
                </div>
                <ParticipantTags type={selectedConversation.type} tags={selectedConversation.tags} />
              </div>
              <button
                onClick={() => setSelectedId(null)}
                title="Leave chat"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
              placeholder="Search creators, teams, backers or clients..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-gray-400"
            />
            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredDirectory.map(p => (
                <button key={p.email} onClick={() => startChat(p)} className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg text-left">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {p.avatar ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-600">{p.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <PresenceDot online={isOnline(p.lastActive)} className="-bottom-0.5 -right-0.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <ParticipantTags type={p.type} tags={p.tags} />
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
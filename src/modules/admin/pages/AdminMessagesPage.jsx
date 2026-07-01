import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Send, Trash2, User } from 'lucide-react';

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const rows = await base44.entities.Message.list('-created_date', 500);
      const grouped = {};
      (rows || []).forEach(m => {
        if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
        grouped[m.conversation_id].push(m);
      });
      const convs = Object.entries(grouped).map(([id, msgs]) => {
        const sorted = msgs.slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const last = sorted[sorted.length - 1];
        const otherParty = sorted.find(m => m.sender_email !== user?.email)?.sender_email || last.sender_email;
        return { id, messages: sorted, lastMessage: last.text, lastMessageTime: last.created_date, participant: otherParty };
      }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setConversations(convs);
    } catch (err) {
      console.error('Error fetching messages:', err);
      error('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const created = await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user?.email,
        recipient_email: selectedConversation.participant,
        text: newMessage,
      });
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: [...c.messages, created], lastMessage: created.text, lastMessageTime: created.created_date }
        : c
      ));
      setNewMessage('');
      success('Sent', 'Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      error('Failed', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return;
    try {
      const conv = conversations.find(c => c.id === conversationId);
      await Promise.all(conv.messages.map(m => base44.entities.Message.delete(m.id)));
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (selectedId === conversationId) setSelectedId(null);
      success('Deleted', 'Conversation deleted successfully');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      error('Failed', 'Failed to delete conversation');
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.participant?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="w-full sm:w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Admin Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">No conversations yet</div>
          )}
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedId === conversation.id ? 'bg-gray-100' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900 truncate">{conversation.participant}</div>
                    <div className="text-xs text-gray-500">{new Date(conversation.lastMessageTime).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="font-medium text-gray-900">{selectedConversation.participant}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteConversation(selectedConversation.id)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md rounded-lg p-3 ${msg.sender_email === user?.email ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <div className="text-sm">{msg.text}</div>
                    <div className={`text-xs mt-1 ${msg.sender_email === user?.email ? 'text-gray-300' : 'text-gray-500'}`}>
                      {new Date(msg.created_date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <Button onClick={handleSendMessage} disabled={sending} className="bg-black text-white hover:bg-gray-800">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">Select a conversation to view messages</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
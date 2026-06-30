import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Send, Trash2, Clock, CheckCircle, User, Filter, Archive, Star, MoreVertical } from 'lucide-react';

export default function AdminMessagesPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const mockConversations = [
          { 
            id: 1, 
            participant: 'john@example.com', 
            participantName: 'John Smith',
            lastMessage: 'Hi, I have a question about my subscription', 
            lastMessageTime: '2026-06-28T10:30:00',
            unread: 2,
            status: 'active',
            messages: [
              { id: 1, sender: 'john@example.com', content: 'Hi, I have a question about my subscription', time: '2026-06-28T10:30:00', read: false },
              { id: 2, sender: 'john@example.com', content: 'Can you help me upgrade my plan?', time: '2026-06-28T10:31:00', read: false }
            ]
          },
          { 
            id: 2, 
            participant: 'jane@example.com', 
            participantName: 'Jane Doe',
            lastMessage: 'Thank you for the quick response!', 
            lastMessageTime: '2026-06-27T15:45:00',
            unread: 0,
            status: 'active',
            messages: [
              { id: 1, sender: 'admin', content: 'Your account has been verified', time: '2026-06-27T15:00:00', read: true },
              { id: 2, sender: 'jane@example.com', content: 'Thank you for the quick response!', time: '2026-06-27T15:45:00', read: true }
            ]
          },
          { 
            id: 3, 
            participant: 'mike@example.com', 
            participantName: 'Mike Johnson',
            lastMessage: 'I need help with my payment', 
            lastMessageTime: '2026-06-26T09:15:00',
            unread: 1,
            status: 'active',
            messages: [
              { id: 1, sender: 'mike@example.com', content: 'I need help with my payment', time: '2026-06-26T09:15:00', read: false }
            ]
          },
          { 
            id: 4, 
            participant: 'sarah@example.com', 
            participantName: 'Sarah Williams',
            lastMessage: 'How do I delete my account?', 
            lastMessageTime: '2026-06-25T14:20:00',
            unread: 0,
            status: 'archived',
            messages: [
              { id: 1, sender: 'sarah@example.com', content: 'How do I delete my account?', time: '2026-06-25T14:20:00', read: true },
              { id: 2, sender: 'admin', content: 'Please contact support for account deletion requests', time: '2026-06-25T14:25:00', read: true }
            ]
          }
        ];
        setMessages(mockConversations);
      } catch (err) {
        console.error('Error fetching messages:', err);
        error('Error', 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const newMsg = {
        id: Date.now(),
        sender: 'admin',
        content: newMessage,
        time: new Date().toISOString(),
        read: true
      };
      setMessages(messages.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              messages: [...conv.messages, newMsg],
              lastMessage: newMessage,
              lastMessageTime: new Date().toISOString()
            } 
          : conv
      ));
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMsg],
        lastMessage: newMessage,
        lastMessageTime: new Date().toISOString()
      });
      setNewMessage('');
      success('Sent', 'Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      error('Failed', 'Failed to send message');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      setMessages(messages.filter(m => m.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      success('Deleted', 'Conversation deleted successfully');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      error('Failed', 'Failed to delete conversation');
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      setMessages(messages.map(m => 
        m.id === conversationId 
          ? { ...m, status: m.status === 'archived' ? 'active' : 'archived' } 
          : m
      ));
      success('Updated', 'Conversation status updated');
    } catch (err) {
      console.error('Error archiving conversation:', err);
      error('Failed', 'Failed to update conversation');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.participant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Admin Messages</h1>
          <p className="text-gray-600 mt-1">Manage user communications</p>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Conversations List */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Conversations</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredMessages.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 truncate">{conversation.participantName}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(conversation.lastMessageTime).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 truncate">{conversation.participant}</div>
                      <div className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</div>
                      {conversation.unread > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {conversation.unread} unread
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedConversation.participantName}</div>
                      <div className="text-sm text-gray-500">{selectedConversation.participant}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleArchiveConversation(selectedConversation.id)}>
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteConversation(selectedConversation.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-lg p-3 ${
                          msg.sender === 'admin'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{msg.content}</div>
                        <div className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {new Date(msg.time).toLocaleTimeString()}
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <Button onClick={handleSendMessage} className="bg-black text-white hover:bg-gray-800">
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
      </main>
    </div>
  );
}

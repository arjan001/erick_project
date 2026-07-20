import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Search } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/lib/AuthContext';
import realtimeMessagingService from '@/services/realtimeMessagingService';

export default function ClientMessages() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const getConversationId = (a, b) => [a, b].sort().join('__');

  const fetchConversations = async () => {
    if (!authUser) return;
    try {
      const [sent, received] = await Promise.all([
        Message.filter({ sender_email: authUser.email }, '-created_at', 500),
        Message.filter({ recipient_email: authUser.email }, '-created_at', 500),
      ]);
      const allMessages = [...sent, ...received];
      
      const grouped = {};
      allMessages.forEach(m => {
        if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
        grouped[m.conversation_id].push(m);
      });

      const convs = Object.entries(grouped).map(([id, msgs]) => {
        const sorted = msgs.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const last = sorted[sorted.length - 1];
        const otherEmail = sorted.find(m => m.sender_email !== authUser.email)?.sender_email
          || sorted.find(m => m.recipient_email !== authUser.email)?.recipient_email;
        return {
          id,
          otherEmail,
          messages: sorted,
          lastMessage: last.text || last.file_name || '',
          lastMessageTime: last.created_at,
        };
      }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      setConversations(convs);
      if (convs.length > 0) {
        setSelectedChat(convs[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [authUser]);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    }
  }, [selectedChat]);

  // Real-time message subscription using Supabase Realtime
  useEffect(() => {
    if (!authUser) return;

    const handleNewMessage = (newMessage) => {
      console.log('Real-time new message received:', newMessage);
      
      // Check if conversation already exists
      const existingConv = conversations.find(c => c.id === newMessage.conversation_id);
      
      if (existingConv) {
        // Update existing conversation
        setConversations(prev => prev.map(c => {
          if (c.id === newMessage.conversation_id) {
            return {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: newMessage.text || '',
              lastMessageTime: newMessage.created_at
            };
          }
          return c;
        }));
        
        // If this is the selected conversation, add the message
        if (selectedChat?.id === newMessage.conversation_id) {
          setMessages(prev => [...prev, newMessage]);
        }
      } else {
        // Create new conversation
        const newConv = {
          id: newMessage.conversation_id,
          otherEmail: newMessage.sender_email === authUser.email ? newMessage.recipient_email : newMessage.sender_email,
          messages: [newMessage],
          lastMessage: newMessage.text || '',
          lastMessageTime: newMessage.created_at,
        };
        setConversations(prev => [newConv, ...prev]);
      }
    };

    // Subscribe to real-time messages
    const unsubscribe = realtimeMessagingService.subscribeToMessages(
      authUser.email,
      handleNewMessage
    );

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [authUser, selectedChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !authUser) return;

    try {
      const created = await Message.create({
        conversation_id: selectedChat.id,
        sender_email: authUser.email,
        recipient_email: selectedChat.otherEmail,
        text: newMessage,
      });
      
      setMessages([...messages, created]);
      setConversations(prev => prev.map(c => 
        c.id === selectedChat.id 
          ? { ...c, messages: [...c.messages, created], lastMessage: newMessage, lastMessageTime: created.created_at }
          : c
      ));
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toastError('Send Failed', 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="font-medium text-gray-900">
                  {conv.participant_1_email === user?.email 
                    ? conv.participant_2_email 
                    : conv.participant_1_email}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {conv.id}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">
                {selectedChat.participant_1_email === user?.email 
                  ? selectedChat.participant_2_email 
                  : selectedChat.participant_1_email}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_email === user?.email
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

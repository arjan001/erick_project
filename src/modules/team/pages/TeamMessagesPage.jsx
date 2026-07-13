import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, Send, Phone, Video, Monitor, 
  Plus, Search, MoreVertical, X, Users, Paperclip 
} from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useAuth } from '@/lib/AuthContext';

export default function TeamMessagesPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [team, setTeam] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    loadTeamData();
  }, [isAuthenticated]);

  const loadTeamData = async () => {
    try {
      let teamData = null;
      if (authUser?.team_id) {
        teamData = await Team.filter({ id: authUser.team_id }, '-created_date', 1).then(r => r?.[0] || null);
      } else {
        const teams = await Team.filter({ contact_email: authUser?.email }, '-created_date', 1);
        teamData = teams?.[0] || null;
      }
      setTeam(teamData);
      if (teamData) {
        loadConversations();
      }
    } catch (err) {
      console.error('Error loading team:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = () => {
    const saved = localStorage.getItem('studio22_team_conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    } else {
      const mockConversations = [
        {
          id: '1',
          name: 'Project Alpha Team',
          type: 'group',
          avatar: '',
          lastMessage: 'Let\'s discuss the timeline',
          timestamp: new Date().toISOString(),
          unread: 2
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          type: 'direct',
          avatar: '',
          lastMessage: 'Files are ready for review',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          unread: 0
        }
      ];
      setConversations(mockConversations);
      localStorage.setItem('studio22_team_conversations', JSON.stringify(mockConversations));
    }
  };

  const loadMessages = (conversationId) => {
    const saved = localStorage.getItem(`studio22_team_messages_${conversationId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const mockMessages = [
        {
          id: '1',
          sender: 'other',
          text: 'Hi team, let\'s sync up on the project',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '2',
          sender: 'me',
          text: 'Sure, I\'m available now',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setMessages(mockMessages);
      localStorage.setItem(`studio22_team_messages_${conversationId}`, JSON.stringify(mockMessages));
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    localStorage.setItem(
      `studio22_team_messages_${selectedConversation.id}`,
      JSON.stringify([...messages, message])
    );

    setNewMessage('');
  };

  const handleStartCall = (type) => {
    setCallType(type);
    setShowCallModal(true);
  };

  const handleEndCall = () => {
    setShowCallModal(false);
    setCallType(null);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject?.getTracks()?.forEach(track => track.stop());
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <Button size="sm" variant="ghost">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    loadMessages(conv.id);
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.type === 'group' ? (
                        <Users className="w-6 h-6 text-gray-500" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{conv.name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedConversation.type === 'group' ? (
                        <Users className="w-5 h-5 text-gray-500" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedConversation.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.type === 'group' ? 'Group chat' : 'Direct message'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleStartCall('audio')}>
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStartCall('video')}>
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStartCall('screen')}>
                      <Monitor className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'me'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} className="bg-black text-white hover:bg-gray-800">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
      </div>

      {showCallModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="relative w-full h-full">
            {callType === 'video' && (
              <>
                {(callType === 'video' || callType === 'screen') && (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                )}
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg object-cover"
                />
              </>
            )}
            {callType === 'audio' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-16 h-16" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Audio Call</h2>
                  <p className="text-white/70">Connected...</p>
                </div>
              </div>
            )}
            {callType === 'screen' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Monitor className="w-24 h-24 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Screen Sharing</h2>
                  <p className="text-white/70">Sharing screen...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <Button
                size="lg"
                onClick={handleEndCall}
                className="bg-red-600 text-white hover:bg-red-700 rounded-full w-16 h-16"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

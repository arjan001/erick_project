import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistSidebar from '../components/ArtistSidebar';
import { Search, Send, MoreVertical, Paperclip, Phone, Video, Monitor } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Messages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Mock conversations
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Looking forward to working with you on this project!',
      time: '2m ago',
      unread: 2,
      online: true,
      job: 'VFX Artist needed for Branding',
      messages: [
        { id: 1, sender: 'them', text: 'Hi! I saw your application for the VFX Artist position.', time: '10:30 AM' },
        { id: 2, sender: 'me', text: 'Hello! Yes, I\'m very interested in this opportunity.', time: '10:32 AM' },
        { id: 3, sender: 'them', text: 'Great! Can you tell me more about your experience with particle effects?', time: '10:35 AM' },
        { id: 4, sender: 'me', text: 'Of course! I\'ve worked on several commercial projects creating abstract particle effects and motion graphics.', time: '10:38 AM' },
        { id: 5, sender: 'them', text: 'Looking forward to working with you on this project!', time: '10:40 AM' },
      ]
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      lastMessage: 'Can you send me your portfolio?',
      time: '1h ago',
      unread: 0,
      online: true,
      job: 'Director needed for Commercial',
      messages: [
        { id: 1, sender: 'them', text: 'Hey, I noticed you applied for our Director position.', time: '9:15 AM' },
        { id: 2, sender: 'me', text: 'Yes! I have experience directing commercials.', time: '9:20 AM' },
        { id: 3, sender: 'them', text: 'Can you send me your portfolio?', time: '9:25 AM' },
      ]
    },
    {
      id: 3,
      name: 'Emma Chen',
      avatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'The shoot is scheduled for next Monday',
      time: '2h ago',
      unread: 0,
      online: false,
      job: 'Cinematographer for Music Video',
      messages: [
        { id: 1, sender: 'them', text: 'Hi! Congrats on getting the cinematographer position!', time: 'Yesterday' },
        { id: 2, sender: 'me', text: 'Thank you! I\'m excited to work on this.', time: 'Yesterday' },
        { id: 3, sender: 'them', text: 'The shoot is scheduled for next Monday', time: 'Yesterday' },
      ]
    },
    {
      id: 4,
      name: 'Alex Martinez',
      avatar: 'https://i.pravatar.cc/150?img=13',
      lastMessage: 'What\'s your rate for this project?',
      time: '3h ago',
      unread: 1,
      online: false,
      job: 'Editor needed for Documentary',
      messages: [
        { id: 1, sender: 'them', text: 'Hello! I\'m interested in your editing skills.', time: '2:00 PM' },
        { id: 2, sender: 'me', text: 'Thanks for reaching out!', time: '2:10 PM' },
        { id: 3, sender: 'them', text: 'What\'s your rate for this project?', time: '2:15 PM' },
      ]
    },
    {
      id: 5,
      name: 'Lisa Wong',
      avatar: 'https://i.pravatar.cc/150?img=9',
      lastMessage: 'Perfect, let\'s schedule a call',
      time: 'Yesterday',
      unread: 0,
      online: true,
      job: 'Motion Designer for Social Media',
      messages: [
        { id: 1, sender: 'them', text: 'Your motion graphics work is impressive!', time: 'Yesterday' },
        { id: 2, sender: 'me', text: 'Thank you! I\'d love to discuss the project.', time: 'Yesterday' },
        { id: 3, sender: 'them', text: 'Perfect, let\'s schedule a call', time: 'Yesterday' },
      ]
    },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    setUser(JSON.parse(storedUser));
    setSelectedChat(conversations[0]);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, conversations]);

  const handleFileAttach = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const file_url = result.file_url;

      const newMessage = {
        id: Date.now(),
        sender: 'me',
        text: file.name,
        file_url: file_url,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedChat.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: file.name
          };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage]
      });
      event.target.value = null;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    }
  };

  const handlePaste = async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file') {
        event.preventDefault();
        const file = item.getAsFile();
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf')) {
          try {
            const result = await base44.integrations.Core.UploadFile({ file });
            const file_url = result.file_url;

            const newMessage = {
              id: Date.now(),
              sender: 'me',
              text: file.name,
              file_url: file_url,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            const updatedConversations = conversations.map(conv => {
              if (conv.id === selectedChat.id) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: file.name
                };
              }
              return conv;
            });
            
            setConversations(updatedConversations);
            setSelectedChat({
              ...selectedChat,
              messages: [...selectedChat.messages, newMessage]
            });
          } catch (error) {
            console.error('Error uploading pasted file:', error);
            alert('Failed to upload pasted file.');
          }
        }
      }
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedChat.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    });
    
    setMessageInput('');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full flex overflow-hidden bg-white pl-20">
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-96 border-r border-gray-200 flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors ${
                    selectedChat?.id === conv.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img 
                        src={conv.avatar} 
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{conv.name}</span>
                        <span className="text-xs text-gray-500">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{conv.job}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={selectedChat.avatar} 
                          alt={selectedChat.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {selectedChat.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedChat.name}</div>
                        <div className="text-xs text-gray-500">
                          {selectedChat.online ? 'Online' : `Last seen ${selectedChat.time}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Start Audio Call">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Start Video Call">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Share Screen">
                        <Monitor className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    Re: {selectedChat.job}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gray-50">
                  <div className="space-y-4 max-w-3xl mx-auto break-words">
                    {selectedChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${msg.sender === 'me' ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-2xl px-4 py-2.5 break-words ${
                            msg.sender === 'me' 
                              ? 'bg-black text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                            {msg.file_url && (
                              <img src={msg.file_url} alt="Attached file" className="max-w-full h-auto rounded-lg mt-2" />
                            )}
                          </div>
                          <div className={`text-xs text-gray-500 mt-1 ${
                            msg.sender === 'me' ? 'text-right' : 'text-left'
                          }`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload-message"
                      className="hidden"
                      onChange={handleFileAttach}
                    />
                    <label
                      htmlFor="file-upload-message"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </label>

                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      onPaste={handlePaste}
                      placeholder="Type a message or paste an image/file..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
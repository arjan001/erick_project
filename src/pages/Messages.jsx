import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistSidebar from '../components/ArtistSidebar';
import { Search, Send, MoreVertical, Paperclip, Phone, Video, Monitor, Star, Users, Plus, X, Download, Trash2, MessageSquareOff, Mic, MicOff, VideoOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Messages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock conversations - load from localStorage
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('studio22_conversations');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        contact_email: 'sarah.johnson@example.com',
        lastMessage: 'Looking forward to working with you on this project!',
        time: Date.now() - 2 * 60 * 1000,
        unread: 2,
        online: true,
        job: 'VFX Artist needed for Branding',
        type: 'client',
        isFavorite: false,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'Hi! I saw your application for the VFX Artist position.', time: '10:30 AM', timestamp: Date.now() - 2 * 60 * 1000 - 10 * 60 * 1000 },
          { id: 2, sender: 'me', text: 'Hello! Yes, I\'m very interested in this opportunity.', time: '10:32 AM', timestamp: Date.now() - 2 * 60 * 1000 - 8 * 60 * 1000 },
          { id: 3, sender: 'them', text: 'Great! Can you tell me more about your experience with particle effects?', time: '10:35 AM', timestamp: Date.now() - 2 * 60 * 1000 - 5 * 60 * 1000 },
          { id: 4, sender: 'me', text: 'Of course! I\'ve worked on several commercial projects creating abstract particle effects and motion graphics.', time: '10:38 AM', timestamp: Date.now() - 2 * 60 * 1000 - 2 * 60 * 1000 },
          { id: 5, sender: 'them', text: 'Looking forward to working with you on this project!', time: '10:40 AM', timestamp: Date.now() - 2 * 60 * 1000 },
        ]
      },
      {
        id: 2,
        name: 'Mike Rodriguez',
        avatar: 'https://i.pravatar.cc/150?img=12',
        contact_email: 'mike.rodriguez@example.com',
        lastMessage: 'Can you send me your portfolio?',
        time: Date.now() - 60 * 60 * 1000,
        unread: 0,
        online: true,
        job: 'Director needed for Commercial',
        type: 'client',
        isFavorite: true,
        isGroup: false,
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
        contact_email: 'emma.chen@example.com',
        lastMessage: 'The shoot is scheduled for next Monday',
        time: Date.now() - 2 * 60 * 60 * 1000,
        unread: 0,
        online: false,
        job: 'Cinematographer for Music Video',
        type: 'artist',
        isFavorite: false,
        isGroup: false,
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
        contact_email: 'alex.martinez@example.com',
        lastMessage: 'What\'s your rate for this project?',
        time: Date.now() - 3 * 60 * 60 * 1000,
        unread: 1,
        online: false,
        job: 'Editor needed for Documentary',
        type: 'team',
        isFavorite: false,
        isGroup: false,
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
        contact_email: 'lisa.wong@example.com',
        lastMessage: 'Perfect, let\'s schedule a call',
        time: Date.now() - 24 * 60 * 60 * 1000,
        unread: 0,
        online: true,
        job: 'Motion Designer for Social Media',
        type: 'artist',
        isFavorite: true,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'Your motion graphics work is impressive!', time: 'Yesterday' },
          { id: 2, sender: 'me', text: 'Thank you! I\'d love to discuss the project.', time: 'Yesterday' },
          { id: 3, sender: 'them', text: 'Perfect, let\'s schedule a call', time: 'Yesterday' },
        ]
      },
      {
        id: 6,
        name: 'David Kim',
        avatar: 'https://i.pravatar.cc/150?img=14',
        contact_email: 'david.kim@example.com',
        lastMessage: 'When can we start the project?',
        time: Date.now() - 26 * 60 * 60 * 1000,
        unread: 0,
        online: true,
        job: 'Sound Designer for Short Film',
        type: 'client',
        isFavorite: false,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'Hi! Your sound design portfolio is amazing.', time: 'Yesterday' },
          { id: 2, sender: 'me', text: 'Thanks! Happy to discuss the project.', time: 'Yesterday' },
          { id: 3, sender: 'them', text: 'When can we start the project?', time: 'Yesterday' },
        ]
      },
      {
        id: 7,
        name: 'Rachel Green',
        avatar: 'https://i.pravatar.cc/150?img=10',
        contact_email: 'rachel.green@example.com',
        lastMessage: 'Looking forward to the shoot!',
        time: Date.now() - 2 * 24 * 60 * 60 * 1000,
        unread: 0,
        online: false,
        job: 'Photographer for Brand Campaign',
        type: 'team',
        isFavorite: false,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'Your photography style is exactly what we need.', time: '2 days ago' },
          { id: 2, sender: 'me', text: 'Glad to hear! Let\'s make it happen.', time: '2 days ago' },
          { id: 3, sender: 'them', text: 'Looking forward to the shoot!', time: '2 days ago' },
        ]
      },
      {
        id: 8,
        name: 'James Wilson',
        avatar: 'https://i.pravatar.cc/150?img=15',
        contact_email: 'james.wilson@example.com',
        lastMessage: 'The budget looks good',
        time: Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000,
        unread: 0,
        online: true,
        job: 'Producer for Feature Film',
        type: 'artist',
        isFavorite: false,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'We need an experienced producer.', time: '2 days ago' },
          { id: 2, sender: 'me', text: 'I have 10 years in feature production.', time: '2 days ago' },
          { id: 3, sender: 'them', text: 'The budget looks good', time: '2 days ago' },
        ]
      },
      {
        id: 9,
        name: 'Sophie Anderson',
        avatar: 'https://i.pravatar.cc/150?img=20',
        contact_email: 'sophie.anderson@example.com',
        lastMessage: 'Script revisions are ready',
        time: Date.now() - 3 * 24 * 60 * 60 * 1000,
        unread: 0,
        online: false,
        job: 'Screenwriter for TV Series',
        type: 'client',
        isFavorite: false,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'We loved your previous work.', time: '3 days ago' },
          { id: 2, sender: 'me', text: 'Excited to collaborate on this.', time: '3 days ago' },
          { id: 3, sender: 'them', text: 'Script revisions are ready', time: '3 days ago' },
        ]
      },
      {
        id: 10,
        name: 'Tom Harris',
        avatar: 'https://i.pravatar.cc/150?img=33',
        contact_email: 'tom.harris@example.com',
        lastMessage: 'Let\'s discuss the timeline',
        time: Date.now() - 3 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000,
        unread: 0,
        online: true,
        job: 'Art Director for Ad Campaign',
        type: 'team',
        isFavorite: false,
        isGroup: false,
        messages: [
          { id: 1, sender: 'them', text: 'Your art direction is impressive.', time: '3 days ago' },
          { id: 2, sender: 'me', text: 'Thank you! What\'s the scope?', time: '3 days ago' },
          { id: 3, sender: 'them', text: 'Let\'s discuss the timeline', time: '3 days ago' },
        ]
      },
    ];
  });

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
    if (selectedChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    localStorage.setItem('studio22_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const toggleFavorite = (convId) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === convId ? { ...conv, isFavorite: !conv.isFavorite } : conv
    );
    setConversations(updatedConversations);
  };

  const handleScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false
      });
      
      const newCall = activeCall ? {
        ...activeCall,
        screenStream: stream,
        isScreenSharing: true
      } : {
        type: 'screenshare',
        name: selectedChat.name,
        avatar: selectedChat.avatar,
        screenStream: stream,
        isScreenSharing: true,
        hasAudio: false,
        hasVideo: false
      };

      setActiveCall(newCall);

      stream.getVideoTracks()[0].onended = () => {
        if (activeCall?.hasAudio || activeCall?.hasVideo) {
          setActiveCall({ ...activeCall, screenStream: null, isScreenSharing: false });
        } else {
          setActiveCall(null);
        }
      };
    } catch (error) {
      console.log('Screen share cancelled or not supported');
    }
  };

  const toggleAudio = async () => {
    if (activeCall?.hasAudio) {
      if (activeCall.audioStream) {
        activeCall.audioStream.getTracks().forEach(track => track.stop());
      }
      setActiveCall({ ...activeCall, hasAudio: false, audioStream: null });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setActiveCall({ 
          ...activeCall, 
          hasAudio: true, 
          audioStream: stream,
          name: activeCall?.name || selectedChat.name,
          avatar: activeCall?.avatar || selectedChat.avatar
        });
      } catch (error) {
        console.log('Microphone access denied');
      }
    }
  };

  const toggleVideo = async () => {
    if (activeCall?.hasVideo) {
      if (activeCall.videoStream) {
        activeCall.videoStream.getTracks().forEach(track => track.stop());
      }
      setActiveCall({ ...activeCall, hasVideo: false, videoStream: null });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        setActiveCall({ 
          ...activeCall, 
          hasVideo: true, 
          videoStream: stream,
          name: activeCall?.name || selectedChat.name,
          avatar: activeCall?.avatar || selectedChat.avatar
        });
      } catch (error) {
        console.log('Camera access denied');
      }
    }
  };

  const createGroupChat = () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      setConfirmDialog({
        title: 'Invalid Group',
        message: 'Please enter a group name and select at least 2 members',
        type: 'alert',
        onConfirm: () => setConfirmDialog(null)
      });
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: groupName,
      avatar: 'https://i.pravatar.cc/150?img=50',
      contact_email: null,
      lastMessage: 'Group created',
      time: Date.now(),
      unread: 0,
      online: false,
      job: `${selectedMembers.length} members`,
      type: 'group',
      isFavorite: false,
      isGroup: true,
      members: selectedMembers,
      messages: [{
        id: 1,
        sender: 'system',
        text: `Group "${groupName}" created with ${selectedMembers.length} members`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      }]
    };

    setConversations([newGroup, ...conversations]);
    setSelectedChat(newGroup);
    setShowGroupModal(false);
    setGroupName('');
    setSelectedMembers([]);
  };

  const exportChat = () => {
    if (!selectedChat) return;
    const chatData = JSON.stringify(selectedChat, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${selectedChat.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowChatMenu(false);
  };

  const clearChat = () => {
    if (!selectedChat) return;
    setConfirmDialog({
      title: 'Clear Messages',
      message: `Are you sure you want to clear all messages with ${selectedChat.name}? This cannot be undone.`,
      type: 'confirm',
      onConfirm: () => {
        const updatedConversations = conversations.map(conv =>
          conv.id === selectedChat.id ? { ...conv, messages: [], lastMessage: '', time: Date.now() } : conv
        );
        setConversations(updatedConversations);
        setSelectedChat({ ...selectedChat, messages: [], lastMessage: '' });
        setShowChatMenu(false);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const deleteConversation = () => {
    if (!selectedChat) return;
    const message = selectedChat.isGroup 
      ? `Are you sure you want to delete the group "${selectedChat.name}"? This cannot be undone.`
      : `Are you sure you want to remove ${selectedChat.name} from your chats? This cannot be undone.`;
    
    setConfirmDialog({
      title: selectedChat.isGroup ? 'Delete Group' : 'Remove Chat',
      message: message,
      type: 'confirm',
      danger: true,
      onConfirm: () => {
        const updatedConversations = conversations.filter(conv => conv.id !== selectedChat.id);
        setConversations(updatedConversations);
        setSelectedChat(null);
        setShowChatMenu(false);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedChat.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: file.name,
            time: Date.now()
          };
        }
        return conv;
      }).sort((a, b) => {
        if (a.id === selectedChat.id) return -1;
        if (b.id === selectedChat.id) return 1;
        return 0;
      });
      
      setConversations(updatedConversations);
      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage]
      });
      event.target.value = null;

      // Optional: Save to database
      try {
        if (selectedChat.contact_email) {
          const conversationId = `${user.email}_${selectedChat.contact_email}`.split('').sort().join('');
          await base44.entities.Message.create({
            conversation_id: conversationId,
            sender_email: user.email,
            recipient_email: selectedChat.contact_email,
            text: file.name,
            file_url: file_url,
            file_name: file.name
          });
        }
      } catch (error) {
        console.log('Database save skipped:', error);
      }
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
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: Date.now()
            };
            
            const updatedConversations = conversations.map(conv => {
              if (conv.id === selectedChat.id) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: file.name,
                  time: Date.now()
                };
              }
              return conv;
            }).sort((a, b) => {
              if (a.id === selectedChat.id) return -1;
              if (b.id === selectedChat.id) return 1;
              return 0;
            });
            
            setConversations(updatedConversations);
            setSelectedChat({
              ...selectedChat,
              messages: [...selectedChat.messages, newMessage]
            });

            // Optional: Save to database
            try {
              if (selectedChat.contact_email) {
                const conversationId = `${user.email}_${selectedChat.contact_email}`.split('').sort().join('');
                await base44.entities.Message.create({
                  conversation_id: conversationId,
                  sender_email: user.email,
                  recipient_email: selectedChat.contact_email,
                  text: file.name,
                  file_url: file_url,
                  file_name: file.name
                });
              }
            } catch (error) {
              console.log('Database save skipped:', error);
            }
          } catch (error) {
            console.error('Error uploading pasted file:', error);
            alert('Failed to upload pasted file.');
          }
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedChat.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          time: Date.now()
        };
      }
      return conv;
    }).sort((a, b) => {
      if (a.id === selectedChat.id) return -1;
      if (b.id === selectedChat.id) return 1;
      return 0;
    });
    
    setConversations(updatedConversations);
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    });
    
    setMessageInput('');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Optional: Save to database
    try {
      if (selectedChat.contact_email) {
        const conversationId = `${user.email}_${selectedChat.contact_email}`.split('').sort().join('');
        await base44.entities.Message.create({
          conversation_id: conversationId,
          sender_email: user.email,
          recipient_email: selectedChat.contact_email,
          text: messageInput
        });
      }
    } catch (error) {
      console.log('Database save skipped:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.job.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterTab === 'all') return true;
    if (filterTab === 'favorites') return conv.isFavorite;
    if (filterTab === 'groups') return conv.isGroup;
    if (filterTab === 'clients') return conv.type === 'client';
    if (filterTab === 'teams') return conv.type === 'team';
    if (filterTab === 'artists') return conv.type === 'artist';
    return true;
  });

  const filteredMessages = selectedChat?.messages.filter(msg =>
    msg.text?.toLowerCase().includes(messageSearchQuery.toLowerCase())
  ) || [];

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      <ArtistSidebar />

      {/* Image Lightbox Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button 
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-light"
          >
            ×
          </button>
          <img 
            src={expandedImage} 
            alt="Expanded view" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              {confirmDialog.type === 'confirm' && (
                <button
                  onClick={confirmDialog.onCancel}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={confirmDialog.onConfirm}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                  confirmDialog.danger
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {confirmDialog.type === 'alert' ? 'OK' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Group Chat</h2>
              <button onClick={() => setShowGroupModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-400"
            />

            <p className="text-sm text-gray-600 mb-2">Select members:</p>
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {conversations.filter(c => !c.isGroup).map(conv => (
                <label key={conv.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(conv.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, conv.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== conv.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <img src={conv.avatar} alt={conv.name} className="w-8 h-8 rounded-full" />
                  <span className="text-sm text-gray-900">{conv.name}</span>
                </label>
              ))}
            </div>

            <button
              onClick={createGroupChat}
              className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Group ({selectedMembers.length} members)
            </button>
          </div>
        </div>
      )}

      {/* Active Call Modal */}
      {activeCall && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <img 
                src={activeCall.avatar} 
                alt={activeCall.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">{activeCall.name}</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                {activeCall.isScreenSharing && <span className="flex items-center gap-1"><Monitor className="w-4 h-4" /> Screen</span>}
                {activeCall.hasAudio && <span className="flex items-center gap-1"><Mic className="w-4 h-4" /> Audio</span>}
                {activeCall.hasVideo && <span className="flex items-center gap-1"><Video className="w-4 h-4" /> Video</span>}
                {!activeCall.isScreenSharing && !activeCall.hasAudio && !activeCall.hasVideo && <span>Connecting...</span>}
              </div>
            </div>

            <div className="mb-6 bg-gray-800 rounded-lg h-64 flex items-center justify-center">
              {activeCall.isScreenSharing && <Monitor className="w-16 h-16 text-gray-600" />}
              {activeCall.hasVideo && !activeCall.isScreenSharing && <Video className="w-16 h-16 text-gray-600" />}
              {activeCall.hasAudio && !activeCall.hasVideo && !activeCall.isScreenSharing && <Mic className="w-16 h-16 text-gray-600" />}
            </div>

            {/* Call Controls */}
            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-colors ${
                  activeCall.hasAudio 
                    ? 'bg-white text-gray-900 hover:bg-gray-200' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title={activeCall.hasAudio ? 'Mute' : 'Unmute'}
              >
                {activeCall.hasAudio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  activeCall.hasVideo 
                    ? 'bg-white text-gray-900 hover:bg-gray-200' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title={activeCall.hasVideo ? 'Stop Video' : 'Start Video'}
              >
                {activeCall.hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={handleScreenShare}
                className={`p-4 rounded-full transition-colors ${
                  activeCall.isScreenSharing 
                    ? 'bg-white text-gray-900 hover:bg-gray-200' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title={activeCall.isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              >
                <Monitor className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  if (activeCall.screenStream) {
                    activeCall.screenStream.getTracks().forEach(track => track.stop());
                  }
                  if (activeCall.audioStream) {
                    activeCall.audioStream.getTracks().forEach(track => track.stop());
                  }
                  if (activeCall.videoStream) {
                    activeCall.videoStream.getTracks().forEach(track => track.stop());
                  }
                  setActiveCall(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
              >
                <Phone className="w-5 h-5 rotate-135" />
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="fixed inset-0 flex bg-white pl-20">
        <div className="flex-1 flex h-full overflow-hidden">
          {/* Conversations List */}
          <div className="w-96 border-r border-gray-200 flex flex-col h-full bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or start a new chat"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
                  title="Create Group Chat"
                >
                  <Users className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {['all', 'favorites', 'clients', 'teams', 'artists', 'groups'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      filterTab === tab
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors relative group ${
                    selectedChat?.id === conv.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(conv.id);
                    }}
                    className="absolute top-4 right-4 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Star className={`w-4 h-4 ${conv.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </button>
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
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{conv.name}</span>
                          {conv.type && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              conv.type === 'client' ? 'bg-blue-100 text-blue-700' :
                              conv.type === 'artist' ? 'bg-purple-100 text-purple-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {conv.type}
                            </span>
                          )}
                          {conv.isGroup && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                              group
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatTimestamp(conv.time)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 truncate">{conv.job}</p>
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
          <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
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
                      <button 
                        onClick={() => setActiveCall({ type: 'audio', name: selectedChat.name, avatar: selectedChat.avatar, hasAudio: false, hasVideo: false, isScreenSharing: false })}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" 
                        title="Start Call"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setActiveCall({ type: 'video', name: selectedChat.name, avatar: selectedChat.avatar, hasAudio: false, hasVideo: false, isScreenSharing: false })}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" 
                        title="Start Video Call"
                      >
                        <Video className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleScreenShare}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" 
                        title="Share Screen"
                      >
                        <Monitor className="w-5 h-5" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setShowChatMenu(!showChatMenu)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {showChatMenu && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                            <button
                              onClick={exportChat}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Backup Chat
                            </button>
                            <button
                              onClick={clearChat}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <MessageSquareOff className="w-4 h-4" />
                              Clear Messages
                            </button>
                            <button
                              onClick={deleteConversation}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              {selectedChat?.isGroup ? 'Delete Group' : 'Remove Chat'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                      Re: {selectedChat.job}
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input
                        type="text"
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                      <div className="space-y-4 max-w-3xl mx-auto break-words">
                        {(messageSearchQuery ? filteredMessages : selectedChat.messages).map((msg) => (
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
                              <img 
                                src={msg.file_url} 
                                alt="Attached file" 
                                className="max-w-full h-auto rounded-lg mt-2 cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setExpandedImage(msg.file_url)}
                              />
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Hide default scrollbars */
        *:not(.custom-scrollbar)::-webkit-scrollbar {
          display: none;
        }
        
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .custom-scrollbar {
          -ms-overflow-style: auto;
          scrollbar-width: thin;
        }
      `}</style>
    </div>
  );
}
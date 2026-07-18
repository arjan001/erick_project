import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Message, Artist, Team, ProjectOwner, Backer } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';
import { Search, Send, Plus, X, Trash2, Archive, ArchiveRestore, Inbox, ArrowLeft, LogOut, MoreVertical, Star, Edit, Mic, Paperclip } from 'lucide-react';
import { confirmDialog } from '@/lib/sweetAlert';
import notificationService from '@/shared/services/notificationService';
import subscriptionService from '@/shared/services/subscriptionService';
import { uploadFile, deleteFile } from '@/lib/fileUploadService';

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
    const artists = await Artist.filter({ email });
    if (artists.length > 0) {
      const a = artists[0];
      const tags = [a.role, ...(a.skills_experience || []).slice(0, 2).map(s => s.skill)].filter(Boolean).slice(0, 3);
      return { name: a.full_name, avatar: a.profile_photo_url, type: 'Artist', tags, lastActive: a.last_active };
    }
    const teams = await Team.filter({ contact_email: email });
    if (teams.length > 0) {
      const t = teams[0];
      return { name: t.team_name, avatar: t.team_logo_url, type: 'Team', tags: (t.specialties || []).slice(0, 2), lastActive: t.last_active };
    }
    const owners = await ProjectOwner.filter({ email });
    if (owners.length > 0) {
      const o = owners[0];
      return { name: o.full_name, avatar: o.profile_photo_url, type: 'Client', tags: [], lastActive: o.last_active };
    }
    const backers = await Backer.filter({ contact_email: email });
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
  const [searchParams] = useSearchParams();
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
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const conversationsListRef = useRef(null);
  const messagesListRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const buildConversations = (all) => {
    const grouped = {};
    all.forEach(m => {
      if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
      grouped[m.conversation_id].push(m);
    });

    return Object.entries(grouped).map(([id, msgs]) => {
      const sorted = msgs.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const last = sorted[sorted.length - 1];
      const otherEmail = sorted.find(m => m.sender_email !== user.email)?.sender_email
        || sorted.find(m => m.recipient_email !== user.email)?.recipient_email;
      return {
        id,
        otherEmail,
        messages: sorted,
        lastMessage: last?.text || last?.file_name || '',
        lastMessageTime: last?.created_at,
        isArchived: sorted.every(m => m.is_archived),
      };
    }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  };

  const fetchConversations = async () => {
    try {
      const [sent, received] = await Promise.all([
        Message.filter({ sender_email: user.email }, '-created_at', 500),
        Message.filter({ recipient_email: user.email }, '-created_at', 500),
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
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  // Handle ?with= query parameter to automatically open chat with specific person
  useEffect(() => {
    const withEmail = searchParams.get('with');
    if (withEmail && user) {
      const conversationId = getConversationId(user.email, withEmail);
      
      // First check if conversation already exists
      const existing = conversations.find(c => c.id === conversationId);
      if (existing) {
        setSelectedId(conversationId);
        return;
      }
      
      // If not, create new conversation and select it
      enrichParticipant(withEmail).then(info => {
        setConversations(prev => {
          // Check again in case it was added while fetching
          if (prev.some(c => c.id === conversationId)) {
            setSelectedId(conversationId);
            return prev;
          }
          const newConv = {
            id: conversationId,
            otherEmail: withEmail,
            name: info.name,
            avatar: info.avatar,
            type: info.type,
            tags: info.tags,
            lastActive: info.lastActive,
            messages: [],
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            isArchived: false,
          };
          setSelectedId(conversationId);
          return [newConv, ...prev];
        });
      });
    }
  }, [searchParams, user]);

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
        lastMessageTime: m.created_at,
        isArchived: false,
      };
      const rest = prev.filter((_, i) => i !== idx);
      return [updatedConv, ...rest];
    });

    const exists = conversationsRef.current.some(c => c.id === m.conversation_id);
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
          lastMessageTime: m.created_at,
          isArchived: false,
          ...info,
        }, ...prev];
      });
    }
  };

  // Keep a ref of conversations so the polling callback always sees the latest state
  const conversationsRef = useRef([]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // Poll for new messages instead of using subscribe (subscribe doesn't work with current setup)
  useEffect(() => {
    if (!user) return;

    const pollMessages = async () => {
      try {
        const [sent, received] = await Promise.all([
          Message.filter({ sender_email: user.email }, '-created_at', 50),
          Message.filter({ recipient_email: user.email }, '-created_at', 50),
        ]);
        const allMessages = [...sent, ...received];
        const convs = buildConversations(allMessages);

        // Check for new messages and apply them
        const currentConvIds = new Set(conversationsRef.current.map(c => c.id));
        const newConvIds = new Set(convs.map(c => c.id));

        // If there are new conversations or messages, refetch
        if (convs.length !== conversationsRef.current.length ||
            !convs.every(c => currentConvIds.has(c.id))) {
          await fetchConversations();
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(pollMessages, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, conversations]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const getUnreadCount = (conv) => conv.messages.filter(m => m.recipient_email === user.email && !m.is_read).length;

  // Mark all unread messages in the opened conversation as read — mirrors WhatsApp: badge clears the moment you open the chat
  useEffect(() => {
    if (!selectedConversation) return;
    const unread = selectedConversation.messages.filter(m => m.recipient_email === user.email && !m.is_read);
    if (unread.length === 0) return;
    setConversations(prev => prev.map(c => c.id === selectedConversation.id
      ? { ...c, messages: c.messages.map(m => (m.recipient_email === user.email && !m.is_read) ? { ...m, is_read: true } : m) }
      : c));
    Promise.all(unread.map(m => Message.update(m.id, { is_read: true }))).catch(err => {
      console.error('Error marking messages as read:', err);
    });
  }, [selectedId]);

  const handleSend = async () => {
    if ((!messageInput.trim() && !attachedFile) || !selectedConversation) return;
    
    // Check subscription limits before sending
    const limitCheck = await subscriptionService.checkLimit(user.email, 'message');
    if (!limitCheck.allowed) {
      error('Limit Reached', limitCheck.expired 
        ? 'Your subscription has expired. Please renew to continue sending messages.'
        : 'You have reached your monthly message limit. Upgrade to send more messages.');
      return;
    }

    const text = messageInput;
    const file = attachedFile;
    setMessageInput('');
    setAttachedFile(null);
    const tempId = `temp-${Date.now()}`;

    // Handle file upload if present
    let attachmentData = null;
    if (file) {
      const uploadResult = await uploadFile(file, 'message-attachments', `conversations/${selectedConversation.id}`);
      if (uploadResult.error) {
        error('Upload Failed', uploadResult.error);
        setMessageInput(text);
        setAttachedFile(file);
        return;
      }
      attachmentData = uploadResult.data;
    }

    const optimisticMsg = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_email: user.email,
      recipient_email: selectedConversation.otherEmail,
      text,
      attachment: attachmentData,
      created_at: new Date().toISOString(),
    };
    // Optimistic update — instant, no waiting on the network for the UI to feel responsive
    setConversations(prev => prev.map(c => c.id === selectedConversation.id
      ? { ...c, messages: [...c.messages, optimisticMsg], lastMessage: text, lastMessageTime: optimisticMsg.created_at }
      : c));
    try {
      const created = await Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        recipient_email: selectedConversation.otherEmail,
        text,
        attachment: attachmentData,
      });
      // Replace temp message with the real saved one
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.map(msg => msg.id === tempId ? created : msg) }
        : c));
      // Refetch from DB to guarantee the message is persisted and visible after reload
      await fetchConversations();
      
      // Track usage and notify if approaching limit
      await subscriptionService.trackUsage(user.email, 'message');
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
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File too large', 'Maximum file size is 10MB');
      e.target.value = null;
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/zip', 'audio/mpeg', 'audio/mp3', 'audio/wav'];
    if (!allowedTypes.includes(file.type)) {
      error('Invalid file type', 'Allowed types: images, PDF, ZIP, MP3, WAV');
      e.target.value = null;
      return;
    }

    setAttachedFile(file);
    e.target.value = null;
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachedFile(audioFile);
        setRecordingTime(0);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      error('Recording Failed', 'Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleArchive = async (conv, archive) => {
    try {
      await Promise.all(conv.messages.map(m => Message.update(m.id, { is_archived: archive })));
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
      await Promise.all(conv.messages.map(m => Message.delete(m.id)));
      success('Deleted', 'Conversation deleted');
      if (selectedId === conv.id) setSelectedId(null);
      setConversations(prev => prev.filter(c => c.id !== conv.id));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      error('Failed', 'Failed to delete conversation');
    }
  };

  const handleDeleteMessage = async (msg, deleteType = 'me') => {
    const confirmText = deleteType === 'everyone' 
      ? 'Delete for everyone? This will remove the message for all participants.' 
      : 'Delete for you? This will only remove the message from your view.';
    const confirmed = await confirmDialog('Delete message?', confirmText, 'Yes, delete it');
    if (!confirmed) return;
    try {
      if (deleteType === 'everyone') {
        // Mark as deleted for everyone
        await Message.update(msg.id, { deleted_for_everyone: true, text: 'This message was deleted' });
        setConversations(prev => prev.map(c => c.id === selectedConversation.id
          ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, deleted_for_everyone: true, text: 'This message was deleted' } : m) }
          : c));
      } else {
        // Delete only for current user (soft delete - add to deleted_for array)
        await Message.update(msg.id, { deleted_for: [...(msg.deleted_for || []), user.email] });
        setConversations(prev => prev.map(c => c.id === selectedConversation.id
          ? { ...c, messages: c.messages.filter(m => m.id !== msg.id) }
          : c));
      }
      setShowMessageMenu(null);
      success('Deleted', deleteType === 'everyone' ? 'Message deleted for everyone' : 'Message deleted for you');
    } catch (err) {
      console.error('Error deleting message:', err);
      error('Failed', 'Failed to delete message');
    }
  };

  const handleEditMessage = async (msg) => {
    const newText = prompt('Edit message:', msg.text);
    if (newText === null || newText.trim() === '') return;
    try {
      await Message.update(msg.id, { text: newText });
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, text: newText } : m) }
        : c));
      setShowMessageMenu(null);
      success('Edited', 'Message updated');
    } catch (err) {
      console.error('Error editing message:', err);
      error('Failed', 'Failed to edit message');
    }
  };

  const handleStarMessage = async (msg) => {
    try {
      await Message.update(msg.id, { is_starred: !msg.is_starred });
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, is_starred: !m.is_starred } : m) }
        : c));
      setShowMessageMenu(null);
      success(msg.is_starred ? 'Unstarred' : 'Starred', `Message ${msg.is_starred ? 'unstarred' : 'starred'}`);
    } catch (err) {
      console.error('Error starring message:', err);
      error('Failed', 'Failed to star message');
    }
  };

  const openDirectory = async () => {
    setShowNewChatModal(true);
    try {
      const [artists, teams, owners, backers] = await Promise.all([
        Artist.list(),
        Team.list(),
        ProjectOwner.list(),
        Backer.list(),
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

  // Virtual scrolling for conversation list
  const conversationsVirtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => conversationsListRef.current,
    estimateSize: () => 100, // Estimated height of each conversation item
    overscan: 5,
  });

  // Virtual scrolling for message history
  const messagesVirtualizer = useVirtualizer({
    count: selectedConversation?.messages.length || 0,
    getScrollElement: () => messagesListRef.current,
    estimateSize: () => 60, // Estimated height of each message
    overscan: 5,
  });

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

        <div ref={conversationsListRef} className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              {filterTab === 'archived' ? 'No archived conversations' : 'No conversations yet — start a new chat'}
            </div>
          )}
          <div style={{ height: `${conversationsVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {conversationsVirtualizer.getVirtualItems().map((virtualItem) => {
              const conv = filteredConversations[virtualItem.index];
              return (
                <div
                  key={conv.id}
                  ref={conversationsVirtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
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
                        <span className={`text-sm text-gray-900 truncate ${getUnreadCount(conv) > 0 ? 'font-bold' : 'font-semibold'}`}>{conv.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString() : ''}</span>
                      </div>
                      <ParticipantTags type={conv.type} tags={conv.tags} />
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${getUnreadCount(conv) > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{conv.lastMessage || 'No messages yet'}</p>
                        {getUnreadCount(conv) > 0 && (
                          <span className="ml-2 flex-shrink-0 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                            {getUnreadCount(conv) > 9 ? '9+' : getUnreadCount(conv)}
                          </span>
                        )}
                      </div>
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
              );
            })}
          </div>
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

            <div ref={messagesListRef} className="flex-1 overflow-y-auto p-3 bg-[#efeae2]">
              <div className="max-w-2xl mx-auto">
                {selectedConversation.messages.length === 0 && (
                  <div className="text-center text-sm text-gray-400 py-10">Send a message to start the conversation</div>
                )}
                <div style={{ height: `${messagesVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                  {messagesVirtualizer.getVirtualItems().map((virtualItem) => {
                    const msg = selectedConversation.messages[virtualItem.index];
                    return (
                      <div
                        key={msg.id}
                        ref={messagesVirtualizer.measureElement}
                        data-index={virtualItem.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[280px] sm:max-w-[320px] rounded-lg px-2.5 py-1.5 relative group ${
                            msg.sender_email === user.email 
                              ? 'bg-[#dcf8c6] text-gray-900' 
                              : 'bg-white text-gray-900 shadow-sm'
                          }`}
                          onMouseEnter={() => setHoveredMessageId(msg.id)}
                          onMouseLeave={() => setHoveredMessageId(null)}
                        >
                          {msg.text && <p className="text-sm break-words leading-tight pr-12">{msg.text}</p>}
                          <div className={`absolute bottom-1 right-2 flex items-center gap-1 ${hoveredMessageId === msg.id ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                            <span className="text-[10px] text-gray-500">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id);
                              }}
                              className="p-0.5 hover:bg-gray-200 rounded"
                            >
                              <MoreVertical className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                          {showMessageMenu === msg.id && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 flex flex-col min-w-[100px]">
                              {msg.sender_email === user.email && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditMessage(msg); }}
                                  className="px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-3 h-3" /> Edit
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStarMessage(msg); }}
                                className="px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Star className="w-3 h-3" /> Star
                              </button>
                              {msg.sender_email === user.email && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg, 'me'); }}
                                    className="px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete for me
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg, 'everyone'); }}
                                    className="px-3 py-1.5 text-xs text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete for everyone
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              {/* Attachment preview */}
              {attachedFile && (
                <div className="mb-3 flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                  <div className="flex-1 flex items-center gap-2">
                    {attachedFile.type.startsWith('image/') ? (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        📷
                      </div>
                    ) : attachedFile.type.startsWith('audio/') ? (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        🎵
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        📎
                      </div>
                    )}
                    <span className="text-xs text-gray-700 truncate flex-1">{attachedFile.name}</span>
                  </div>
                  <button onClick={handleRemoveAttachment} className="p-1 hover:bg-gray-200 rounded">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* File attachment button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileAttach}
                  className="hidden"
                  accept="image/*,.pdf,.zip,audio/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Recording button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2.5 rounded-lg ${isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`}
                  title={isRecording ? 'Stop recording' : 'Record audio'}
                >
                  {isRecording ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      <span className="text-xs font-medium">{formatRecordingTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Message input */}
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  disabled={isRecording}
                />

                {/* Send button */}
                <button 
                  onClick={handleSend} 
                  disabled={!messageInput.trim() && !attachedFile}
                  className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
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
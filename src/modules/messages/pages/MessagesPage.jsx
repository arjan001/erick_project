import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Message, Conversation, Artist, Team, Client, Backer, Notification, Subscription } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { formatDistanceToNow } from 'date-fns'
import { Search, Send, Plus, X, MoreVertical, Mic, Paperclip, Smile, Phone, Video, Archive, Check, CheckCheck, Pause, Square, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/fileUploadService'

const ONLINE_THRESHOLD_MS = 90 * 1000

const isOnline = (lastActive) => lastActive && (Date.now() - new Date(lastActive).getTime()) < ONLINE_THRESHOLD_MS

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

async function enrichParticipant(userId) {
  try {
    const artists = await Artist.filter({ user_id: userId })
    if (artists.length > 0) {
      const a = artists[0]
      const tags = [a.profession, ...(a.skills || []).slice(0, 2)].filter(Boolean).slice(0, 3)
      return { name: a.display_name || a.stage_name || a.email, avatar: a.profile_photo_url, type: 'Artist', tags, lastActive: a.last_active }
    }
    const teams = await Team.filter({ user_id: userId })
    if (teams.length > 0) {
      const t = teams[0]
      return { name: t.team_name, avatar: t.logo_url, type: 'Team', tags: (t.specialties || []).slice(0, 2), lastActive: t.last_active }
    }
    const clients = await Client.filter({ user_id: userId })
    if (clients.length > 0) {
      const c = clients[0]
      return { name: c.company_name || c.display_name, avatar: c.logo_url, type: 'Client', tags: [], lastActive: c.last_active }
    }
    const backers = await Backer.filter({ user_id: userId })
    if (backers.length > 0) {
      const b = backers[0]
      return { name: b.organization_name, avatar: b.logo_url, type: 'Backer', tags: (b.investment_interests || []).slice(0, 2), lastActive: b.last_active }
    }
  } catch (e) {
    console.error('Error enriching participant:', e)
  }
  return { name: 'Unknown User', avatar: null, type: null, tags: [], lastActive: null }
}

const typeBadgeColor = {
  Artist: 'bg-indigo-100 text-indigo-700',
  Team: 'bg-purple-100 text-purple-700',
  Client: 'bg-amber-100 text-amber-700',
  Backer: 'bg-emerald-100 text-emerald-700',
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('active')
  const [messageInput, setMessageInput] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [directory, setDirectory] = useState([])
  const [directorySearch, setDirectorySearch] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const fetchConversations = async () => {
    try {
      const convData = await Conversation.getForUser(user.id)
      const enriched = await Promise.all(convData.map(async (c) => {
        const otherUserId = c.participant_1_id === user.id ? c.participant_2_id : c.participant_1_id
        const info = await enrichParticipant(otherUserId)
        return {
          id: c.id,
          otherUserId,
          messages: c.messages || [],
          lastMessage: c.messages?.[c.messages.length - 1]?.content || '',
          lastMessageTime: c.last_message_at || c.created_at,
          isArchived: false,
          ...info,
        }
      }))
      setConversations(enriched.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)))
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) fetchConversations(); }, [user])

  useEffect(() => {
    const withUserId = searchParams.get('with')
    if (withUserId && user) {
      Conversation.getOrCreate(user.id, withUserId).then(conv => {
        setSelectedId(conv.id)
        fetchConversations()
      }).catch(err => {
        console.error('Error getting conversation:', err)
        // Even if conversation creation fails, still try to fetch conversations
        fetchConversations()
      })
    }
  }, [searchParams, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId, conversations])

  const selectedConversation = conversations.find(c => c.id === selectedId)

  const handleSend = async () => {
    if (!messageInput.trim() && !attachedFile) return
    if (!selectedConversation) return

    // Check subscription for clients
    if (user.role === 'client' || user.role === 'project_owner') {
      try {
        const subscriptions = await Subscription.filter({ user_id: user.id, status: 'active' })
        if (!subscriptions || subscriptions.length === 0) {
          error('Subscription Required', 'You need an active subscription to send messages.')
          return
        }
      } catch (err) {
        console.error('Error checking subscription:', err)
      }
    }

    const text = messageInput
    setMessageInput('')
    const tempId = `temp-${Date.now()}`

    let attachmentData = null
    if (attachedFile) {
      const uploadResult = await uploadFile(attachedFile, 'message-attachments', `conversations/${selectedConversation.id}`)
      if (uploadResult.error) {
        error('Upload Failed', uploadResult.error)
        setMessageInput(text)
        setAttachedFile(attachedFile)
        return
      }
      attachmentData = uploadResult.data
    }

    const optimisticMsg = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      content: text,
      attachment: attachmentData,
      created_at: new Date().toISOString(),
    }

    setConversations(prev => prev.map(c => c.id === selectedConversation.id
      ? { ...c, messages: [...c.messages, optimisticMsg], lastMessage: text, lastMessageTime: optimisticMsg.created_at }
      : c))

    try {
      const created = await Message.create({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: text,
        attachment: attachmentData,
      })
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.map(msg => msg.id === tempId ? created : msg) }
        : c))
      await fetchConversations()
    } catch (err) {
      console.error('Error sending message:', err)
      error('Failed', 'Failed to send message')
      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: c.messages.filter(msg => msg.id !== tempId) }
        : c))
    }
  }

  const handleFileAttach = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      error('File too large', 'Maximum file size is 10MB')
      return
    }
    setAttachedFile(file)
    e.target.value = null
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks = []
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' })
        setAttachedFile(audioFile)
        setIsRecording(false)
        setIsPaused(false)
        setRecordingTime(0)
        if (timerInterval) {
          clearInterval(timerInterval)
          setTimerInterval(null)
        }
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setTimerInterval(timer)
    } catch (err) {
      error('Microphone Error', 'Could not access microphone')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setTimerInterval(timer)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }
    }
  }

  const deleteRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAttachedFile(null)
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = filterTab === 'active' ? !c.isArchived : c.isArchived
    return matchesSearch && matchesTab
  })

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => setFilterTab('active')}
              className={`text-sm font-medium ${filterTab === 'active' ? 'text-black' : 'text-gray-500'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab('archived')}
              className={`text-sm font-medium ${filterTab === 'archived' ? 'text-black' : 'text-gray-500'}`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No conversations found
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedId === conv.id ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-gray-600">{conv.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    {isOnline(conv.lastActive) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500">
                        {conv.lastMessageTime ? formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {conv.type && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeBadgeColor[conv.type] || 'bg-gray-100 text-gray-600'}`}>
                          {conv.type}
                        </span>
                      )}
                      {conv.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">
                          {String(tag).replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedConversation.avatar ? (
                    <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-gray-600">{selectedConversation.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                {isOnline(selectedConversation.lastActive) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{selectedConversation.name}</h2>
                <p className="text-xs text-gray-500">
                  {isOnline(selectedConversation.lastActive) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-3">
              {selectedConversation.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_id === user.id
                      ? 'bg-[#dcf8c6] text-gray-900'
                      : 'bg-white text-gray-900'
                      }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.attachment && (
                      <div className="mt-2">
                        {msg.attachment.file_type?.startsWith('image/') ? (
                          <img src={msg.attachment.url} alt="attachment" className="max-w-full rounded-lg" />
                        ) : (
                          <a href={msg.attachment.url} download className="text-blue-600 text-sm flex items-center gap-1">
                            <Paperclip className="w-4 h-4" />
                            {msg.attachment.file_name}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender_id === user.id && (
                        msg.is_read ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {attachedFile && (
              <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center gap-3">
                {attachedFile.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(attachedFile)} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ) : attachedFile.type.startsWith('video/') ? (
                  <video src={URL.createObjectURL(attachedFile)} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <span className="text-sm text-gray-600">{attachedFile.name}</span>
                  <span className="text-xs text-gray-400 block">{formatFileSize(attachedFile.size)}</span>
                </div>
                <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttach}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              {isRecording ? (
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                  <span className="text-sm font-medium text-red-600 animate-pulse">
                    {formatRecordingTime(recordingTime)}
                  </span>
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {isPaused ? <Mic className="w-4 h-4 text-gray-600" /> : <Pause className="w-4 h-4 text-gray-600" />}
                  </button>
                  <button
                    onClick={deleteRecording}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                  <button
                    onClick={stopRecording}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Square className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSend}
                disabled={!messageInput.trim() && !attachedFile}
                className="p-2 bg-[#128c7e] hover:bg-[#075e54] rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-4xl">💬</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
            <p className="text-gray-500">Choose a conversation from the left to start chatting</p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
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
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-gray-400"
            />
            <div className="flex-1 overflow-y-auto space-y-1">
              {directory.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-6">Start typing to search...</div>
              ) : (
                directory.map(p => (
                  <button
                    key={p.email}
                    onClick={() => {
                      Conversation.getOrCreate(user.id, p.email).then(conv => {
                        setSelectedId(conv.id)
                        setShowNewChatModal(false)
                        fetchConversations()
                      })
                    }}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-gray-600">{p.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      {isOnline(p.lastActive) && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                      {p.type && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeBadgeColor[p.type] || 'bg-gray-100 text-gray-600'}`}>
                          {p.type}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

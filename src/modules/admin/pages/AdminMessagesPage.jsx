import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { MessageSquare, Search, Send, Trash2, User, Plus, X, Paperclip, Clock, CheckCircle2 } from 'lucide-react'

export default function AdminMessagesPage() {
  const { user } = useAuth()
  const { error } = useToast()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [attachments, setAttachments] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const fileInputRef = useRef(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      // Fetch conversations with participant info
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:users!conversations_participant_1_fkey(id, email, full_name, avatar_url, last_seen),
          participant_2:users!conversations_participant_2_fkey(id, email, full_name, avatar_url, last_seen)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (convError) throw convError

      // Fetch messages for each conversation
      const conversationsWithMessages = await Promise.all(
        (convs || []).map(async (conv) => {
          const { data: msgs, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true })

          if (msgError) throw msgError

          const lastMessage = msgs[msgs.length - 1]
          const otherParticipant = conv.participant_1.id === user?.id ? conv.participant_2 : conv.participant_1

          return {
            id: conv.id,
            messages: msgs || [],
            lastMessage: lastMessage?.content || '',
            lastMessageTime: lastMessage?.created_at || conv.created_at,
            participant: otherParticipant.email,
            participantName: otherParticipant.full_name,
            participantId: otherParticipant.id,
            participantAvatar: otherParticipant.avatar_url,
            participantLastSeen: otherParticipant.last_seen,
          }
        })
      )

      setConversations(conversationsWithMessages)
    } catch (err) {
      console.error('Error fetching messages:', err)
      error('Error', 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, avatar_url, last_seen')
        .neq('id', user?.id)

      if (error) throw error
      setAllUsers(users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchAllUsers()
  }, [user])

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // Refresh conversations when new message arrives
        fetchMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const selectedConversation = conversations.find(c => c.id === selectedId)

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return
    if (!selectedConversation) return
    setSending(true)
    try {
      // Sanitize message
      const sanitizeInput = (input) => {
        return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim()
      }
      const sanitizedMessage = sanitizeInput(newMessage)

      // Upload attachments to Supabase Storage (only images)
      const attachmentUrls = []
      for (const file of attachments) {
        if (!file.type.startsWith('image/')) {
          error('Error', 'Only image files are currently supported')
          setSending(false)
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          error('Error', 'File size must be less than 5MB')
          setSending(false)
          return
        }

        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(fileName)

        attachmentUrls.push({
          url: publicUrl,
          type: file.type,
          name: file.name
        })
      }

      // Create message content with attachments
      let messageContent = sanitizedMessage
      if (attachmentUrls.length > 0) {
        const attachmentText = attachmentUrls.map(a => `[Image: ${a.url}]`).join('\n')
        messageContent = sanitizedMessage ? `${sanitizedMessage}\n\n${attachmentText}` : attachmentText
      }

      const { data: newMsg, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          content: messageContent,
        })
        .select()
        .single()

      if (sendError) throw sendError

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)

      setConversations(prev => prev.map(c => c.id === selectedConversation.id
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastMessageTime: newMsg.created_at }
        : c
      ))
      setNewMessage('')
      setAttachments([])
      // Success alert removed per user request
    } catch (err) {
      console.error('Error sending message:', err)
      error('Failed', 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return
    try {
      const conv = conversations.find(c => c.id === conversationId)
      await Promise.all(conv.messages.map(m => supabase.from('messages').delete().eq('id', m.id)))
      await supabase.from('conversations').delete().eq('id', conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (selectedId === conversationId) setSelectedId(null)
    } catch (err) {
      console.error('Error deleting conversation:', err)
      error('Failed', 'Failed to delete conversation')
    }
  }

  const handleStartConversation = async (targetUserId) => {
    try {
      const existing = conversations.find(c => c.participantId === targetUserId)
      if (existing) {
        setSelectedId(existing.id)
        setShowNewConversation(false)
        return
      }

      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user?.id,
          participant_2: targetUserId,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (convError) throw convError

      const targetUser = allUsers.find(u => u.id === targetUserId)
      setConversations(prev => [{
        id: newConv.id,
        messages: [],
        lastMessage: '',
        lastMessageTime: newConv.created_at,
        participant: targetUser.email,
        participantName: targetUser.full_name,
        participantId: targetUser.id,
        participantAvatar: targetUser.avatar_url,
        participantLastSeen: targetUser.last_seen,
      }, ...prev])

      setSelectedId(newConv.id)
      setShowNewConversation(false)
    } catch (err) {
      console.error('Error starting conversation:', err)
      error('Failed', 'Failed to start conversation')
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getUserStatus = (lastSeen) => {
    if (!lastSeen) return { text: 'Offline', color: 'bg-gray-400' }
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffMinutes = (now - lastSeenDate) / (1000 * 60)

    if (diffMinutes < 5) return { text: 'Active', color: 'bg-green-500' }
    if (diffMinutes < 60) return { text: `${Math.floor(diffMinutes)}m ago`, color: 'bg-yellow-500' }
    if (diffMinutes < 1440) return { text: `${Math.floor(diffMinutes / 60)}h ago`, color: 'bg-orange-500' }
    return { text: lastSeenDate.toLocaleDateString(), color: 'bg-gray-400' }
  }

  const filteredConversations = conversations.filter(c =>
    c.participant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = allUsers.filter(u =>
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="w-full sm:w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Admin Messages</h1>
            <Button onClick={() => setShowNewConversation(true)} size="sm" className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>
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
                <div className="relative">
                  {conversation.participantAvatar ? (
                    <img src={conversation.participantAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getUserStatus(conversation.participantLastSeen).color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-gray-900 truncate">{conversation.participantName || conversation.participant}</div>
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
                <div className="relative">
                  {selectedConversation.participantAvatar ? (
                    <img src={selectedConversation.participantAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getUserStatus(selectedConversation.participantLastSeen).color}`} />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{selectedConversation.participantName || selectedConversation.participant}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {getUserStatus(selectedConversation.participantLastSeen).text}
                    {typingUsers.has(selectedConversation.participantId) && (
                      <span className="text-green-600">• typing...</span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteConversation(selectedConversation.id)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map(msg => {
                const contentLines = msg.content.split('\n')
                const textContent = contentLines.filter(line => !line.startsWith('[') || !line.includes(']')).join('\n')
                const attachmentLines = contentLines.filter(line => line.startsWith('[') && line.includes(']'))

                return (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-lg p-3 ${msg.sender_id === user?.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {textContent && <div className="text-sm whitespace-pre-wrap">{textContent}</div>}
                      {attachmentLines.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {attachmentLines.map((line, idx) => {
                            const match = line.match(/\[(Image|Audio|File|Video): (.+)\]/)
                            if (match) {
                              const [, type, url] = match
                              if (type === 'Image') {
                                return (
                                  <img key={idx} src={url} alt="Attachment" className="max-w-full h-auto rounded" />
                                )
                              } else {
                                return (
                                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">
                                    <Paperclip className="w-4 h-4" />
                                    View {type.toLowerCase()}
                                  </a>
                                )
                              }
                            }
                            return null
                          })}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-gray-200">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700 max-w-[200px] truncate">{file.name}</span>
                      <button onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button onClick={handleSendMessage} disabled={sending} className="bg-black text-white hover:bg-gray-800">
                  {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
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

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Start New Conversation</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewConversation(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-full"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No users found</div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                  >
                    <div className="relative">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getUserStatus(u.last_seen).color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{u.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 truncate">{u.email}</div>
                      <div className="text-xs text-gray-400">{u.role}</div>
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

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Search, ChevronRight, Home, HelpCircle, Mail, Phone, User, MessageSquare, ArrowRight, Send, Check, Paperclip, Mic, Square, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'

const HELP_ARTICLES = [
  { title: 'Self-Tape Audition Requests', desc: 'How to submit and manage self-tape requests.' },
  { title: 'Working with Minors', desc: 'Guidelines and requirements for minor performers.' },
  { title: 'Subscriptions & Benefits', desc: 'Plans, connects, and premium features.' },
  { title: 'Posting a Project', desc: 'How to post a job and find talent.' },
  { title: 'Payment & Invoicing', desc: 'M-Pesa and payment processing details.' },
]

const ENQUIRY_TOPICS = [
  'General Inquiry',
  'Account Support',
  'Billing & Payments',
  'Technical Support',
  'Partnership',
  'Report Issue',
  'Feedback',
  'Other',
]

export default function ChatWidget() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [siteName, setSiteName] = useState('SmartGigs Kenya')

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'General Inquiry',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    setSiteName('SMARTGIGS')
  }, [])

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' })
        setAttachments(prev => [...prev, audioFile])
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      mediaRecorderRef.current._timer = timer
    } catch (err) {
      console.error('Error starting recording:', err)
      error('Error', 'Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      clearInterval(mediaRecorderRef.current._timer)
      setIsRecording(false)
    }
  }

  const deleteRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      clearInterval(mediaRecorderRef.current._timer)
    }
    setIsRecording(false)
    setRecordingTime(0)
    audioChunksRef.current = []
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    if (file.type.startsWith('video/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setSelectedArticle(null)
    if (tab === 'messages') {
      if (user) {
        navigate('/ClientMessages')
      } else {
        navigate('/SignIn')
      }
      setOpen(false)
    } else if (tab === 'home') {
      setShowContactForm(false)
    }
  }

  const handleContactSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      error('Error', 'Please fill in all required fields')
      return
    }

    // Sanitize inputs
    const sanitizeInput = (input) => {
      return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim()
    }

    const sanitizedName = sanitizeInput(formData.name)
    const sanitizedEmail = sanitizeInput(formData.email)
    const sanitizedPhone = sanitizeInput(formData.phone)
    const sanitizedMessage = sanitizeInput(formData.message)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      error('Error', 'Please enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      // Upload attachments to Supabase Storage (max 20MB)
      const attachmentUrls = []
      for (const file of attachments) {
        // Check file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          error('Error', 'File size must be less than 20MB')
          setSubmitting(false)
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

      // Create a conversation or message for admin
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user?.id || null,
          participant_2: null,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (convError) throw convError

      // Create message content with attachments
      let messageContent = `Contact Form Submission\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nPhone: ${sanitizedPhone}\nTopic: ${formData.topic}\n\nMessage:\n${sanitizedMessage}`

      if (attachmentUrls.length > 0) {
        const attachmentText = attachmentUrls.map(a => {
          if (a.type.startsWith('audio')) return `[Audio: ${a.url}]`
          if (a.type.startsWith('video')) return `[Video: ${a.url}]`
          if (a.type.startsWith('image')) return `[Image: ${a.url}]`
          return `[File: ${a.url}]`
        }).join('\n')
        messageContent += `\n\n${attachmentText}`
      }

      // Send the message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user?.id || null,
          content: messageContent,
        })

      if (msgError) throw msgError

      success('Sent', 'Your inquiry has been submitted. Our team will get back to you soon.')
      setShowContactForm(false)
      setFormStep(1)
      setFormData({ name: '', email: '', phone: '', topic: 'General Inquiry', message: '' })
      setAttachments([])
      setOpen(false)
    } catch (err) {
      console.error('Error submitting contact form:', err)
      error('Error', 'Failed to submit your inquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredArticles = HELP_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!open) {
    return (
      <button
        aria-label="Chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A962] text-black shadow-lg shadow-[#C9A962]/30 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 border-b border-gray-100">
        <span className="text-sm font-bold uppercase tracking-tight text-black">{siteName}</span>
        <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
          <X className="h-4 w-4 text-black" />
        </button>
      </div>

      {showContactForm ? (
        /* Multi-step Contact Form */
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
          {formStep === 1 && (
            <>
              <h3 className="text-lg font-semibold text-black mb-4">Tell us about yourself</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowContactForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button onClick={() => setFormStep(2)} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg flex items-center gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {formStep === 2 && (
            <>
              <h3 className="text-lg font-semibold text-black mb-4">What's your inquiry about?</h3>
              <div className="space-y-2">
                {ENQUIRY_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setFormData({ ...formData, topic })}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${formData.topic === topic
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <div className="flex justify-between gap-2 mt-6">
                <button onClick={() => setFormStep(1)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                  Back
                </button>
                <button onClick={() => setFormStep(3)} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg flex items-center gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {formStep === 3 && (
            <>
              <h3 className="text-lg font-semibold text-black mb-4">Tell us more</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="Describe your inquiry in detail..."
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (max 20MB each)</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,audio/*,video/*,.pdf"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      Add Files
                    </button>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-3 py-2 border rounded-lg text-sm flex items-center gap-2 ${isRecording ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {isRecording ? (
                        <span className="font-mono">{formatRecordingTime(recordingTime)}</span>
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                    {isRecording && (
                      <button
                        onClick={deleteRecording}
                        className="px-3 py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {attachments.map((file, index) => {
                        const previewUrl = getFilePreview(file)
                        return (
                          <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                            {previewUrl && (
                              <div className="mb-2">
                                {file.type.startsWith('image/') && (
                                  <img src={previewUrl} alt={file.name} className="max-w-full h-auto rounded max-h-32 object-cover" />
                                )}
                                {file.type.startsWith('video/') && (
                                  <video src={previewUrl} controls className="max-w-full h-auto rounded max-h-32" />
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {(file.size / (1024 * 1024)).toFixed(1)}MB
                                </span>
                              </div>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-6">
                <button onClick={() => setFormStep(2)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                  Back
                </button>
                <button onClick={handleContactSubmit} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-[#C9A962] hover:bg-[#D4B575] rounded-lg flex items-center gap-2">
                  {submitting ? 'Sending...' : 'Submit'}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : activeTab === 'help' && selectedArticle ? (
        /* Article detail view */
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1 text-sm text-[#C9A962] hover:underline mb-3"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </button>
          <h2 className="text-xl font-semibold text-black mb-2">{selectedArticle.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{selectedArticle.desc}</p>
        </div>
      ) : (
        <>
          <div className="px-5 pt-3 pb-4">
            <h3 className="text-sm font-medium text-black/60">Hi there! 👋</h3>
            <h2 className="mt-1 text-xl font-semibold text-black">How can we help you today?</h2>
          </div>

          {/* Quick Actions */}
          <div className="px-5 space-y-2">
            <button
              onClick={() => setShowContactForm(true)}
              className="flex w-full items-center justify-between rounded-xl bg-[#FAF8F0] px-4 py-3 text-left hover:bg-[#F5F2E5] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#C9A962]" />
                <span className="text-sm font-medium text-black">Send us a message</span>
              </div>
              <ChevronRight className="h-4 w-4 text-black/40" />
            </button>
            <button
              onClick={() => { setActiveTab('messages'); }}
              className="flex w-full items-center justify-between rounded-xl bg-[#FAF8F0] px-4 py-3 text-left hover:bg-[#F5F2E5] transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-[#C9A962]" />
                <span className="text-sm font-medium text-black">View Messages</span>
              </div>
              <ChevronRight className="h-4 w-4 text-black/40" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 mt-4">
            <div className="flex items-center gap-2 rounded-xl bg-[#F4F4F4] px-4 py-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles"
                className="w-full bg-transparent text-sm text-black placeholder:text-[#808080] focus:outline-none"
              />
              <Search className="h-4 w-4 shrink-0 text-[#808080]" />
            </div>
          </div>

          {/* Help Articles */}
          <div className="mt-4 px-3 flex-1 overflow-y-auto">
            {filteredArticles.map((item) => (
              <button
                key={item.title}
                onClick={() => { setActiveTab('help'); setSelectedArticle(item); }}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-black">{item.title}</span>
                <ChevronRight className="h-4 w-4 text-black/40" />
              </button>
            ))}
            {filteredArticles.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No results found.</p>
            )}
          </div>
        </>
      )}

      {/* Footer navigation */}
      <div className="flex items-center justify-around border-t border-gray-100 py-3">
        <button
          onClick={() => { setActiveTab('home'); setSelectedArticle(null); setShowContactForm(false); }}
          className="flex flex-col items-center gap-1"
        >
          <Home className={`h-5 w-5 ${activeTab === 'home' ? 'text-[#C9A962]' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${activeTab === 'home' ? 'text-[#C9A962]' : 'text-gray-400'}`}>Home</span>
        </button>
        <button
          onClick={() => handleTabClick('messages')}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle className={`h-5 w-5 ${activeTab === 'messages' ? 'text-[#C9A962]' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${activeTab === 'messages' ? 'text-[#C9A962]' : 'text-gray-400'}`}>Messages</span>
        </button>
        <button
          onClick={() => { setActiveTab('help'); setSelectedArticle(null); setShowContactForm(false); }}
          className="flex flex-col items-center gap-1"
        >
          <HelpCircle className={`h-5 w-5 ${activeTab === 'help' ? 'text-[#C9A962]' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${activeTab === 'help' ? 'text-[#C9A962]' : 'text-gray-400'}`}>Help</span>
        </button>
      </div>
    </div>
  )
}

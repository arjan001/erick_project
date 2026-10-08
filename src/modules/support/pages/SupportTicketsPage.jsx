import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SupportTicket, TicketResponse, Notification } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Ticket, Plus, Search, Filter, Clock, AlertCircle, CheckCircle,
  MessageSquare, Paperclip, Send, X, ChevronDown, ChevronUp,
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight, MoreVertical, Reply, Star
} from 'lucide-react'

export default function SupportTicketsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [newTicketForm, setNewTicketForm] = useState({
    category: 'support',
    priority: 'medium',
    subject: '',
    description: ''
  })

  const [responseText, setResponseText] = useState('')
  const [responses, setResponses] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [showReplyMenu, setShowReplyMenu] = useState(null)
  const [swipeAction, setSwipeAction] = useState(null)
  const [touchStart, setTouchStart] = useState(null)

  const handleTouchStart = (e, responseId) => {
    setTouchStart({ x: e.touches[0].clientX, responseId })
  }

  const handleTouchMove = (e) => {
    if (!touchStart) return
    const deltaX = e.touches[0].clientX - touchStart.x
    if (deltaX < -50) {
      setSwipeAction({ type: 'reply', responseId: touchStart.responseId })
    } else if (deltaX > 50) {
      setSwipeAction({ type: 'star', responseId: touchStart.responseId })
    }
  }

  const handleTouchEnd = () => {
    if (swipeAction) {
      const response = responses.find(r => r.id === swipeAction.responseId)
      if (response) {
        handleSwipeAction(response)
      }
    }
    setTouchStart(null)
  }

  const handleSwipeAction = (response) => {
    if (swipeAction?.type === 'reply') {
      setReplyingTo(response.responder_name)
      setResponseText(`@${response.responder_name} `)
    }
    setSwipeAction(null)
  }

  useEffect(() => {
    if (!user) return
    fetchTickets()
  }, [user])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      // Fetch all public tickets for community viewing
      const allTickets = await SupportTicket.filter({ is_public: true }, '-created_at', 100)
      setTickets(allTickets || [])
    } catch (err) {
      //
      error('Error', 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketResponses = async (ticketId) => {
    try {
      const ticketResponses = await TicketResponse.filter({ ticket_id: ticketId }, '-created_at', 100)
      setResponses(ticketResponses || [])
    } catch (err) {
      //
      setResponses([])
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      error('Validation Error', 'Please fill in all required fields')
      return
    }

    try {
      await SupportTicket.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        user_role: user.role || 'artist',
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        subject: newTicketForm.subject,
        description: newTicketForm.description,
        status: 'open'
      })

      success('Success', 'Ticket created successfully')
      setShowNewTicketModal(false)
      setNewTicketForm({ category: 'support', priority: 'medium', subject: '', description: '' })
      fetchTickets()
    } catch (err) {
      //
      error('Error', 'Failed to create ticket')
    }
  }

  const handleAddResponse = async (e) => {
    e.preventDefault()
    if (!responseText.trim() || !selectedTicket) return

    try {
      await TicketResponse.create({
        ticket_id: selectedTicket.id,
        responder_email: user.email,
        responder_name: user.full_name || user.email,
        responder_role: user.role || 'artist',
        response: responseText,
        reply_to: replyingTo || null,
        is_internal: false
      })

      // Update ticket status if it was open
      if (selectedTicket.status === 'open') {
        await SupportTicket.update(selectedTicket.id, { status: 'in_progress' })
      }

      // Send notification to ticket creator and all participants
      try {
        const allParticipants = [selectedTicket.user_email, ...responses.map(r => r.responder_email)]
        const uniqueParticipants = [...new Set(allParticipants)].filter(email => email !== user.email)

        for (const participantEmail of uniqueParticipants) {
          await Notification.create({
            recipient_email: participantEmail,
            type: 'ticket_response',
            title: `New response on ticket #${selectedTicket.ticket_number}`,
            message: `${user.full_name || user.email} replied to "${selectedTicket.subject}"`,
            metadata: {
              ticket_id: selectedTicket.id,
              ticket_number: selectedTicket.ticket_number,
              responder_name: user.full_name || user.email
            },
            read: false
          })
        }
      } catch (notifErr) {
        //
      }

      success('Success', 'Response added')
      setResponseText('')
      setReplyingTo(null)
      fetchTicketResponses(selectedTicket.id)
      fetchTickets()
    } catch (err) {
      //
      error('Error', 'Failed to add response')
    }
  }

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const ticket = tickets.find(t => t.id === ticketId)
      if (!ticket) return

      // Only ticket creator or admin can close tickets
      if (newStatus === 'closed' && ticket.user_email !== user.email && user.role !== 'admin') {
        error('Permission Denied', 'Only the ticket creator or an admin can close this ticket')
        return
      }

      const updates = { status: newStatus }
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      } else if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString()
      }

      await SupportTicket.update(ticketId, updates)
      success('Success', `Ticket ${newStatus}`)
      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updates })
      }
    } catch (err) {
      //
      error('Error', 'Failed to update status')
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    try {
      await SupportTicket.delete(ticketId)
      success('Success', 'Ticket deleted')
      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null)
      }
    } catch (err) {
      //
      error('Error', 'Failed to delete ticket')
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Ticket }
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'resolved':
        return { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'closed':
        return { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: X }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: Ticket }
    }
  }

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'low':
        return { label: 'Low', color: 'bg-gray-100 text-gray-800' }
      case 'medium':
        return { label: 'Medium', color: 'bg-blue-100 text-blue-800' }
      case 'high':
        return { label: 'High', color: 'bg-orange-100 text-orange-800' }
      case 'urgent':
        return { label: 'Urgent', color: 'bg-red-100 text-red-800' }
      default:
        return { label: priority, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Ticket className="w-6 h-6 text-gray-900" />
              <h1 className="text-xl font-bold text-gray-900">Support Tickets</h1>
            </div>
            <Button onClick={() => setShowNewTicketModal(true)} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-500">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    No tickets found
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status)
                  const priorityConfig = getPriorityConfig(ticket.priority)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedTicket(ticket); fetchTicketResponses(ticket.id); }}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ticket.ticket_number}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{ticket.subject}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-xs text-gray-700">
                          <p className="font-medium">{ticket.user_name}</p>
                          <p className="text-gray-500">{ticket.user_role}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs font-medium text-gray-700 capitalize">{ticket.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                          {priorityConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); fetchTicketResponses(ticket.id); }}
                            className="p-1.5 hover:bg-blue-50 rounded text-gray-500 hover:text-blue-600"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
              <button onClick={() => setShowNewTicketModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                >
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="support">Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Subject</label>
                <Input
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  placeholder="Brief summary of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  placeholder="Detailed description of your issue or suggestion"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewTicketModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black text-white hover:bg-gray-800 flex-1">
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-gray-900" />
                <div>
                  <p className="font-bold text-gray-900">{selectedTicket.ticket_number}</p>
                  <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityConfig(selectedTicket.priority).color}`}>
                    {getPriorityConfig(selectedTicket.priority).label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedTicket.status).color}`}>
                    {getStatusConfig(selectedTicket.status).label}
                  </span>
                  {selectedTicket.is_public && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Created by <span className="font-medium">{selectedTicket.user_name}</span> ({selectedTicket.user_role}) on {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Conversation</h3>
                <div className="space-y-4">
                  {/* Original ticket message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{selectedTicket.user_name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-1">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {responses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No responses yet</p>
                  ) : (
                    responses.map((response) => (
                      <div
                        key={response.id}
                        className="flex gap-3 relative group overflow-hidden"
                        onTouchStart={(e) => handleTouchStart(e, response.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {/* Swipe action indicator */}
                        {swipeAction?.responseId === response.id && (
                          <div className="absolute inset-0 flex items-center justify-end pr-4 z-10">
                            {swipeAction.type === 'reply' && (
                              <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <Reply className="w-4 h-4" />
                                <span className="text-sm">Reply</span>
                              </div>
                            )}
                            {swipeAction.type === 'star' && (
                              <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                <span className="text-sm">Star</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 z-20">
                          <span className="text-white text-xs font-medium">{response.responder_name?.charAt(0) || 'A'}</span>
                        </div>
                        <div className="flex-1 z-20">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{response.responder_name || 'Anonymous'}</span>
                            <span className="text-xs text-gray-500">• {new Date(response.created_at).toLocaleString()}</span>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm">
                            {response.reply_to && (
                              <div className="bg-gray-50 rounded-lg p-2 mb-2 text-xs text-gray-600 border-l-2 border-indigo-400">
                                <span className="font-medium">Replying to:</span> {response.reply_to}
                              </div>
                            )}
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{response.response}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-1">
                            <button
                              onClick={() => { setReplyingTo(response.responder_name); setResponseText(`@${response.responder_name} `); }}
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              Reply
                            </button>
                          </div>
                          {/* Desktop action menu */}
                          <div className="absolute right-0 top-0 hidden group-hover:block">
                            <button
                              onClick={() => setShowReplyMenu(showReplyMenu === response.id ? null : response.id)}
                              className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            {showReplyMenu === response.id && (
                              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-32 z-10">
                                <button
                                  onClick={() => { setReplyingTo(response.responder_name); setResponseText(`@${response.responder_name} `); setShowReplyMenu(null); }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Reply className="w-4 h-4" />
                                  Reply
                                </button>
                                <button
                                  onClick={() => { setShowReplyMenu(null); }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Star className="w-4 h-4" />
                                  Star
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleAddResponse} className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'closed' && (
                      <>
                        {selectedTicket.status !== 'resolved' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                        >
                          Close Ticket
                        </Button>
                      </>
                    )}
                  </div>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={!responseText.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

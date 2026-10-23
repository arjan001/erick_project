import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/admin/DataTable'
import { Ticket, Search, Filter, Plus, X, CheckCircle, Clock, AlertCircle, Ban, User } from 'lucide-react'
import notificationService from '@/shared/services/notificationService'

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Ticket },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: Ban },
  withdrawn: { label: 'Withdrawn', color: 'bg-red-100 text-red-800', icon: X },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
}

export default function AdminTicketsPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [newResponse, setNewResponse] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:users!support_tickets_user_id_fkey(id, email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (err) throw err
      setTickets(data || [])
    } catch (err) {
      console.error('Error fetching tickets:', err)
      error('Error', 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)

      if (error) throw error

      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
      success('Updated', 'Ticket status updated')
    } catch (err) {
      console.error('Error updating status:', err)
      error('Failed', 'Failed to update ticket status')
    }
  }

  const handleAssignTicket = async (ticketId, assignedTo) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ assigned_to: assignedTo || null })
        .eq('id', ticketId)

      if (error) throw error

      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assigned_to: assignedTo } : t))
      success('Updated', 'Ticket assigned successfully')
    } catch (err) {
      console.error('Error assigning ticket:', err)
      error('Failed', 'Failed to assign ticket')
    }
  }

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user?.id,
          is_admin: true,
          response: newResponse,
        })

      if (error) throw error

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', selectedTicket.id)
      }

      setNewResponse('')
      setShowResponseModal(false)
      fetchTickets()
      success('Sent', 'Response sent successfully')
    } catch (err) {
      console.error('Error sending response:', err)
      error('Failed', 'Failed to send response')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const columns = [
    { key: 'ticket_number', label: 'Ticket #', sortable: true },
    { key: 'title', label: 'Subject', sortable: true },
    { key: 'user_email', label: 'User', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created_at', label: 'Created', sortable: true },
  ]

  const tableData = filteredTickets.map(t => ({
    id: t.id,
    ticket_number: t.ticket_number,
    title: t.title,
    user_email: t.user?.email || 'Unknown',
    category: t.category,
    priority: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[t.priority]?.color || 'bg-gray-100'}`}>
        {PRIORITY_CONFIG[t.priority]?.label || t.priority}
      </span>
    ),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[t.status]?.color || 'bg-gray-100'}`}>
        {STATUS_CONFIG[t.status]?.label || t.status}
      </span>
    ),
    created_at: new Date(t.created_at).toLocaleDateString(),
  }))

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Tickets</div>
          <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Open</div>
          <div className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Resolved</div>
          <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* DataTable - Added proper padding */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
          selectable
          onRowClick={(row) => setSelectedTicket(tickets.find(t => t.id === row.id))}
          emptyMessage="No tickets found"
        />
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTicket.ticket_number}</h2>
                <div className="text-sm text-gray-500">{selectedTicket.title}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-full"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Priority</div>
                  <div className="mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {PRIORITY_CONFIG[selectedTicket.priority]?.label || selectedTicket.priority}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">{selectedTicket.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">User</div>
                  <div className="mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedTicket.user?.full_name || selectedTicket.user?.email || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-sm text-gray-500 mb-2">Description</div>
                <div className="p-4 bg-gray-50 rounded-lg text-gray-900">{selectedTicket.description}</div>
              </div>

              {/* Responses */}
              <div>
                <div className="text-sm text-gray-500 mb-2">Responses</div>
                <div className="space-y-3">
                  {selectedTicket.responses?.length === 0 ? (
                    <div className="text-sm text-gray-400 italic">No responses yet</div>
                  ) : (
                    selectedTicket.responses.map((response) => (
                      <div key={response.id} className={`p-4 rounded-lg ${response.is_admin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {response.is_admin ? 'Admin' : response.user?.full_name || response.user?.email || 'User'}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(response.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">{response.response}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <Button onClick={() => setShowResponseModal(true)} className="bg-black text-white hover:bg-gray-800">
                Add Response
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Response</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowResponseModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                rows={5}
                placeholder="Type your response..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowResponseModal(false)}>Cancel</Button>
              <Button onClick={handleSubmitResponse} disabled={submitting} className="bg-black text-white hover:bg-gray-800">
                {submitting ? 'Sending...' : 'Send Response'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

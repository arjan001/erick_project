import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/admin/DataTable'
import { Ticket, Search, Plus, X, CheckCircle, Clock, AlertCircle, Ban, MessageSquare } from 'lucide-react'
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

const CATEGORIES = [
  'General',
  'Account Support',
  'Billing & Payments',
  'Technical Support',
  'Feature Request',
  'Bug Report',
  'Report Issue',
  'Feedback',
  'Other',
]

export default function ClientTicketsPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'General',
    priority: 'medium',
  })

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('support_tickets')
        .select(`
          *,
          assigned_to_user:users!support_tickets_assigned_to_fkey(id, email, full_name),
          responses:ticket_responses(id, user_id, is_admin, response, created_at, user:users(id, email, full_name))
        `)
        .eq('user_id', user?.id)
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

  useEffect(() => { fetchTickets() }, [user])

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      error('Error', 'Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: ticketNumber,
          user_id: user?.id,
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          status: 'open',
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for user
      await notificationService.create({
        user_id: user.id,
        type: 'ticket',
        title: 'Ticket Submitted',
        message: `Your ticket ${ticketNumber} has been submitted successfully`,
        link: '/SupportTickets',
        metadata: { ticket_number: ticketNumber, ticket_id: data.id }
      })

      // Create notification for all admin users
      try {
        const { data: adminUsers } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')

        if (adminUsers && adminUsers.length > 0) {
          for (const admin of adminUsers) {
            await notificationService.create({
              user_id: admin.id,
              type: 'ticket',
              title: 'New Support Ticket',
              message: `New ticket ${ticketNumber} submitted by ${user.full_name}`,
              link: '/Admin/Tickets',
              metadata: { ticket_number: ticketNumber, ticket_id: data.id, user_id: user.id }
            })
          }
        }
      } catch (notifErr) {
        console.error('Error creating admin notification:', notifErr)
      }

      setFormData({ subject: '', description: '', category: 'General', priority: 'medium' })
      setShowCreateModal(false)
      fetchTickets()
      success('Created', `Ticket ${ticketNumber} created successfully`)
    } catch (err) {
      console.error('Error creating ticket:', err)
      error('Failed', 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdrawTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to withdraw this ticket?')) return
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'withdrawn' })
        .eq('id', ticketId)

      if (error) throw error

      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'withdrawn' } : t))
      success('Withdrawn', 'Ticket withdrawn successfully')
    } catch (err) {
      console.error('Error withdrawing ticket:', err)
      error('Failed', 'Failed to withdraw ticket')
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    { key: 'ticket_number', label: 'Ticket #', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created_at', label: 'Created', sortable: true },
  ]

  const tableData = filteredTickets.map(t => ({
    id: t.id,
    ticket_number: t.ticket_number,
    subject: t.subject,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <Button onClick={() => setShowCreateModal(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
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
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={tableData}
        selectable
        onRowClick={(row) => setSelectedTicket(tickets.find(t => t.id === row.id))}
        emptyMessage="No tickets found"
      />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTicket.ticket_number}</h2>
                <div className="text-sm text-gray-500">{selectedTicket.subject}</div>
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
                  <div className="mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {STATUS_CONFIG[selectedTicket.status]?.label || selectedTicket.status}
                  </div>
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
                  <div className="text-sm text-gray-500">Assigned To</div>
                  <div className="mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedTicket.assigned_to_user?.full_name || selectedTicket.assigned_to_user?.email || 'Not assigned'}
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
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {response.is_admin ? 'Support Team' : response.user?.full_name || response.user?.email || 'You'}
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
            <div className="p-4 border-t border-gray-200 flex justify-between">
              {selectedTicket.status === 'open' || selectedTicket.status === 'in_progress' ? (
                <Button onClick={() => handleWithdrawTicket(selectedTicket.id)} variant="destructive">
                  Withdraw Ticket
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={() => setSelectedTicket(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Create New Ticket</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={submitting} className="bg-black text-white hover:bg-gray-800">
                {submitting ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

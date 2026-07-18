import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupportTicket, TicketResponse } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Ticket, Plus, Search, Filter, Clock, AlertCircle, CheckCircle, 
  MessageSquare, Paperclip, Send, X, ChevronDown, ChevronUp, 
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function SupportTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newTicketForm, setNewTicketForm] = useState({
    category: 'support',
    priority: 'medium',
    subject: '',
    description: ''
  });

  const [responseText, setResponseText] = useState('');
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const allTickets = await SupportTicket.filter({ user_email: user.email }, '-created_at', 50);
      setTickets(allTickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      error('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId) => {
    try {
      const ticketResponses = await TicketResponse.filter({ ticket_id: ticketId }, '-created_at', 100);
      setResponses(ticketResponses || []);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setResponses([]);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      error('Validation Error', 'Please fill in all required fields');
      return;
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
      });

      success('Success', 'Ticket created successfully');
      setShowNewTicketModal(false);
      setNewTicketForm({ category: 'support', priority: 'medium', subject: '', description: '' });
      fetchTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
      error('Error', 'Failed to create ticket');
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim() || !selectedTicket) return;

    try {
      await TicketResponse.create({
        ticket_id: selectedTicket.id,
        responder_email: user.email,
        responder_name: user.full_name || user.email,
        responder_role: user.role || 'artist',
        response: responseText,
        is_internal: false
      });

      // Update ticket status if it was open
      if (selectedTicket.status === 'open') {
        await SupportTicket.update(selectedTicket.id, { status: 'in_progress' });
      }

      success('Success', 'Response added');
      setResponseText('');
      fetchTicketResponses(selectedTicket.id);
      fetchTickets();
    } catch (err) {
      console.error('Error adding response:', err);
      error('Error', 'Failed to add response');
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      } else if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString();
      }

      await SupportTicket.update(ticketId, updates);
      success('Success', `Ticket ${newStatus}`);
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updates });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      error('Error', 'Failed to update status');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await SupportTicket.delete(ticketId);
      success('Success', 'Ticket deleted');
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Error deleting ticket:', err);
      error('Error', 'Failed to delete ticket');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Ticket };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'closed':
        return { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: X };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: Ticket };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'low':
        return { label: 'Low', color: 'bg-gray-100 text-gray-800' };
      case 'medium':
        return { label: 'Medium', color: 'bg-blue-100 text-blue-800' };
      case 'high':
        return { label: 'High', color: 'bg-orange-100 text-orange-800' };
      case 'urgent':
        return { label: 'Urgent', color: 'bg-red-100 text-red-800' };
      default:
        return { label: priority, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-500">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    No tickets found
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status);
                  const priorityConfig = getPriorityConfig(ticket.priority);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedTicket(ticket); fetchTicketResponses(ticket.id); }}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ticket.ticket_number}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{ticket.subject}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-700 capitalize">{ticket.category}</span>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-xs text-gray-500">
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
                  );
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
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityConfig(selectedTicket.priority).color}`}>
                    {getPriorityConfig(selectedTicket.priority).label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedTicket.status).color}`}>
                    {getStatusConfig(selectedTicket.status).label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                <p className="text-xs text-gray-500 mt-2">Created by {selectedTicket.user_name} on {new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Responses</h3>
                <div className="space-y-3">
                  {responses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No responses yet</p>
                  ) : (
                    responses.map((response) => (
                      <div key={response.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">{response.responder_name}</p>
                          <p className="text-xs text-gray-500">{new Date(response.created_at).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.response}</p>
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
  );
}

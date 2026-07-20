import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketResponse, AuditLog } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Ticket, Search, Eye, Trash2, ChevronLeft, ChevronRight, 
  Filter, Clock, AlertCircle, CheckCircle, X, MessageSquare 
} from 'lucide-react';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const CATEGORIES = ['bug', 'feature', 'suggestion', 'support', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function AdminTicketsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const rows = await SupportTicket.list('-created_at');
      setTickets(rows || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      error('Error', 'Failed to fetch tickets');
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      } else if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString();
      }

      await SupportTicket.update(ticketId, updates);
      
      // Log the action
      await AuditLog.create({
        action: 'update',
        entity_type: 'support_ticket',
        entity_id: ticketId,
        performed_by: user.email,
        details: `Updated ticket status to ${newStatus}`
      });

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
      
      // Log the action
      await AuditLog.create({
        action: 'delete',
        entity_type: 'support_ticket',
        entity_id: ticketId,
        performed_by: user.email,
        details: 'Deleted support ticket'
      });

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

  const getStatusBadge = (status) => {
    const map = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ')}</span>;
  };

  const getPriorityBadge = (priority) => {
    const map = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[priority] || 'bg-gray-100 text-gray-800'}`}>{priority}</span>;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_number?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         ticket.subject?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         ticket.user_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterStatus, filterCategory, filterPriority]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-1">View and manage all support tickets</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            >
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-500">Total: {filteredTickets.length}</div>
        </div>

        <div className="overflow-x-auto">
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
              {paginatedTickets.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">No tickets found</td></tr>
              )}
              {paginatedTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
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
                    {getPriorityBadge(ticket.priority)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(ticket); fetchTicketResponses(ticket.id); }} title="View Details" className="p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTicket(ticket.id)} title="Delete" className="p-1">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`px-3 ${currentPage === page ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-gray-900" />
                <div>
                  <p className="font-bold text-gray-900">{selectedTicket.ticket_number}</p>
                  <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}><X className="w-4 h-4" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
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
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Responses ({responses.length})
                </h3>
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
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {selectedTicket.status !== 'closed' && (
                    <>
                      {selectedTicket.status !== 'resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close Ticket
                      </Button>
                    </>
                  )}
                  {selectedTicket.status === 'closed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Reopen Ticket
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

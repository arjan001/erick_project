import React, { useState, useEffect } from 'react';
import { ProjectOwner, AuditLog } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Building, Search, Eye, Trash2, Mail, Phone, Briefcase, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-gray-200 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700'
};

export default function AdminClientsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [page, setPage] = useState(1);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const rows = await ProjectOwner.list('-created_at', 100);
      setClients(rows || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      error('Error', 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await ProjectOwner.delete(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      success('Deleted', 'Client deleted successfully');
      AuditLog.create({ actor_email: user?.email, action: 'client.delete', entity_type: 'ProjectOwner', entity_id: clientId, details: 'Deleted client' }).catch(() => {});
    } catch (err) {
      console.error('Error deleting client:', err);
      error('Failed', 'Failed to delete client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const paginatedClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients Management</h1>
        <p className="text-gray-600 mt-1">Manage project owners and clients</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Clients</div>
              <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Projects Submitted</div>
              <div className="text-2xl font-bold text-gray-900">{clients.reduce((sum, c) => sum + (c.projects_submitted?.length || 0), 0)}</div>
            </div>
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedClients.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No clients found</td></tr>
              )}
              {paginatedClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{client.full_name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-3 h-3" />{client.email}</div>
                    {client.phone && <div className="text-sm text-gray-500 flex items-center gap-2"><Phone className="w-3 h-3" />{client.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.company || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[client.status] || 'bg-gray-100 text-gray-700'}`}>
                      {client.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.projects_submitted?.length || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)} title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">{filteredClients.length} total · page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Client Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">{selectedClient.full_name?.[0]?.toUpperCase() || 'C'}</span>
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900">{selectedClient.full_name}</div>
                  <div className="text-gray-500">{selectedClient.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium text-gray-500">Company:</span> {selectedClient.company || 'N/A'}</div>
                <div><span className="font-medium text-gray-500">Phone:</span> {selectedClient.phone || 'N/A'}</div>
                <div><span className="font-medium text-gray-500">Website:</span> {selectedClient.website || 'N/A'}</div>
                <div><span className="font-medium text-gray-500">Status:</span> {selectedClient.status || 'active'}</div>
              </div>
              <div><span className="font-medium text-gray-500">Bio:</span> {selectedClient.bio || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Projects Submitted:</span> {selectedClient.projects_submitted?.length || 0}</div>
              <div><span className="font-medium text-gray-500">Joined:</span> {selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 justify-end">
              <Button variant="outline" onClick={() => setSelectedClient(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
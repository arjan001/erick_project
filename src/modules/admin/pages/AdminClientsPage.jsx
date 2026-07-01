import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Building, Search, Eye, Trash2, Mail, Phone, Briefcase, X } from 'lucide-react';

export default function AdminClientsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const rows = await base44.entities.ProjectOwner.list('-created_date');
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
      await base44.entities.ProjectOwner.delete(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      success('Deleted', 'Client deleted successfully');
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
        <h1 className="text-2xl font-bold text-gray-900">Clients Management</h1>
        <p className="text-gray-600 mt-1">Manage project owners and clients</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Clients</div>
              <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Projects Submitted</div>
              <div className="text-2xl font-bold text-gray-900">{clients.reduce((sum, c) => sum + (c.projects_submitted?.length || 0), 0)}</div>
            </div>
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">Total: {filteredClients.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No clients found</td></tr>
              )}
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{client.full_name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-3 h-3" />{client.email}</div>
                    {client.phone && <div className="text-sm text-gray-500 flex items-center gap-2"><Phone className="w-3 h-3" />{client.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.company || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.projects_submitted?.length || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.created_date ? new Date(client.created_date).toLocaleDateString() : 'N/A'}</td>
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
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Client Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium text-gray-500">Name:</span> {selectedClient.full_name}</div>
              <div><span className="font-medium text-gray-500">Email:</span> {selectedClient.email}</div>
              <div><span className="font-medium text-gray-500">Company:</span> {selectedClient.company || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Phone:</span> {selectedClient.phone || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Website:</span> {selectedClient.website || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Bio:</span> {selectedClient.bio || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Projects Submitted:</span> {selectedClient.projects_submitted?.length || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
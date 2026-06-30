import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Building, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, DollarSign, Briefcase, CheckCircle, XCircle, Star } from 'lucide-react';

export default function AdminClientsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchClients = async () => {
      try {
        const mockClients = [
          { id: 1, name: 'Film Productions Inc', email: 'contact@filmpro.com', phone: '+1-555-0101', type: 'client', status: 'active', projectsPosted: 12, totalSpent: 125000, joinedDate: '2026-01-15', location: 'Los Angeles, CA', rating: 4.8 },
          { id: 2, name: 'Music Records', email: 'info@musicrecords.com', phone: '+1-555-0102', type: 'project_owner', status: 'active', projectsPosted: 8, totalSpent: 85000, joinedDate: '2026-02-20', location: 'New York, NY', rating: 4.5 },
          { id: 3, name: 'Creative Agency', email: 'hello@creativeagency.com', phone: '+1-555-0103', type: 'client', status: 'active', projectsPosted: 15, totalSpent: 180000, joinedDate: '2026-03-10', location: 'Chicago, IL', rating: 4.9 },
          { id: 4, name: 'Ad Agency', email: 'ads@adagency.com', phone: '+1-555-0104', type: 'client', status: 'inactive', projectsPosted: 5, totalSpent: 45000, joinedDate: '2026-04-05', location: 'Miami, FL', rating: 4.2 },
          { id: 5, name: 'Game Studio', email: 'dev@gamestudio.com', phone: '+1-555-0105', type: 'project_owner', status: 'active', projectsPosted: 3, totalSpent: 32000, joinedDate: '2026-05-12', location: 'Seattle, WA', rating: 4.7 },
          { id: 6, name: 'Media Company', email: 'media@media.com', phone: '+1-555-0106', type: 'client', status: 'active', projectsPosted: 20, totalSpent: 250000, joinedDate: '2026-01-28', location: 'Austin, TX', rating: 4.6 }
        ];
        setClients(mockClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        error('Error', 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  const handleDeleteClient = async (clientId) => {
    try {
      setClients(clients.filter(c => c.id !== clientId));
      success('Deleted', 'Client deleted successfully');
    } catch (err) {
      console.error('Error deleting client:', err);
      error('Failed', 'Failed to delete client');
    }
  };

  const handleToggleStatus = async (clientId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setClients(clients.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
      success('Updated', 'Client status updated successfully');
    } catch (err) {
      console.error('Error updating client status:', err);
      error('Failed', 'Failed to update client status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      case 'suspended':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Suspended</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    const matchesType = filterType === 'all' || client.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Clients Management</h1>
          <p className="text-gray-600 mt-1">Manage clients and project owners</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
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
                  <div className="text-sm text-gray-500">Total Projects Posted</div>
                  <div className="text-2xl font-bold text-gray-900">{clients.reduce((sum, c) => sum + c.projectsPosted, 0)}</div>
                </div>
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                  <div className="text-2xl font-bold text-gray-900">${clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Active Clients</div>
                  <div className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'active').length}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="client">Client</option>
                  <option value="project_owner">Project Owner</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                Total Clients: {filteredClients.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {client.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {client.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {client.projectsPosted}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${client.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-900">{client.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(client.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(client.id, client.status)} title="Toggle Status">
                            {client.status === 'active' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
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
        </div>
      </main>
    </div>
  );
}

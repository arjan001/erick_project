import React, { useState, useEffect } from 'react'
import { Client, AuditLog } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building, Eye, Trash2, Mail, Phone, Briefcase, Edit2, Ban, CheckCircle, User, Calendar, MapPin, Search, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { auditService } from '@/services/auditService'

const PAGE_SIZE = 10

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 border-green-200',
  suspended: 'bg-orange-100 text-orange-700 border-orange-200',
  disabled: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export default function AdminClientsPage() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({
    client_name: '', display_name: '', company_name: '', phone: '', website: '', bio: '', status: 'active', is_suspended: false, is_disabled: false
  })

  const fetchClients = async () => {
    try {
      setLoading(true)
      const rows = await Client.list('-created_at', 100)
      // Fetch job counts for each client
      const clientsWithJobs = await Promise.all(
        (rows || []).map(async (client) => {
          if (client.user_id) {
            // Try to fetch jobs for this client
            try {
              const { Job } = await import('@/lib/supabaseEntities')
              const jobs = await Job.filter({ client_id: client.id })
              return { ...client, jobs_count: jobs?.length || 0 }
            } catch (err) {
              return { ...client, jobs_count: 0 }
            }
          }
          return { ...client, jobs_count: 0 }
        })
      )
      setClients(clientsWithJobs || [])
      
      await auditService.log({
        action: 'read',
        entity_type: 'clients',
        module_name: 'admin',
        metadata: { count: clientsWithJobs?.length || 0 }
      })
    } catch (err) {
      console.error('Error fetching clients:', err)
      setClients([])
      await auditService.logError(err, 'admin', { action: 'read_clients' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients(); }, [])

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return
    try {
      await Client.delete(clientId)
      setClients(prev => prev.filter(c => c.id !== clientId))
      success('Deleted', 'Client deleted successfully')
      
      await auditService.logDelete('clients', clientId, 'admin')
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'delete_client', client_id: clientId })
      toastError('Failed', 'Failed to delete client')
    }
  }

  const toggleSuspend = async (client) => {
    try {
      await Client.update(client.id, { is_suspended: !client.is_suspended })
      success(!client.is_suspended ? 'Suspended' : 'Unsuspended', `Client ${!client.is_suspended ? 'suspended' : 'unsuspended'}`)
      
      await auditService.logUpdate('clients', client.id, 'admin', { 
        action: 'toggle_suspend',
        is_suspended: !client.is_suspended 
      })
      fetchClients()
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'toggle_suspend', client_id: client.id })
      toastError('Failed', 'Failed to update suspension status')
    }
  }

  const toggleDisable = async (client) => {
    try {
      await Client.update(client.id, { is_disabled: !client.is_disabled })
      success(!client.is_disabled ? 'Disabled' : 'Enabled', `Client ${!client.is_disabled ? 'disabled' : 'enabled'}`)
      
      await auditService.logUpdate('clients', client.id, 'admin', { 
        action: 'toggle_disable',
        is_disabled: !client.is_disabled 
      })
      fetchClients()
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'toggle_disable', client_id: client.id })
      toastError('Failed', 'Failed to update disabled status')
    }
  }

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setForm({
        client_name: client.client_name || '',
        display_name: client.display_name || '',
        company_name: client.company_name || '',
        phone: client.phone || '',
        website: client.website || '',
        bio: client.bio || '',
        status: client.status || 'active',
        is_suspended: client.is_suspended || false,
        is_disabled: client.is_disabled || false
      })
    } else {
      setEditingClient(null)
      setForm({ client_name: '', display_name: '', company_name: '', phone: '', website: '', bio: '', status: 'active', is_suspended: false, is_disabled: false })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.client_name.trim()) { toastError('Validation', 'Name is required'); return; }
    try {
      if (editingClient) {
        await Client.update(editingClient.id, form)
        success('Updated', 'Client updated')
      } else {
        await Client.create(form)
        success('Created', 'Client created')
      }
      setShowModal(false)
      fetchClients()
    } catch (err) {
      toastError('Save Failed', `Failed to save client: ${err.message || 'Unknown error'}`)
    }
  }

  const getStatus = (client) => {
    if (client.is_suspended) return 'suspended'
    if (client.is_disabled) return 'disabled'
    return client.status || 'active'
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !client.is_suspended && !client.is_disabled) ||
      (statusFilter === 'suspended' && client.is_suspended) ||
      (statusFilter === 'disabled' && client.is_disabled) ||
      (statusFilter === 'pending' && client.status === 'pending')
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE)
  const paginatedClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients Management</h1>
          <p className="text-gray-600">Manage all clients and project owners on the platform</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <User className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jobs Posted</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt={client.display_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {client.display_name?.[0]?.toUpperCase() || 'C'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{client.display_name || client.client_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">ID: {client.user_id?.slice(0, 8) || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {client.company_name || <span className="text-gray-400 text-xs">N/A</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_STYLES[getStatus(client)]}`}>
                    {getStatus(client).charAt(0).toUpperCase() + getStatus(client).slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {client.jobs_count || 0}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button onClick={() => setSelectedClient(client)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => openModal(client)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => toggleSuspend(client)} variant="ghost" size="sm" className={`${client.is_suspended ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'} p-1`}>
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => toggleDisable(client)} variant="ghost" size="sm" className={`${client.is_disabled ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'} p-1`}>
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDeleteClient(client.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedClients.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No clients found</p>
            <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
              <User className="w-4 h-4 mr-2" /> Add First Client
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filteredClients.length)} of {filteredClients.length} clients
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Client Details</h2>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                {selectedClient.logo_url ? (
                  <img src={selectedClient.logo_url} alt={selectedClient.display_name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {selectedClient.display_name?.[0]?.toUpperCase() || 'C'}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedClient.display_name || selectedClient.client_name || 'Unknown'}</h3>
                  <p className="text-gray-600">User ID: {selectedClient.user_id?.slice(0, 8) || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="font-medium capitalize">{getStatus(selectedClient)}</p>
                </div>
                {selectedClient.company_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="font-medium flex items-center gap-2"><Building className="w-4 h-4" /> {selectedClient.company_name}</p>
                  </div>
                )}
                {selectedClient.contact_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedClient.contact_email}</p>
                  </div>
                )}
                {selectedClient.contact_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="font-medium flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedClient.contact_phone}</p>
                  </div>
                )}
                {selectedClient.website_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="font-medium flex items-center gap-2"><Globe className="w-4 h-4" /> {selectedClient.website_url}</p>
                  </div>
                )}
                {selectedClient.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedClient.location}</p>
                  </div>
                )}
                {selectedClient.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(selectedClient.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Jobs Posted</label>
                  <p className="font-medium flex items-center gap-2"><Briefcase className="w-4 h-4" /> {selectedClient.jobs_count || 0}</p>
                </div>
              </div>

              {selectedClient.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-gray-700">{selectedClient.bio}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedClient(null)}>Close</Button>
              <Button onClick={() => { setSelectedClient(null); openModal(selectedClient); }} className="bg-black text-white hover:bg-gray-800">Edit Client</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Client Name</label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Display Name</label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Company Name</label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Phone</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Website</label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_suspended} onChange={(e) => setForm({ ...form, is_suspended: e.target.checked })} className="w-4 h-4" /> Suspended</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_disabled} onChange={(e) => setForm({ ...form, is_disabled: e.target.checked })} className="w-4 h-4" /> Disabled</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editingClient ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Team } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Trash2, X, Eye, CheckCircle, AlertCircle, Search, Users, Mail, Calendar, MapPin, Building, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-react'
import { useToast } from '@/hooks/useToast.jsx'

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
}

const PAGE_SIZE = 10

export default function AdminTeamsPage() {
  const { success, error: toastError } = useToast()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [viewingTeam, setViewingTeam] = useState(null)
  const [editingTeam, setEditingTeam] = useState(null)
  const [viewingMembers, setViewingMembers] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [form, setForm] = useState({
    team_name: '', description: '', location: '', industry: '', status: 'pending', auto_approve: false
  })

  const fetchData = async () => {
    try {
      const all = await Team.list('-created_at', 100)
      setTeams(all || [])
    } catch (err) {
      
      toastError('Load Failed', 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(); }, [])

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'approved' && team.status === 'approved') ||
                          (statusFilter === 'pending' && team.status === 'pending') ||
                          (statusFilter === 'rejected' && team.status === 'rejected')
    return matchesSearch && matchesStatus
  })

  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const totalPages = Math.ceil(filteredTeams.length / PAGE_SIZE)

  const getStatus = (team) => {
    return team.status || 'pending'
  }

  const openModal = (team = null) => {
    if (team) {
      setEditingTeam(team)
      setForm({
        team_name: team.team_name || '',
        description: team.description || '',
        location: team.location || '',
        industry: team.industry || '',
        status: team.status || 'pending',
        auto_approve: team.auto_approve || false
      })
    } else {
      setEditingTeam(null)
      setForm({ team_name: '', description: '', location: '', industry: '', status: 'pending', auto_approve: false })
    }
    setShowModal(true)
  }

  const openViewModal = (team) => {
    setViewingTeam(team)
  }

  const openMembersModal = async (team) => {
    try {
      // Fetch team members - assuming Team has a members relation or similar
      const members = await Team.getMembers?.(team.id) || []
      setViewingMembers({ team, members })
    } catch (err) {
      
      toastError('Load Failed', 'Failed to load team members')
    }
  }

  const handleSave = async () => {
    if (!form.team_name.trim()) { toastError('Validation', 'Team name is required'); return; }
    try {
      if (editingTeam) {
        await Team.update(editingTeam.id, form)
        success('Updated', 'Team updated')
      } else {
        await Team.create(form)
        success('Created', 'Team created')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      
      toastError('Save Failed', `Failed to save team: ${err.message || 'Unknown error'}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this team? This action cannot be undone.')) return
    try {
      await Team.delete(id)
      success('Deleted', 'Team deleted')
      fetchData()
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete team')
    }
  }

  const handleApprove = async (team) => {
    try {
      await Team.update(team.id, { status: 'approved' })
      success('Approved', 'Team approved successfully')
      fetchData()
    } catch (err) {
      toastError('Failed', 'Failed to approve team')
    }
  }

  const handleReject = async (team) => {
    try {
      await Team.update(team.id, { status: 'rejected' })
      success('Rejected', 'Team rejected')
      fetchData()
    } catch (err) {
      toastError('Failed', 'Failed to reject team')
    }
  }

  const toggleAutoApprove = async (team) => {
    try {
      await Team.update(team.id, { auto_approve: !team.auto_approve })
      success(!team.auto_approve ? 'Enabled' : 'Disabled', `Auto-approve ${!team.auto_approve ? 'enabled' : 'disabled'}`)
      fetchData()
    } catch (err) {
      toastError('Failed', 'Failed to update auto-approve setting')
    }
  }

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Users className="w-4 h-4 mr-2" /> Add Team
        </Button>
      </div>

      {/* Datatable */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none text-sm"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-gray-500 whitespace-nowrap">{filteredTeams.length} teams</div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Industry</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Auto-Approve</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTeams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.team_name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {team.team_name?.[0]?.toUpperCase() || 'T'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{team.team_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{team.description || 'No description'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {team.industry || <span className="text-gray-400 text-xs">No industry</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {team.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {team.location}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No location</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_STYLES[getStatus(team)]}`}>
                    {getStatus(team).charAt(0).toUpperCase() + getStatus(team).slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${team.auto_approve ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {team.auto_approve ? 'On' : 'Off'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button onClick={() => openViewModal(team)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => openMembersModal(team)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1" title="View Members">
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => openModal(team)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {team.status === 'pending' && (
                      <>
                        <Button onClick={() => handleApprove(team)} variant="ghost" size="sm" className="text-green-600 hover:text-green-700 p-1" title="Approve">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleReject(team)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1" title="Reject">
                          <UserX className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button onClick={() => toggleAutoApprove(team)} variant="ghost" size="sm" className={team.auto_approve ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-900'} title="Toggle Auto-Approve" p-1>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(team.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedTeams.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No teams found</p>
            <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
              <Users className="w-4 h-4 mr-2" /> Add First Team
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredTeams.length)} of {filteredTeams.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Team Details</h2>
              <button onClick={() => setViewingTeam(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                {viewingTeam.logo_url ? (
                  <img src={viewingTeam.logo_url} alt={viewingTeam.team_name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {viewingTeam.team_name?.[0]?.toUpperCase() || 'T'}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingTeam.team_name || 'Unknown'}</h3>
                  <p className="text-gray-600">{viewingTeam.industry || 'No industry'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="font-medium capitalize">{viewingTeam.status || 'Pending'}</p>
                </div>
                {viewingTeam.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> {viewingTeam.location}</p>
                  </div>
                )}
                {viewingTeam.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(viewingTeam.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Auto-Approve</label>
                  <p className="font-medium">{viewingTeam.auto_approve ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {viewingTeam.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-gray-700">{viewingTeam.description}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setViewingTeam(null)}>Close</Button>
              <Button onClick={() => { setViewingTeam(null); openModal(viewingTeam); }} className="bg-black text-white hover:bg-gray-800">Edit Team</Button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {viewingMembers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
              <button onClick={() => setViewingMembers(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <h3 className="font-semibold mb-4">{viewingMembers.team.team_name}</h3>
              {viewingMembers.members.length === 0 ? (
                <p className="text-gray-500">No members found</p>
              ) : (
                <div className="space-y-3">
                  {viewingMembers.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        {member.full_name?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{member.email || 'No email'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button variant="outline" onClick={() => setViewingMembers(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingTeam ? 'Edit Team' : 'Add Team'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Team Name</label><Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Industry</label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g., Film, Tech, Design" /></div>
              <div><label className="block text-sm font-medium mb-2">Location</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.auto_approve} onChange={(e) => setForm({ ...form, auto_approve: e.target.checked })} className="w-4 h-4" /> Auto-Approve Members</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editingTeam ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

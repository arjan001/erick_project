import React, { useState, useEffect } from 'react'
import { adminApi } from '../api/admin.api'
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X, Ban, Pause, Trash2, AlertTriangle } from 'lucide-react'
import { notifySuccess } from '@/lib/sweetAlert'

const PAGE_SIZE = 10

function ProjectModal({ project, onClose, onApprove, onReject, onSuspend, onPause, onDelete }) {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [reason, setReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const handleAction = async (action) => {
    const actionFn = action === 'suspend' ? onSuspend : action === 'pause' ? onPause : onDelete
    await actionFn(project.id, reason, adminNotes)
    setShowSuspendDialog(false)
    setShowPauseDialog(false)
    setShowDeleteDialog(false)
    setReason('')
    setAdminNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{project.project_owner_company || project.project_owner_name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-xs text-gray-400 uppercase">Type</span><p className="font-medium text-gray-800 capitalize">{project.project_type?.replace(/_/g, ' ')}</p></div>
            <div><span className="text-xs text-gray-400 uppercase">Status</span>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${project.status === 'verified' ? 'bg-green-100 text-green-700' : project.status === 'submitted' ? 'bg-amber-100 text-amber-700' : project.status === 'suspended' ? 'bg-red-100 text-red-700' : project.status === 'paused' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{project.status}</span>
            </div>
            <div><span className="text-xs text-gray-400 uppercase">Owner Email</span><p className="font-medium text-gray-800 break-all">{project.project_owner_email}</p></div>
            <div><span className="text-xs text-gray-400 uppercase">Budget</span><p className="font-medium text-gray-800">{project.budget_range?.replace(/_/g, ' ') || '—'}</p></div>
            {project.location_city && <div><span className="text-xs text-gray-400 uppercase">Location</span><p className="font-medium text-gray-800">{project.location_city}, {project.location_country}</p></div>}
            {project.open_to_backing && <div className="col-span-2"><span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Open to Backing</span></div>}
          </div>
          {project.notes && <div><span className="text-xs text-gray-400 uppercase">Notes</span><p className="text-gray-700 mt-1">{project.notes}</p></div>}
          {project.suspension_reason && <div><span className="text-xs text-gray-400 uppercase">Suspension Reason</span><p className="text-red-600 mt-1">{project.suspension_reason}</p></div>}
          {project.admin_notes && <div><span className="text-xs text-gray-400 uppercase">Admin Notes</span><p className="text-gray-700 mt-1">{project.admin_notes}</p></div>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-5 border-t border-gray-100">
          {project.status === 'submitted' && (
            <>
              <button onClick={() => onApprove(project.id)}
                className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => onReject(project.id)}
                className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </>
          )}
          {project.status === 'verified' && (
            <>
              <button onClick={() => setShowSuspendDialog(true)}
                className="flex-1 py-2 border border-amber-200 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 flex items-center justify-center gap-2">
                <Ban className="w-4 h-4" /> Suspend
              </button>
              <button onClick={() => setShowPauseDialog(true)}
                className="flex-1 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center justify-center gap-2">
                <Pause className="w-4 h-4" /> Pause
              </button>
              <button onClick={() => setShowDeleteDialog(true)}
                className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          )}
          {(project.status === 'suspended' || project.status === 'paused') && (
            <button onClick={() => onApprove(project.id)}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Suspend Dialog */}
      {showSuspendDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Ban className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Suspend Project</h3>
                <p className="text-sm text-gray-500">This project will be temporarily suspended</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suspension Reason *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this project is being suspended..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Required Changes)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="List the changes the client needs to make..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowSuspendDialog(false); setReason(''); setAdminNotes(''); }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleAction('suspend')}
                disabled={!reason.trim()}
                className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-40">
                Suspend Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Dialog */}
      {showPauseDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Pause className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Pause Project</h3>
                <p className="text-sm text-gray-500">This project will be temporarily paused</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pause Reason *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this project is being paused..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Required Changes)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="List the changes the client needs to make..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowPauseDialog(false); setReason(''); setAdminNotes(''); }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleAction('pause')}
                disabled={!reason.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">
                Pause Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Project</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deletion Reason *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this project is being deleted..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  rows={3}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowDeleteDialog(false); setReason(''); }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleAction('delete')}
                disabled={!reason.trim()}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40">
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectAdminPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    adminApi.projects.list().then(setProjects).catch(err => {
      console.error('Failed to load projects:', err)
    })
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.project_owner_name?.toLowerCase().includes(search.toLowerCase()) || p.project_owner_email?.toLowerCase().includes(search.toLowerCase()) || p.project_type?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleApprove = async (id) => {
    await adminApi.projects.approve(id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'verified' } : p))
    setSelected(null)
    notifySuccess('Project Verified', 'The project has been verified')
  }

  const handleReject = async (id) => {
    await adminApi.projects.reject(id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
    setSelected(null)
    notifySuccess('Project Rejected', 'The project has been rejected')
  }

  const handleSuspend = async (id, reason, adminNotes) => {
    await adminApi.projects.suspend(id, { reason, admin_notes: adminNotes })
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'suspended', suspension_reason: reason, admin_notes: adminNotes } : p))
    notifySuccess('Project Suspended', 'The project has been suspended')
  }

  const handlePause = async (id, reason, adminNotes) => {
    await adminApi.projects.pause(id, { reason, admin_notes: adminNotes })
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'paused', suspension_reason: reason, admin_notes: adminNotes } : p))
    notifySuccess('Project Paused', 'The project has been paused')
  }

  const handleDelete = async (id, reason) => {
    await adminApi.projects.delete(id, { reason })
    setProjects(prev => prev.filter(p => p.id !== id))
    notifySuccess('Project Deleted', 'The project has been deleted')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and manage project submissions</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white min-w-[130px]">
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="in_progress">In Progress</option>
          <option value="suspended">Suspended</option>
          <option value="paused">Paused</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Budget</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Submitted</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No projects found</td></tr>
                  ) : paginated.map(project => (
                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{project.project_owner_company || project.project_owner_name}</div>
                        <div className="text-xs text-gray-400">{project.project_owner_email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell capitalize">{project.project_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{project.budget_range?.replace(/_/g, ' ') || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${project.status === 'verified' ? 'bg-green-100 text-green-700' : project.status === 'submitted' ? 'bg-amber-100 text-amber-700' : project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {project.created_date ? new Date(project.created_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(project)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{filtered.length} total · page {page} of {totalPages}</span>
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
          </>
        )}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleReject} onSuspend={handleSuspend} onPause={handlePause} onDelete={handleDelete} />}
    </div>
  )
}
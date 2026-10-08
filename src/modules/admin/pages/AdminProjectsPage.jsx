import React, { useState, useEffect } from 'react'
import { Project, AuditLog } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderKanban, Search, Eye, Trash2, DollarSign, CheckCircle, XCircle, TrendingUp, X, Plus, Building2, FileText, Film, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, Users, Tag, Star, Flame, Sparkles } from 'lucide-react'

const STATUSES = ['submitted', 'verified', 'in_progress', 'delivered', 'rejected']

export default function AdminProjectsPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    project_type: 'commercial',
    location_city: '',
    budget_amount: '',
    status: 'submitted'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const rows = await Project.list('-created_date')
      setProjects(rows || [])
    } catch (err) {
      
      error('Error', 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects(); }, [])

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      await Project.delete(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      success('Deleted', 'Project deleted successfully')
      AuditLog.create({ actor_email: user?.email, action: 'project.delete', entity_type: 'Project', entity_id: projectId, details: 'Deleted project' }).catch(() => {})
    } catch (err) {
      
      error('Failed', 'Failed to delete project')
    }
  }

  const handleCreateProject = async () => {
    if (!createForm.title || !createForm.description) {
      error('Validation Error', 'Title and description are required')
      return
    }
    try {
      const newProject = await Project.create({
        title: createForm.title,
        description: createForm.description,
        project_type: createForm.project_type,
        location_city: createForm.location_city,
        budget_amount: parseFloat(createForm.budget_amount) || 0,
        status: createForm.status
      })
      setProjects(prev => [newProject, ...prev])
      setShowCreateModal(false)
      setCreateForm({
        title: '',
        description: '',
        project_type: 'commercial',
        location_city: '',
        budget_amount: '',
        status: 'submitted'
      })
      success('Created', 'Project created successfully')
      AuditLog.create({ actor_email: user?.email, action: 'project.create', entity_type: 'Project', entity_id: newProject.id, details: 'Created project' }).catch(() => {})
    } catch (err) {
      
      error('Failed', 'Failed to create project')
    }
  }

  const handleVerify = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'verified' ? 'submitted' : 'verified'
    try {
      await Project.update(projectId, { status: newStatus })
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p))
      success('Updated', 'Project status updated successfully')
      AuditLog.create({ actor_email: user?.email, action: 'project.status_update', entity_type: 'Project', entity_id: projectId, details: `Changed status to ${newStatus}` }).catch(() => {})
    } catch (err) {
      
      error('Failed', 'Failed to update project status')
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      submitted: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status?.replace('_', ' ')}</span>
  }

  // Helper functions for dynamic tags
  const isNewProject = (createdAt) => {
    if (!createdAt) return false
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return new Date(createdAt) > oneDayAgo
  }

  const isPopularProject = (budget) => {
    if (!budget) return false
    const budgetNum = parseFloat(budget)
    return budgetNum >= 50000; // Popular if budget is $50k or more
  }

  const handleToggleFeatured = async (projectId, currentFeatured) => {
    try {
      await Project.update(projectId, { is_featured: !currentFeatured })
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, is_featured: !currentFeatured } : p))
      success('Updated', !currentFeatured ? 'Project featured' : 'Project unfeatured')
      AuditLog.create({ actor_email: user?.email, action: 'project.feature_toggle', entity_type: 'Project', entity_id: projectId, details: `Set featured to ${!currentFeatured}` }).catch(() => {})
    } catch (err) {
      
      error('Failed', 'Failed to update featured status')
    }
  }

  const filteredProjects = projects.filter(project => {
    const searchLower = debouncedSearchQuery.toLowerCase()
    const matchesSearch = !searchLower || 
      project.project_owner_name?.toLowerCase().includes(searchLower) ||
      project.project_owner_company?.toLowerCase().includes(searchLower) ||
      project.project_owner_email?.toLowerCase().includes(searchLower) ||
      project.project_type?.toLowerCase().includes(searchLower) ||
      project.title?.toLowerCase().includes(searchLower) ||
      project.location_city?.toLowerCase().includes(searchLower) ||
      project.location_country?.toLowerCase().includes(searchLower) ||
      project.budget_range?.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, filterStatus, itemsPerPage])

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
        <p className="text-gray-600 mt-1">View and manage all submitted projects</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Projects</div>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            </div>
            <FolderKanban className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Seeking Backing</div>
              <div className="text-2xl font-bold text-gray-900">{projects.filter(p => p.open_to_backing).length}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Verified</div>
              <div className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'verified').length}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white hover:bg-gray-800 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
          <div className="text-sm text-gray-500">Total: {filteredProjects.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProjects.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">No projects found</td></tr>
              )}
              {paginatedProjects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{project.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500 capitalize mt-1">{project.project_type?.replace('_', ' ')}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.is_featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-0.5" />
                          Featured
                        </span>
                      )}
                      {isPopularProject(project.budget) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800">
                          <Flame className="w-3 h-3 mr-0.5" />
                          Popular
                        </span>
                      )}
                      {isNewProject(project.created_at) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                          <Sparkles className="w-3 h-3 mr-0.5" />
                          New
                        </span>
                      )}
                      {project.open_to_backing && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                          <DollarSign className="w-3 h-3 mr-0.5" />
                          Seeking Backing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.project_owner_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-1">{project.project_owner_company || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {project.budget ? `$${project.budget.toLocaleString()}` : project.budget_range?.replace(/_/g, ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {project.is_remote ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Remote
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[project.location_city, project.location_country].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {project.timeline_start || project.timeline_deadline ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {project.timeline_start ? new Date(project.timeline_start).toLocaleDateString() : 'N/A'}
                        {project.timeline_deadline && ` - ${new Date(project.timeline_deadline).toLocaleDateString()}`}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleFeatured(project.id, project.is_featured)} 
                        title={project.is_featured ? "Unfeature" : "Feature"}
                        className={`p-2 rounded-lg ${project.is_featured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        <Star className={`w-4 h-4 ${project.is_featured ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)} title="View Details" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleVerify(project.id, project.status)} title="Toggle Verified" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                        {project.status === 'verified' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} title="Delete" className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
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
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 rounded-lg ${currentPage === pageNum ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 rounded-lg"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
                <p className="text-sm text-gray-500 mt-1">Complete project information</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {selectedProject.image_url && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={selectedProject.image_url} alt={selectedProject.title} className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.project_owner_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.project_owner_email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.project_owner_company || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusBadge(selectedProject.status)}`}>
                      {selectedProject.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-indigo-600" />
                  Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedProject.project_type?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget Amount</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget Range</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedProject.budget_range?.replace(/_/g, ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedProject.is_remote ? 'Remote' : [selectedProject.location_city, selectedProject.location_country].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remote</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.is_remote ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Timeline Start</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.timeline_start ? new Date(selectedProject.timeline_start).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Timeline Deadline</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.timeline_deadline ? new Date(selectedProject.timeline_deadline).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedProject.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Description
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{selectedProject.description}</p>
                </div>
              )}

              {selectedProject.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Additional Notes
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{selectedProject.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProject.usage && selectedProject.usage.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Usage
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.usage.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProject.departments_needed && selectedProject.departments_needed.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Departments Needed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.departments_needed.map((dept, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedProject.visual_direction_clips && selectedProject.visual_direction_clips.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-purple-600" />
                    Visual Direction Clips
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedProject.visual_direction_clips.map((clip, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-gray-200">
                        <img src={clip} alt={`Visual direction ${idx + 1}`} className="w-full h-32 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.open_to_backing && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Funding Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Funding Stage</label>
                      <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedProject.funding_stage || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Backing Types</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedProject.backing_types?.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-green-200 rounded-full text-xs text-gray-700">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Seeking Partners</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedProject.seeking_partners?.map((partner, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-green-200 rounded-full text-xs text-gray-700">
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {selectedProject.backing_notes && (
                    <div className="mt-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Backing Notes</label>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedProject.backing_notes}</p>
                    </div>
                  )}
                  {selectedProject.rights_collaboration_notes && (
                    <div className="mt-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rights & Collaboration Notes</label>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedProject.rights_collaboration_notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamps
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span> {selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {selectedProject.updated_at ? new Date(selectedProject.updated_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Project</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={createForm.project_type}
                  onChange={(e) => setCreateForm({ ...createForm, project_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="commercial">Commercial</option>
                  <option value="short_film">Short Film</option>
                  <option value="film">Film</option>
                  <option value="music_video">Music Video</option>
                  <option value="documentary">Documentary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  value={createForm.location_city}
                  onChange={(e) => setCreateForm({ ...createForm, location_city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                <Input
                  type="number"
                  value={createForm.budget_amount}
                  onChange={(e) => setCreateForm({ ...createForm, budget_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreateProject} className="bg-black text-white hover:bg-gray-800">Create Project</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
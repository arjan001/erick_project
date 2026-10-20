import React, { useState, useEffect } from 'react'
import { Job, Application, AuditLog } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Briefcase, Search, Eye, Trash2, Calendar, MapPin, CheckCircle, XCircle, X, ChevronLeft, ChevronRight, Users } from 'lucide-react'

const STATUSES = ['draft', 'pending_approval', 'open', 'closed', 'filled']

export default function AdminJobsPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false)
  const [jobApplications, setJobApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const rows = await Job.list('-created_at')
      setJobs(rows || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs(); }, [])

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return
    try {
      await Job.delete(jobId)
      setJobs(prev => prev.filter(j => j.id !== jobId))
      success('Deleted', 'Job deleted successfully')
      AuditLog.create({ actor_email: user?.email, action: 'job.delete', entity_type: 'Job', entity_id: jobId, details: 'Deleted job' }).catch(err => {
        console.error('Failed to create audit log:', err)
      })
    } catch (err) {
      console.error('Error deleting job:', err)
      error('Failed', 'Failed to delete job')
    }
  }

  const handleToggleStatus = async (jobId, currentStatus) => {
    let newStatus
    if (currentStatus === 'pending_approval') {
      newStatus = 'open'; // Approve the job
    } else if (currentStatus === 'open') {
      newStatus = 'closed'
    } else {
      newStatus = 'open'
    }

    try {
      await Job.update(jobId, { status: newStatus })
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
      const message = currentStatus === 'pending_approval' ? 'Job approved and is now live' : 'Job status updated successfully'
      success('Updated', message)
      AuditLog.create({ actor_email: user?.email, action: 'job.status_update', entity_type: 'Job', entity_id: jobId, details: `Changed status to ${newStatus}` }).catch(err => {
        console.error('Failed to create audit log:', err)
      })
    } catch (err) {
      console.error('Error updating job status:', err)
      error('Failed', 'Failed to update job status')
    }
  }





  const handleViewJobDetails = async (job) => {
    setSelectedJob(job)
    setShowJobDetailsModal(true)
    setLoadingApplications(true)
    try {
      const applications = await Application.filter({ job_id: job.id })
      setJobApplications(applications || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
      setJobApplications([])
    } finally {
      setLoadingApplications(false)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      filled: 'bg-blue-100 text-blue-800',
    }
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ')}</span>
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      job.client_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      job.job_type?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, filterStatus])

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
        <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
        <p className="text-gray-600 mt-1">View and manage all posted jobs</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
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
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-500">Total Jobs: {filteredJobs.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pro Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedJobs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No jobs found</td></tr>
              )}
              {paginatedJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{job.short_description || job.description?.substring(0, 100)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.client_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {job.budget_min || job.budget_max ? `$${(job.budget_min || 0).toLocaleString()} - $${(job.budget_max || 0).toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2"><MapPin className="w-3 h-3" />{job.location || 'N/A'}</td>
                  <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleProRequired(job.id, job.requires_subscription)}
                      className={`text-xs px-2 py-1 rounded ${job.requires_subscription ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {job.requires_subscription ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(job.created_at || job.posted_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewJobDetails(job)}
                        className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                        title="Toggle Status"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
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

      {/* Job Details Modal */}
      {showJobDetailsModal && selectedJob && (
        <Dialog open={showJobDetailsModal} onOpenChange={setShowJobDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>View job information and applications</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedJob.title}</h3>
                <p className="text-gray-600">{selectedJob.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p className="text-gray-600">{selectedJob.client_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-gray-600">{selectedJob.location || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Budget</Label>
                  <p className="text-gray-600">
                    {selectedJob.budget_min || selectedJob.budget_max
                      ? `$${(selectedJob.budget_min || 0).toLocaleString()} - $${(selectedJob.budget_max || 0).toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div>{getStatusBadge(selectedJob.status)}</div>
                </div>
              </div>

              {/* Applications Section */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Applications ({jobApplications.length})
                </h4>
                {loadingApplications ? (
                  <div className="text-center py-4 text-gray-500">Loading applications...</div>
                ) : jobApplications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No applications yet</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Applicant</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Applied</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {jobApplications.map(app => (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{app.applicant_name || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{app.applicant_email || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {app.status || 'pending'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJobDetailsModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

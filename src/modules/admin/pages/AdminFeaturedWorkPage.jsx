import React, { useState, useEffect } from 'react'
import { Job } from '@/lib/supabaseEntities'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Calendar, MapPin, DollarSign, User, Eye, Edit2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast.jsx'

export default function AdminFeaturedWorkPage() {
  const { success, error: toastError } = useToast()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    try {
      const jobsData = await Job.list('-created_at', 100)
      setJobs(jobsData || [])
    } catch (err) {
      console.error('Error fetching featured jobs data:', err)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(); }, [])

  const toggleFeatured = async (jobId, currentFeatured) => {
    try {
      await Job.update(jobId, { is_featured: !currentFeatured })
      success('Updated', !currentFeatured ? 'Job marked as featured' : 'Job removed from featured')
      fetchData()
    } catch (err) {
      toastError('Failed', 'Failed to update featured status')
    }
  }

  const viewJobDetails = (job) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  const featuredJobs = jobs.filter(job => job.is_featured === true)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Jobs</h1>
        <p className="text-gray-600">Manage jobs displayed on the landing page's Featured Jobs section</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {featuredJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No featured jobs yet</p>
              <p className="text-sm">Go to Jobs module to mark jobs as featured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {featuredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{job.short_description || job.description?.substring(0, 80)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {job.client_name || job.client_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          {job.budget ? `$${Number(job.budget).toLocaleString()}` : (job.budget_min || job.budget_max ? `$${(job.budget_min || 0).toLocaleString()} - $${(job.budget_max || 0).toLocaleString()}` : 'N/A')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {job.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {job.job_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(job.id, job.is_featured)}
                          className={`p-2 rounded ${job.is_featured ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'}`}
                          title={job.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <Star className={`w-5 h-5 ${job.is_featured ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewJobDetails(job)}
                            className="p-2 hover:bg-gray-100 rounded text-gray-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedJob.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedJob.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Client</label>
                  <p className="text-sm text-gray-900">{selectedJob.client_name || selectedJob.client_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Budget</label>
                  <p className="text-sm text-gray-900">
                    {selectedJob.budget ? `$${Number(selectedJob.budget).toLocaleString()}` : (selectedJob.budget_min || selectedJob.budget_max ? `$${(selectedJob.budget_min || 0).toLocaleString()} - $${(selectedJob.budget_max || 0).toLocaleString()}` : 'N/A')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900">{selectedJob.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Job Type</label>
                  <p className="text-sm text-gray-900">{selectedJob.job_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <p className="text-sm text-gray-900">{selectedJob.status || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Posted Date</label>
                  <p className="text-sm text-gray-900">{selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

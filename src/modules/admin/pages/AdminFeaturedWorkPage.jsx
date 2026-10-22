import React, { useState, useEffect } from 'react'
import { Job } from '@/lib/supabaseEntities'
import { Card, CardContent } from '@/components/ui/card'
import { Star, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast.jsx'

export default function AdminFeaturedWorkPage() {
  const { success, error: toastError } = useToast()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

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

  const filteredJobs = jobs.filter(job => job.is_featured === true)

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
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No featured jobs yet</p>
              <p className="text-sm">Go to Jobs module to mark jobs as featured</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredJobs.map(job => (
                <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500">{job.client_name || 'Unknown client'}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {job.budget_min || job.budget_max ? `$${(job.budget_min || 0).toLocaleString()} - $${(job.budget_max || 0).toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {job.location || 'N/A'}
                  </div>
                  <button
                    onClick={() => toggleFeatured(job.id, job.is_featured)}
                    className={`p-2 rounded ${job.is_featured ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'}`}
                    title={job.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <Star className={`w-5 h-5 ${job.is_featured ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

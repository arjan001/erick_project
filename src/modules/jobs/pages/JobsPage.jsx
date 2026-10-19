import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Job, Project, Artist } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { MapPin, Euro, Clock, Calendar, Building2, Filter, Briefcase, Plus } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/lib/AuthContext'

function getTimeAgo(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function Jobs() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [jobsViewTab, setJobsViewTab] = useState('roles') // 'roles' or 'production'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
    fetchJobs()
  }, [isAuthenticated, navigate])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const [allJobs, allProjects] = await Promise.all([
        Job.list(),
        Project.filter({ status: 'verified' })
      ])

      const openJobs = allJobs.filter(j => j.status === 'open')

      const projectJobs = allProjects.map(project => ({
        id: project.id,
        title: project.title || project.project_type?.replace(/_/g, ' ') || 'Project',
        description: project.notes || project.description || 'No description available',
        location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
        client_name: project.project_owner_name || 'Client',
        roles_needed: project.departments_needed || [],
        budget_min: project.budget_min || 0,
        budget_max: project.budget_max || 0,
        budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : project.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
        payment_type: project.budget_range?.includes('hourly') ? 'per hour' : project.budget_range?.includes('daily') ? 'per day' : 'fixed price',
        posted_at: project.created_at,
        application_deadline: project.timeline_start,
        duration: project.duration,
        isProject: true
      }))

      const allListings = [...openJobs, ...projectJobs]
      setJobs(allListings)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      toastError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (job) => {
    navigate(`/Jobs/${job.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Work</h1>
              <p className="text-sm text-gray-600">Discover opportunities in film, voice over, and more</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setJobsViewTab(jobsViewTab === 'roles' ? 'production' : 'roles')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {jobsViewTab === 'roles' ? 'View Productions' : 'View Roles'}
              </Button>
              <Button
                onClick={() => navigate('/PostJob')}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : jobsViewTab === 'roles' ? (
          // Roles view - show one dummy role
          <div className="space-y-4">
            {jobs.slice(0, 1).flatMap((job) =>
              (job.roles_needed || ['Voice Over', 'Animation']).map((role, roleIdx) => (
                <button
                  key={`${job.id}-${roleIdx}`}
                  onClick={() => handleJobClick({ ...job, selectedRole: role })}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 transition-all overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{role}</h3>
                        <p className="text-sm text-gray-600">{job.title}</p>
                      </div>
                      <span className="text-xs text-gray-500">{getTimeAgo(job.posted_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Voice Over</span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Animation</span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Work from Home</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <Euro className="w-4 h-4" />
                        <span>
                          {job.budget_type === 'Hourly' ? `€${job.budget_min}/hr` :
                            job.budget_type === 'Daily' ? `€${job.budget_min}/day` :
                              `€${job.budget_min}${job.budget_max && job.budget_max > job.budget_min ? ` - €${job.budget_max}` : ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Production view - show one dummy production
          <div className="space-y-4">
            {jobs.slice(0, 1).map((job) => (
              <button
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 transition-all overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.description?.substring(0, 100) || 'Production opportunity'}</p>
                    </div>
                    <span className="text-xs text-gray-500">{getTimeAgo(job.posted_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Film</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Commercial</span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">On Location</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-gray-900">
                      <Euro className="w-4 h-4" />
                      <span>
                        {job.budget_type === 'Hourly' ? `€${job.budget_min}/hr` :
                          job.budget_type === 'Daily' ? `€${job.budget_min}/day` :
                            `€${job.budget_min}${job.budget_max && job.budget_max > job.budget_min ? ` - €${job.budget_max}` : ''}`}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Job, Project, Application } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { MapPin, DollarSign, Clock, Calendar, Search, Filter, X, Building2, User, ChevronRight, ArrowLeft, Send, FileText, Eye, Star } from 'lucide-react'
import { formatKES } from '@/data/shopProducts'

export default function ArtistJobsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { success, error } = useToast()
  
  const [activeTab, setActiveTab] = useState('jobboard') // jobboard, applications, invitations
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [invitations, setInvitations] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [filters, setFilters] = useState({
    role: 'all',
    skill: 'all',
    location: 'all',
    projectType: 'all',
    paid: 'all'
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [applicationFilter, setApplicationFilter] = useState('all') // all, withdrawn

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'jobboard') {
        await fetchJobs()
      } else if (activeTab === 'applications') {
        await fetchApplications()
      } else if (activeTab === 'invitations') {
        await fetchInvitations()
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const allJobs = await Job.filter({ status: 'open' })
      const allProjects = await Project.filter({ status: 'verified' })
      
      // Get user's applications
      const userApplications = await Application.filter({ user_id: user.id })
      const appliedJobIds = userApplications.map(app => app.job_id)
      
      // Combine jobs and projects
      const combined = [
        ...allJobs.map(job => ({
          id: job.id,
          type: 'job',
          title: job.title,
          description: job.description,
          location: job.location,
          budget: job.budget,
          budget_type: job.budget_type,
          duration: job.duration,
          client_name: job.client_name || 'Client',
          client_verified: true,
          image: job.cover_image,
          posted_date: job.created_at,
          required_skills: job.required_skills || [],
          has_applied: appliedJobIds.includes(job.id)
        })),
        ...allProjects.map(project => ({
          id: project.id,
          type: 'project',
          title: project.title || project.project_type,
          description: project.notes,
          location: [project.location_city, project.location_country].filter(Boolean).join(', '),
          budget: project.budget_range,
          budget_type: project.budget_type,
          duration: project.timeline_start,
          client_name: project.project_owner_name,
          client_verified: project.status === 'verified',
          image: project.cover_image,
          posted_date: project.created_at,
          required_skills: project.departments_needed || [],
          has_applied: appliedJobIds.includes(project.id)
        }))
      ]
      
      setJobs(combined)
      if (combined.length > 0) setSelectedJob(combined[0])
    } catch (err) {
      console.error('Error fetching jobs:', err)
    }
  }

  const fetchApplications = async () => {
    try {
      const userApplications = await Application.filter({ user_id: user.id })
      
      const enriched = await Promise.all(
        userApplications.map(async (app) => {
          let jobData = null
          if (app.job_id) {
            jobData = await Job.get(app.job_id)
          } else if (app.project_id) {
            jobData = await Project.get(app.project_id)
          }
          
          return {
            ...app,
            job: jobData ? {
              title: jobData.title || (jobData.project_type || 'Project'),
              location: jobData.location || [jobData.location_city, jobData.location_country].filter(Boolean).join(', '),
              budget: jobData.budget || jobData.budget_range,
              client_name: jobData.client_name || jobData.project_owner_name || 'Client',
              image: jobData.cover_image
            } : null
          }
        })
      )
      
      setApplications(enriched.filter(app => app.job))
    } catch (err) {
      console.error('Error fetching applications:', err)
    }
  }

  const fetchInvitations = async () => {
    try {
      // For now, return empty - this would need a dedicated invitations table
      setInvitations([])
    } catch (err) {
      console.error('Error fetching invitations:', err)
    }
  }

  const handleApply = async () => {
    if (!selectedJob) return
    
    try {
      await Application.create({
        job_id: selectedJob.type === 'job' ? selectedJob.id : null,
        project_id: selectedJob.type === 'project' ? selectedJob.id : null,
        user_id: user.id,
        status: 'pending',
        cover_letter: '',
        media_urls: []
      })
      
      success('Applied', 'Your application has been submitted successfully')
      
      // Update the job's has_applied status
      setJobs(prev => prev.map(job => 
        job.id === selectedJob.id ? { ...job, has_applied: true } : job
      ))
      setSelectedJob(prev => ({ ...prev, has_applied: true }))
    } catch (err) {
      error('Failed', 'Failed to submit application')
    }
  }

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return
    
    try {
      await Application.update(applicationId, { status: 'withdrawn' })
      success('Withdrawn', 'Your application has been withdrawn')
      fetchApplications()
    } catch (err) {
      error('Failed', 'Failed to withdraw application')
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filters.role !== 'all' && !job.required_skills.includes(filters.role)) return false
    if (filters.location !== 'all' && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.paid === 'paid' && !job.budget) return false
    if (filters.paid === 'unpaid' && job.budget) return false
    return true
  })

  const filteredApplications = applications.filter(app => {
    if (applicationFilter === 'withdrawn' && app.status !== 'withdrawn') return false
    if (applicationFilter === 'all' && app.status === 'withdrawn') return false
    return true
  })

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">Back to Site</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('jobboard')}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'jobboard' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Job Board
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'applications' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invitations' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Invitations ({invitations.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'jobboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Job List */}
            <div className="lg:col-span-1">
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Filters</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="actor">Actor</option>
                    <option value="model">Model</option>
                    <option value="voiceover">Voiceover</option>
                    <option value="dancer">Dancer</option>
                  </select>
                  <select
                    value={filters.skill}
                    onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Skills</option>
                    <option value="acting">Acting</option>
                    <option value="modeling">Modeling</option>
                    <option value="singing">Singing</option>
                  </select>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Locations</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                  </select>
                  <select
                    value={filters.projectType}
                    onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="commercial">Commercial</option>
                    <option value="film">Film</option>
                    <option value="tv">TV</option>
                  </select>
                  <select
                    value={filters.paid}
                    onChange={(e) => setFilters({ ...filters, paid: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm col-span-2"
                  >
                    <option value="all">All</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              {/* Job List */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No jobs match your filters
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredJobs.map(job => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedJob?.id === job.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {job.image && (
                            <img
                              src={job.image}
                              alt={job.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                            <p className="text-xs text-gray-600 truncate">{job.client_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{job.location}</span>
                              {job.budget && (
                                <span className="text-xs text-green-600 font-medium">{job.budget}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Job Details */}
            <div className="lg:col-span-2">
              {selectedJob ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {selectedJob.image && (
                    <div className="relative h-64">
                      <img
                        src={selectedJob.image}
                        alt={selectedJob.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {selectedJob.type === 'job' ? 'Job' : 'Project'}
                        </span>
                      </div>
                      {selectedJob.budget && (
                        <div className="absolute bottom-4 right-4">
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-900">
                            {selectedJob.budget_type === 'fixed' ? 'Fixed Price' : selectedJob.budget_type}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{selectedJob.client_name}</span>
                        {selectedJob.client_verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Verified Client</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600">BUDGET</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedJob.budget || 'Contact for price'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600">LOCATION</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedJob.location || 'Remote'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600">DURATION</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{selectedJob.duration || 'Flexible'}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                    </div>

                    {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.required_skills.map((skill, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {selectedJob.has_applied ? (
                        <button
                          disabled
                          className="flex-1 bg-gray-300 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed"
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={handleApply}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                      <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Star className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                  Select a job to view details
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Filter Tabs */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setApplicationFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    applicationFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({applications.length})
                </button>
                <button
                  onClick={() => setApplicationFilter('withdrawn')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    applicationFilter === 'withdrawn' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Withdrawn ({applications.filter(a => a.status === 'withdrawn').length})
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JOB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BUDGET</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLIED</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {app.job?.image && (
                              <img src={app.job.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{app.job?.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{app.job?.client_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{app.job?.budget || 'Contact'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{app.job?.location}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'withdrawn' 
                              ? 'bg-red-100 text-red-800' 
                              : app.status === 'hired'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status === 'withdrawn' ? 'Withdrawn' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const job = jobs.find(j => j.id === app.job_id) || {
                                  id: app.job_id,
                                  title: app.job?.title,
                                  description: app.job?.description,
                                  location: app.job?.location,
                                  budget: app.job?.budget,
                                  budget_type: app.job?.budget_type,
                                  duration: app.job?.duration,
                                  client_name: app.job?.client_name,
                                  client_verified: true,
                                  image: app.job?.image,
                                  required_skills: []
                                }
                                setSelectedJob(job)
                                setActiveTab('jobboard')
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </button>
                            {app.status !== 'withdrawn' && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No invitations yet
          </div>
        )}
      </div>
    </div>
  )
}

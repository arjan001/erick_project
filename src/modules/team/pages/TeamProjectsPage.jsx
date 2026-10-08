import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Project, Team, Application, Job, JobInvitation } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Briefcase, Plus, Filter, Calendar, DollarSign, MapPin, Check, X, Clock, Eye, Building2, Star, Crown, FileText, Send } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'

function getDeviceType(userAgent) {
  if (/Mobile|Android|iP(ad|hone)/i.test(userAgent)) return 'mobile'
  if (/Tablet|iPad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

export default function TeamProjectsPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  const [team, setTeam] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [applications, setApplications] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('board')

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/'
      return
    }
    loadTeamData()
  }, [isAuthenticated])

  const loadTeamData = async () => {
    try {
      let teamData = null
      if (authUser?.team_id) {
        teamData = await Team.filter({ id: authUser.team_id }, '-created_at', 1).then(r => r?.[0] || null)
      } else {
        const teams = await Team.filter({ contact_email: authUser?.email }, '-created_at', 1)
        teamData = teams?.[0] || null
      }
      //
      setTeam(teamData)
      if (teamData) {
        fetchProjects(teamData.id)
      } else {
        //
        setLoading(false)
      }
    } catch (err) {
      //
      toastError('Load Failed', 'Failed to load team data')
      setLoading(false)
    }
  }

  const fetchProjects = async (teamId) => {
    try {
      if (!teamId) {
        //
        setProjects([])
        setLoading(false)
        return
      }

      // Fetch both Jobs and Projects like the artist dashboard does
      // Note: Don't filter applications by team_id yet - column doesn't exist in DB
      const [allJobs, allProjects] = await Promise.all([
        Job.list(),
        Project.filter({ status: 'verified' })
      ])

      // Try to fetch applications by team_id, but handle error gracefully
      let teamApplications = []
      try {
        teamApplications = await Application.filter({ team_id: teamId })
      } catch (err) {
        //:', err.message)
        // Set empty applications array - this means no applications are tracked yet
        teamApplications = []
      }

      setApplications(teamApplications)

      // Fetch team invitations
      const teamInvitations = await JobInvitation.filter({ team_id: teamId })
      setInvitations(teamInvitations || [])

      const openJobs = allJobs.filter(j => j.status === 'open')

      // Fetch view counts from job_views and project_views tables
      const [jobViewCounts, projectViewCounts] = await Promise.all([
        supabase.from('job_views').select('job_id').then(({ data }) => {
          const counts = {}
          data?.forEach(v => {
            counts[v.job_id] = (counts[v.job_id] || 0) + 1
          })
          return counts
        }),
        supabase.from('project_views').select('project_id').then(({ data }) => {
          const counts = {}
          data?.forEach(v => {
            counts[v.project_id] = (counts[v.project_id] || 0) + 1
          })
          return counts
        })
      ])

      // Convert projects to job-like format for unified display
      const projectJobs = allProjects.map(project => ({
        id: project.id,
        title: project.project_type?.replace(/_/g, ' ') || 'Project',
        description: project.notes || project.description || 'No description available',
        short_description: (project.notes || project.description || 'Project opportunity')?.substring(0, 150) + '...',
        location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
        client_name: project.project_owner_name || 'Client',
        client_avatar_url: null,
        budget_min: project.budget_min || 0,
        budget_max: project.budget_max || 0,
        budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : project.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
        payment_type: project.budget_range?.includes('hourly') ? 'per hour' : project.budget_range?.includes('daily') ? 'per day' : 'fixed price',
        roles_needed: project.departments_needed || [],
        skills_required: project.departments_needed || [],
        posted_at: project.created_at,
        application_deadline: project.timeline_start,
        duration: project.duration,
        isProject: true,
        requires_team: project.requires_team || false,
        image_url: project.image_url,
        requires_subscription: project.is_premium || false,
        view_count: projectViewCounts[project.id] || 0
      }))

      // Convert jobs to project-like format for display
      const jobProjects = openJobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        short_description: job.description?.substring(0, 150) + '...',
        location: job.location || 'Remote',
        client_name: 'Client',
        client_avatar_url: null,
        budget_min: job.budget || 0,
        budget_max: job.budget || 0,
        budget_type: 'Fixed',
        payment_type: 'fixed price',
        roles_needed: job.required_skills || [],
        skills_required: job.required_skills || [],
        posted_at: job.created_at,
        application_deadline: job.application_deadline,
        duration: job.duration,
        isProject: false,
        requires_team: false,
        image_url: null,
        requires_subscription: job.is_premium || false,
        view_count: jobViewCounts[job.id] || 0
      }))

      // Combine jobs and projects
      const allListings = [...jobProjects, ...projectJobs]
      setProjects(allListings)
      if (allListings.length > 0) setSelectedProject(allListings[0])
    } catch (err) {
      //
      toastError('Load Failed', 'Failed to load projects. Please try again.')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptProject = async (projectId) => {
    try {
      await Project.update(projectId, { status: 'in_progress' })
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'in_progress' } : p))
      success('Project Accepted', 'Project has been accepted')
    } catch (err) {
      //
      toastError('Action Failed', 'Failed to accept project')
    }
  }

  const handleDeclineProject = async (projectId) => {
    try {
      await Project.update(projectId, { status: 'declined' })
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'declined' } : p))
      success('Project Declined', 'Project has been declined')
    } catch (err) {
      //
      toastError('Action Failed', 'Failed to decline project')
    }
  }

  const handleProjectClick = async (project) => {
    setSelectedProject(project)

    // Track view in job_views or project_views table
    try {
      if (project.isProject) {
        // Insert into project_views - unique constraint will prevent duplicates
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json')
          const { ip } = await ipResponse.json()
          const userAgent = navigator.userAgent
          const deviceType = getDeviceType(userAgent)

          await supabase.from('project_views').insert({
            project_id: project.id,
            user_id: authUser?.id || null,
            ip_address: ip,
            user_agent: userAgent,
            device_type: deviceType,
          })
        } catch (err) {
          // Ignore duplicate key errors - view already tracked
          if (err.code !== '23505') {
            // Silent fail - tracking is not critical
          }
        }
      } else {
        // Insert into job_views - unique constraint will prevent duplicates
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json')
          const { ip } = await ipResponse.json()
          const userAgent = navigator.userAgent
          const deviceType = getDeviceType(userAgent)

          await supabase.from('job_views').insert({
            job_id: project.id,
            user_id: authUser?.id || null,
            ip_address: ip,
            user_agent: userAgent,
            device_type: deviceType,
          })
        } catch (err) {
          // Ignore duplicate key errors - view already tracked
          if (err.code !== '23505') {
            // Silent fail - tracking is not critical
          }
        }
      }
    } catch (err) {
      //
    }
  }

  // Check if team has already applied to selected job/project
  const hasAlreadyApplied = () => {
    if (!selectedProject || !applications) return false
    return applications.some(app => {
      if (selectedProject.isProject) {
        return app.project_id === selectedProject.id
      } else {
        return app.job_id === selectedProject.id
      }
    })
  }

  const handleApply = async () => {
    if (!selectedProject || !team) return

    if (hasAlreadyApplied()) {
      toastError('Already Applied', 'You have already applied to this position')
      return
    }

    try {
      await Application.create({
        job_id: selectedProject.isProject ? null : selectedProject.id,
        project_id: selectedProject.isProject ? selectedProject.id : null,
        team_id: team.id,
        status: 'pending',
        applied_at: new Date().toISOString()
      })

      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff']
      })

      success('Application Submitted Successfully', 'Your team application has been submitted')

      // Refresh applications
      const teamApplications = await Application.filter({ team_id: team.id })
      setApplications(teamApplications)
    } catch (err) {
      //
      toastError('Application Failed', 'Failed to submit application')
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true
    return project.status === filterStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Projects & Jobs</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('board')}
              className={`pb-4 font-semibold text-base transition-colors ${activeTab === 'board'
                ? 'text-black border-b-2 border-black -mb-0.5'
                : 'text-gray-600 hover:text-black'
                }`}
            >
              Job Board
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-4 font-semibold text-base transition-colors ${activeTab === 'applications'
                ? 'text-black border-b-2 border-black -mb-0.5'
                : 'text-gray-600 hover:text-black'
                }`}
            >
              Applications {applications.length > 0 && `(${applications.length})`}
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`pb-4 font-semibold text-base transition-colors ${activeTab === 'invitations'
                ? 'text-black border-b-2 border-black -mb-0.5'
                : 'text-gray-600 hover:text-black'
                }`}
            >
              Invitations {invitations.length > 0 && `(${invitations.length})`}
            </button>
          </div>

          {/* Filters - only show on board tab */}
          {activeTab === 'board' && (
            <div className="flex gap-3 pt-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'board' && (
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Left Side - Job List */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4">
                {filteredProjects.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No jobs match your filters
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectClick(project)}
                        className={`w-full text-left bg-white rounded-2xl border-2 transition-all overflow-hidden shadow-sm hover:shadow-lg ${selectedProject?.id === project.id
                          ? 'border-black shadow-md ring-2 ring-black/5'
                          : 'border-gray-100 hover:border-gray-300'
                          }`}
                      >
                        {/* Job Card Image */}
                        <div className="relative h-32 bg-gray-100">
                          {project.image_url ? (
                            <img
                              src={project.image_url}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Briefcase className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                          {project.isProject && (
                            <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                              Project
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur text-black text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                            {project.budget_type === 'Hourly' ? '€/hr' : project.budget_type === 'Daily' ? '€/day' : 'Fixed'}
                          </div>
                          {project.requires_subscription && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                              Premium
                            </div>
                          )}
                        </div>

                        {/* Job Card Content */}
                        <div className="p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-gray-50">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-gray-900 truncate">{project.client_name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2 h-2" />
                                <span className="truncate">{project.location || 'Remote'}</span>
                              </div>
                            </div>
                          </div>

                          <h3 className="font-bold text-gray-900 mb-1 text-xs line-clamp-2 leading-tight">{project.title}</h3>

                          {/* View Count */}
                          {project.view_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Eye className="w-2 h-2" />
                              <span>{project.view_count} view{project.view_count !== 1 ? 's' : ''}</span>
                            </div>
                          )}

                          {/* Skills/Roles Tags */}
                          {project.roles_needed && project.roles_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.roles_needed.slice(0, 2).map((role) => (
                                <span key={role} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full truncate max-w-[80px]">
                                  {role}
                                </span>
                              ))}
                              {project.roles_needed.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                  +{project.roles_needed.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              <div className="font-bold text-gray-900 text-xs">
                                {project.budget_type === 'Hourly' ? `€${project.budget_min}/hr` : project.budget_type === 'Daily' ? `€${project.budget_min}/day` : `€${project.budget_min}`}
                              </div>
                              {project.budget_max && project.budget_max > project.budget_min && project.budget_type !== 'Hourly' && project.budget_type !== 'Daily' && (
                                <div className="text-[10px] text-gray-500">- €{project.budget_max}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock className="w-2 h-2" />
                              {project.posted_at ? new Date(project.posted_at).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Details Panel */}
              <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
                {selectedProject ? (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    {/* Header with Image */}
                    <div className="relative h-48 bg-gray-100 rounded-xl mb-6 overflow-hidden">
                      {selectedProject.image_url ? (
                        <img
                          src={selectedProject.image_url}
                          alt={selectedProject.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Briefcase className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {selectedProject.isProject && (
                        <div className="absolute top-3 left-3 bg-black text-white text-sm font-bold px-3 py-1.5 rounded">
                          Project
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-black text-sm font-bold px-3 py-1.5 rounded shadow">
                        {selectedProject.budget_type === 'Hourly' ? 'Hourly Rate' : selectedProject.budget_type === 'Daily' ? 'Daily Rate' : 'Fixed Price'}
                      </div>
                      {selectedProject.requires_subscription && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-bold px-3 py-1.5 rounded shadow">
                          Premium
                        </div>
                      )}
                    </div>

                    {/* Client Info */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-black mb-1">{selectedProject.title}</h1>
                        <p className="text-gray-600 text-sm font-medium">{selectedProject.client_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-500">Verified Client</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Budget</div>
                        <div className="text-lg font-bold text-black">
                          {selectedProject.budget_type === 'Hourly' ? `€${selectedProject.budget_min}/hr` : selectedProject.budget_type === 'Daily' ? `€${selectedProject.budget_min}/day` : `€${selectedProject.budget_min}`}
                        </div>
                        {selectedProject.budget_max && selectedProject.budget_max > selectedProject.budget_min && selectedProject.budget_type !== 'Hourly' && selectedProject.budget_type !== 'Daily' && (
                          <div className="text-xs text-gray-500">up to €{selectedProject.budget_max}</div>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Location</div>
                        <div className="text-sm font-bold text-black truncate">{selectedProject.location}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Duration</div>
                        <div className="text-sm font-bold text-black">{selectedProject.duration || 'Flexible'}</div>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-black rounded"></span>
                        Job Description
                      </h2>
                      <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50 rounded-lg p-4">
                        {selectedProject.description}
                      </div>
                    </div>

                    {/* Skills Required */}
                    {selectedProject.skills_required && selectedProject.skills_required.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                          <span className="w-1 h-5 bg-black rounded"></span>
                          Skills Required
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.skills_required.map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply Button */}
                    <Button
                      className={`w-full py-3 text-lg font-bold ${hasAlreadyApplied()
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      onClick={handleApply}
                      disabled={hasAlreadyApplied()}
                    >
                      {hasAlreadyApplied() ? 'Application Sent' : 'Apply Now'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a job to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="flex-1 overflow-y-auto p-6">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No applications yet</p>
                <p className="text-sm mt-1">Start applying to jobs to track your applications here</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">Application #{app.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="flex-1 overflow-y-auto p-6">
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Send className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No invitations yet</p>
                <p className="text-sm mt-1">Clients will send invitations here</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="space-y-4">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">Invitation #{inv.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">Sent: {new Date(inv.sent_at).toLocaleDateString()}</p>
                          {inv.message && <p className="text-sm text-gray-500 mt-1">{inv.message}</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${inv.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          inv.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
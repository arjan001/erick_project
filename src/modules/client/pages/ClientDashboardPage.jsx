import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { ProjectOwner, Project, Job, Application, Message } from '@/lib/supabaseEntities'
import { supabase } from '@/lib/supabase'
import ClientOverviewCards from '@/components/client/ClientOverviewCards'
import ClientActivityChart from '@/components/client/ClientActivityChart'
import ClientStatusDonut from '@/components/client/ClientStatusDonut'
import ClientRecentApplications from '@/components/client/ClientRecentApplications'
import ClientProjectCard from '@/components/client/ClientProjectCard'
import ClientJobRow from '@/components/client/ClientJobRow'
import ClientPostProjectModal from '@/components/client/ClientPostProjectModal'
// import OnboardingTour from '@/components/onboarding/OnboardingTour' // Commented out - not needed
import { Plus, Briefcase, Send, MessageSquare, FolderKanban, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InviteCodeCard from '@/components/InviteCodeCard'
import { useToast } from '@/hooks/useToast.jsx'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth()
  const { success, error: toastError } = useToast()

  const [user, setUser] = useState(null)
  const [projectOwner, setProjectOwner] = useState(null)
  const [projects, setProjects] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  // const [showTour, setShowTour] = useState(false) // Commented out - onboarding modal not needed

  // Clear any stored AI context when dashboard loads
  useEffect(() => {
    localStorage.removeItem('smartgigs_ai_modal_context')
    localStorage.removeItem('smartgigs_ai_modal_draft')
  }, [])

  useEffect(() => {
    if (isLoadingAuth) return
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    if (!authUser) return
    setUser(authUser)

    const fetchData = async () => {
      try {
        // Get client record by user_id
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle()

        if (clientError) {
          console.error('Error fetching client data:', clientError)
        }

        const owner = clientData || { display_name: authUser.full_name || 'Client' }
        setProjectOwner(owner)

        // Fetch projects by client_id
        let projectsData = []
        if (clientData) {
          projectsData = await Project.filter({ client_id: clientData.id }, '-created_at', 20)
        }
        setProjects(projectsData || [])

        // Fetch jobs by client_id
        let jobsData = []
        if (clientData) {
          jobsData = await Job.filter({ client_id: clientData.id }, '-created_at', 20)
        }
        setJobs(jobsData || [])

        const projectIds = new Set((projectsData || []).map((p) => p.id))
        const jobIds = new Set((jobsData || []).map((j) => j.id))
        const allApplications = await Application.list('-created_at', 200)
        const myApplications = (allApplications || []).filter(
          (a) => (a.project_id && projectIds.has(a.project_id)) || (a.job_id && jobIds.has(a.job_id))
        )
        setApplications(myApplications)

        // Fetch messages by conversation_id (correct schema)
        // For now, set to 0 until proper conversation-based messaging is implemented
        setUnreadMessages(0)

        // Check if tour was dismissed
        // const tourDismissed = localStorage.getItem('onboarding_dismissed_client')
        // if (!tourDismissed) {
        //   setShowTour(true)
        // }
        // Onboarding tour disabled - not needed
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setProjects([])
        setJobs([])
        setApplications([])
        setUnreadMessages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoadingAuth, isAuthenticated, authUser, navigate])

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await Project.delete(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      success('Deleted', 'Project deleted')
    } catch (err) {
      console.error('Error deleting project:', err)
      toastError('Error', 'Failed to delete project')
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      await Job.delete(jobId)
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      success('Deleted', 'Job deleted')
    } catch (err) {
      console.error('Error deleting job:', err)
      toastError('Error', 'Failed to delete job')
    }
  }

  const openProjectModal = (project = null) => {
    setEditingProject(project)
    setShowProjectModal(true)
  }

  if (isLoadingAuth || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return null

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban },
    { label: 'Active Projects', value: projects.filter((p) => p.status === 'verified' || p.status === 'in_progress').length, icon: Briefcase },
    { label: 'Applications', value: applications.length, icon: Send },
    { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare }
  ]

  // Build last-6-months project activity chart data
  const now = new Date()
  const monthBuckets = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString('en-US', { month: 'short' }), projects: 0 }
  })
  projects.forEach((p) => {
    if (!p.created_date) return
    const d = new Date(p.created_date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = monthBuckets.find((b) => b.key === key)
    if (bucket) bucket.projects += 1
  })

  const statusData = ['submitted', 'verified', 'in_progress', 'delivered', 'rejected'].map((s) => ({
    name: s.replace(/_/g, ' '),
    value: projects.filter((p) => p.status === s).length
  }))

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="w-full">
        <div className="px-4 sm:px-5 md:px-7 lg:px-9 pt-7 pb-12">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Client'}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg transition-all text-sm font-medium px-6 py-2.5 rounded-xl"
                onClick={() => navigate('/ClientPostProject')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Project
              </Button>
              {/* AI button disabled */}
              {/* <Button
                variant="outline"
                className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-all text-sm font-medium px-6 py-2.5 rounded-xl"
                onClick={() => setShowAIModal(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Post with AI
              </Button> */}
            </div>
          </div>

          {/* Stats Cards - matching artist dashboard style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              const accents = ['#2A9D8F', '#F4A261', '#E9C46A', '#2A9D8F']
              return (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accents[idx]}20` }}>
                      <Icon className="w-5 h-5" style={{ color: accents[idx] }} />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-6">Project Activity</h3>
              <ClientActivityChart data={monthBuckets} />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-6">Project Status</h3>
              <ClientStatusDonut data={statusData} />
            </div>
          </div>

          {/* Recent Applications */}
          <div className="mt-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Recent Applications</h3>
            <ClientRecentApplications applications={applications} projects={projects} jobs={jobs} />
          </div>

          {/* Projects & Jobs Section */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Projects & Jobs</h2>
            </div>

            {projects.length === 0 && jobs.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-16 text-center border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <FolderKanban className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects or jobs yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">Start by posting your first project or job to connect with talented creators</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg rounded-xl"
                    onClick={() => openProjectModal()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Project
                  </Button>
                  {/* AI button disabled */}
                  {/* <Button
                    variant="outline"
                    className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-xl"
                    onClick={() => setShowAIModal(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Post with AI
                  </Button> */}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {/* Project Cards */}
                {projects.map((project) => (
                  <ClientProjectCard key={project.id} project={project} onEdit={() => openProjectModal(project)} onDelete={handleDeleteProject} />
                ))}
                {/* Job Cards */}
                {jobs.map((job) => (
                  <div key={job.id} className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold bg-[#4F46E5] text-white px-2.5 py-1 rounded-md">Job</span>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base">{job.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                      <span className="font-semibold text-gray-900">€{job.budget || 'TBD'}</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || 'Remote'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite Code Card */}
          <div className="mt-6">
            <InviteCodeCard />
          </div>
        </div>
      </main>

      <ClientPostProjectModal
        open={showProjectModal}
        onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
        user={user}
        editingProject={editingProject}
      />

      {/* Onboarding tour disabled - not needed */}
      {/* {showTour && (
        <OnboardingTour
          userRole="client"
          onClose={() => setShowTour(false)}
          onComplete={() => setShowTour(false)}
        />
      )} */}
    </div>
  )
}
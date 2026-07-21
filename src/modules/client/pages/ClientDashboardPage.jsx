import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ProjectOwner, Project, Job, Application, Message } from '@/lib/supabaseEntities';
import ClientOverviewCards from '@/components/client/ClientOverviewCards';
import ClientActivityChart from '@/components/client/ClientActivityChart';
import ClientStatusDonut from '@/components/client/ClientStatusDonut';
import ClientRecentApplications from '@/components/client/ClientRecentApplications';
import ClientProjectCard from '@/components/client/ClientProjectCard';
import ClientJobRow from '@/components/client/ClientJobRow';
import ClientJobModal from '@/components/client/ClientJobModal';
import ClientPostProjectModal from '@/components/client/ClientPostProjectModal';
import { Plus, Briefcase, Send, MessageSquare, FolderKanban, X, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InviteCodeCard from '@/components/InviteCodeCard';
import { useToast } from '@/hooks/useToast.jsx';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();
  const { success, error: toastError } = useToast();

  const [user, setUser] = useState(null);
  const [projectOwner, setProjectOwner] = useState(null);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', job_type: 'director', employment_type: '', location: '', budget: '', duration: '', required_skills: '' });

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    if (!authUser) return;
    setUser(authUser);

    const fetchData = async () => {
      try {
        const owners = await ProjectOwner.filter({ email: authUser.email }, '-created_at', 1);
        const owner = owners?.[0] || { email: authUser.email, full_name: authUser.full_name };
        setProjectOwner(owner);

        const projectsData = await Project.filter({ project_owner_email: authUser.email }, '-created_at', 20);
        setProjects(projectsData || []);

        const jobsData = await Job.filter({ client_email: authUser.email }, '-created_at', 20);
        setJobs(jobsData || []);

        const projectIds = new Set((projectsData || []).map((p) => p.id));
        const jobIds = new Set((jobsData || []).map((j) => j.id));
        const allApplications = await Application.list('-created_at', 200);
        const myApplications = (allApplications || []).filter(
          (a) => (a.project_id && projectIds.has(a.project_id)) || (a.job_id && jobIds.has(a.job_id))
        );
        setApplications(myApplications);

        const messages = await Message.filter({ recipient_email: authUser.email }, '-created_at', 100);
        setUnreadMessages((messages || []).filter((m) => !m.is_read).length);
      } catch (err) {
        console.error('Error fetching client data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoadingAuth, isAuthenticated, authUser, navigate]);

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await Project.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      success('Deleted', 'Project deleted');
    } catch (err) {
      console.error('Error deleting project:', err);
      toastError('Error', 'Failed to delete project');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await Job.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      success('Deleted', 'Job deleted');
    } catch (err) {
      console.error('Error deleting job:', err);
      toastError('Error', 'Failed to delete job');
    }
  };

  const handleCreateJob = async () => {
    if (!projectOwner) return;
    try {
      const newJob = await Job.create({
        client_email: user.email,
        title: jobForm.title,
        description: jobForm.description,
        job_type: jobForm.job_type,
        employment_type: jobForm.employment_type,
        location: jobForm.location,
        budget: parseFloat(jobForm.budget) || 0,
        duration: jobForm.duration,
        required_skills: jobForm.required_skills.split(',').map((s) => s.trim()).filter((s) => s),
        status: 'open',
        created_date: new Date().toISOString()
      });
      setJobs((prev) => [...prev, newJob]);
      setShowJobModal(false);
      setJobForm({ title: '', description: '', job_type: 'director', employment_type: '', location: '', budget: '', duration: '', required_skills: '' });
      success('Job Created', 'Job created successfully');
    } catch (err) {
      console.error('Error creating job:', err);
      toastError('Creation Failed', 'Failed to create job');
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    try {
      const updatedJob = await Job.update(editingJob.id, {
        title: jobForm.title,
        description: jobForm.description,
        job_type: jobForm.job_type,
        employment_type: jobForm.employment_type,
        location: jobForm.location,
        budget: parseFloat(jobForm.budget) || 0,
        duration: jobForm.duration,
        required_skills: jobForm.required_skills.split(',').map((s) => s.trim()).filter((s) => s)
      });
      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updatedJob : j)));
      setShowJobModal(false);
      setEditingJob(null);
      setJobForm({ title: '', description: '', job_type: 'director', employment_type: '', location: '', budget: '', duration: '', required_skills: '' });
      success('Job Updated', 'Job updated successfully');
    } catch (err) {
      console.error('Error updating job:', err);
      toastError('Update Failed', 'Failed to update job');
    }
  };

  const openProjectModal = (project = null) => {
    if (project) {
      navigate('/ClientPostProject', { state: { editingProject: project } });
    } else {
      navigate('/ClientPostProject');
    }
  };

  const openJobModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title || '',
        description: job.description || '',
        job_type: job.job_type || 'director',
        employment_type: job.employment_type || '',
        location: job.location || '',
        budget: job.budget || '',
        duration: job.duration || '',
        required_skills: Array.isArray(job.required_skills) ? job.required_skills.join(', ') : (job.required_skills || '')
      });
    } else {
      setEditingJob(null);
      setJobForm({ title: '', description: '', job_type: 'director', employment_type: '', location: '', budget: '', duration: '', required_skills: '' });
    }
    setShowJobModal(true);
  };

  if (isLoadingAuth || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban },
    { label: 'Active Projects', value: projects.filter((p) => p.status === 'verified' || p.status === 'in_progress').length, icon: Briefcase },
    { label: 'Applications', value: applications.length, icon: Send },
    { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare }
  ];

  // Build last-6-months project activity chart data
  const now = new Date();
  const monthBuckets = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString('en-US', { month: 'short' }), projects: 0 };
  });
  projects.forEach((p) => {
    if (!p.created_date) return;
    const d = new Date(p.created_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.projects += 1;
  });

  const statusData = ['submitted', 'verified', 'in_progress', 'delivered', 'rejected'].map((s) => ({
    name: s.replace(/_/g, ' '),
    value: projects.filter((p) => p.status === s).length
  }));

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <main className="w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user?.full_name?.split(' ')[0] || 'Client'}</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your projects and connect with creative talent</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 transition-all text-sm sm:text-base"
                onClick={() => openProjectModal()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Project
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-all text-sm sm:text-base"
                onClick={() => openJobModal()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Post with AI
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Activity</h3>
              <ClientActivityChart data={monthBuckets} />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <ClientStatusDonut data={statusData} />
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
            <ClientRecentApplications applications={applications} projects={projects} jobs={jobs} />
          </div>

          {/* Projects & Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Projects & Jobs</h2>
            </div>

            {projects.length === 0 && jobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderKanban className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No projects or jobs yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Start by posting your first project or job to connect with talented creators</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20" 
                    onClick={() => openProjectModal()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Project
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => openJobModal()}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Project Cards */}
                {projects.map((project) => (
                  <ClientProjectCard key={project.id} project={project} onEdit={() => openProjectModal(project)} onDelete={handleDeleteProject} />
                ))}
                {/* Job Cards */}
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full">Job</span>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">{job.title}</h3>
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
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <InviteCodeCard />
        </div>
      </main>

      <ClientPostProjectModal
        open={showProjectModal}
        onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
        user={user}
        editingProject={editingProject}
      />

      <ClientJobModal
        open={showJobModal}
        editing={!!editingJob}
        form={jobForm}
        setForm={setJobForm}
        onClose={() => setShowJobModal(false)}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
      />
    </div>
  );
}
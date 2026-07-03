import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ProjectOwner, Project, Job, Application, Message } from '@/lib/supabaseEntities';
import ClientOverviewCards from '@/components/client/ClientOverviewCards';
import ClientActivityChart from '@/components/client/ClientActivityChart';
import ClientStatusDonut from '@/components/client/ClientStatusDonut';
import ClientRecentApplications from '@/components/client/ClientRecentApplications';
import ClientProfileHeader from '@/components/client/ClientProfileHeader';
import ClientProjectCard from '@/components/client/ClientProjectCard';
import ClientJobRow from '@/components/client/ClientJobRow';
import ClientProjectModal from '@/components/client/ClientProjectModal';
import ClientJobModal from '@/components/client/ClientJobModal';
import { Plus, Briefcase, Send, MessageSquare, FolderKanban } from 'lucide-react';
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

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingSocial, setEditingSocial] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profileCompanyName, setProfileCompanyName] = useState('');
  const [profileIndustry, setProfileIndustry] = useState('');
  const [profileCompanySize, setProfileCompanySize] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileBio, setProfileBio] = useState('');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', project_type: 'commercial', budget: '', location: '' });
  const [jobForm, setJobForm] = useState({ title: '', description: '', job_type: 'director', location: '', budget: '', required_skills: '' });

  const logoInputRef = React.useRef(null);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    if (!authUser) return;
    setUser(authUser);

    const fetchData = async () => {
      try {
        const owners = await ProjectOwner.filter({ email: authUser.email }, '-created_date', 1);
        const owner = owners?.[0] || { email: authUser.email, full_name: authUser.full_name };
        setProjectOwner(owner);
        setProfileCompanyName(owner.company || '');
        setProfileIndustry('');
        setProfileCompanySize('');
        setProfileWebsite(owner.website || '');
        setProfileBio('');

        const projectsData = await Project.filter({ project_owner_email: authUser.email }, '-created_date', 20);
        setProjects(projectsData || []);

        const jobsData = await Job.filter({ client_email: authUser.email }, '-created_date', 20);
        setJobs(jobsData || []);

        const projectIds = new Set((projectsData || []).map((p) => p.id));
        const jobIds = new Set((jobsData || []).map((j) => j.id));
        const allApplications = await Application.list('-created_date', 200);
        const myApplications = (allApplications || []).filter(
          (a) => (a.project_id && projectIds.has(a.project_id)) || (a.job_id && jobIds.has(a.job_id))
        );
        setApplications(myApplications);

        const messages = await Message.filter({ recipient_email: authUser.email }, '-created_date', 100);
        setUnreadMessages((messages || []).filter((m) => !m.is_read).length);
      } catch (err) {
        console.error('Error fetching client data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoadingAuth, isAuthenticated, authUser, navigate]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !projectOwner) return;
    setUploadingLogo(true);
    try {
      const fileUrl = URL.createObjectURL(file);
      setProjectOwner((prev) => ({ ...prev, logo_url: fileUrl }));
    } catch (err) {
      console.error('Error uploading logo:', err);
      toastError('Upload Failed', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!projectOwner) return;
    setProjectOwner((prev) => ({ ...prev, company_name: profileCompanyName, industry: profileIndustry, company_size: profileCompanySize }));
    setEditingProfile(false);
  };

  const handleSaveBio = async () => {
    if (!projectOwner) return;
    setProjectOwner((prev) => ({ ...prev, bio: profileBio }));
    setEditingBio(false);
  };

  const handleSaveSocial = async () => {
    if (!projectOwner) return;
    setProjectOwner((prev) => ({ ...prev, website: profileWebsite }));
    setEditingSocial(false);
  };

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

  const handleCreateProject = async () => {
    if (!user) return;
    try {
      const newProject = await Project.create({
        project_owner_email: user.email,
        project_owner_name: user.full_name,
        notes: projectForm.description,
        project_type: projectForm.project_type,
        location_city: projectForm.location,
        status: 'submitted'
      });
      setProjects((prev) => [...prev, newProject]);
      setShowProjectModal(false);
      setProjectForm({ title: '', description: '', project_type: 'commercial', budget: '', location: '' });
      success('Project Created', 'Project created successfully');
    } catch (err) {
      console.error('Error creating project:', err);
      toastError('Creation Failed', 'Failed to create project');
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    try {
      const updatedProject = await Project.update(editingProject.id, {
        notes: projectForm.description,
        project_type: projectForm.project_type,
        location_city: projectForm.location
      });
      setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updatedProject : p)));
      setShowProjectModal(false);
      setEditingProject(null);
      setProjectForm({ title: '', description: '', project_type: 'commercial', budget: '', location: '' });
      success('Updated', 'Project updated successfully');
    } catch (err) {
      console.error('Error updating project:', err);
      toastError('Error', 'Failed to update project');
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
        location: jobForm.location,
        budget: parseFloat(jobForm.budget) || 0,
        required_skills: jobForm.required_skills.split(',').map((s) => s.trim()).filter((s) => s),
        status: 'open',
        created_date: new Date().toISOString()
      });
      setJobs((prev) => [...prev, newJob]);
      setShowJobModal(false);
      setJobForm({ title: '', description: '', job_type: 'director', location: '', budget: '', required_skills: '' });
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
        location: jobForm.location,
        budget: parseFloat(jobForm.budget) || 0,
        required_skills: jobForm.required_skills.split(',').map((s) => s.trim()).filter((s) => s)
      });
      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updatedJob : j)));
      setShowJobModal(false);
      setEditingJob(null);
      setJobForm({ title: '', description: '', job_type: 'director', location: '', budget: '', required_skills: '' });
      success('Job Updated', 'Job updated successfully');
    } catch (err) {
      console.error('Error updating job:', err);
      toastError('Update Failed', 'Failed to update job');
    }
  };

  const openProjectModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        title: project.title || '',
        description: project.description || project.notes || '',
        project_type: project.project_type || 'commercial',
        budget: project.budget || '',
        location: project.location || project.location_city || ''
      });
    } else {
      setEditingProject(null);
      setProjectForm({ title: '', description: '', project_type: 'commercial', budget: '', location: '' });
    }
    setShowProjectModal(true);
  };

  const openJobModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title || '',
        description: job.description || '',
        job_type: job.job_type || 'director',
        location: job.location || '',
        budget: job.budget || '',
        required_skills: Array.isArray(job.required_skills) ? job.required_skills.join(', ') : (job.required_skills || '')
      });
    } else {
      setEditingJob(null);
      setJobForm({ title: '', description: '', job_type: 'director', location: '', budget: '', required_skills: '' });
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
    <div className="bg-gray-50">
      <main className="w-full flex flex-col">
        <ClientProfileHeader
          user={user}
          projectOwner={projectOwner}
          uploadingLogo={uploadingLogo}
          logoInputRef={logoInputRef}
          onLogoUpload={handleLogoUpload}
          companyName={profileCompanyName}
          editingProfile={editingProfile}
          setEditingProfile={setEditingProfile}
          editingBio={editingBio}
          setEditingBio={setEditingBio}
          profileBio={profileBio}
          setProfileBio={setProfileBio}
          onSaveBio={handleSaveBio}
          editingSocial={editingSocial}
          setEditingSocial={setEditingSocial}
          profileWebsite={profileWebsite}
          setProfileWebsite={setProfileWebsite}
          onSaveSocial={handleSaveSocial}
          profileIndustry={profileIndustry}
          setProfileIndustry={setProfileIndustry}
          profileCompanyName={profileCompanyName}
          setProfileCompanyName={setProfileCompanyName}
          profileCompanySize={profileCompanySize}
          setProfileCompanySize={setProfileCompanySize}
          onSaveProfile={handleSaveProfile}
        />

        <div className="p-6 space-y-6">
          <ClientOverviewCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ClientActivityChart data={monthBuckets} />
            </div>
            <ClientStatusDonut data={statusData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 text-white flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-2">Ready to start a new project?</h2>
              <p className="text-sm mb-4 text-gray-300">Connect with talented creators and teams to bring your vision to life</p>
              <div className="flex gap-3">
                <Button className="bg-white text-gray-900 hover:bg-gray-100" onClick={() => openProjectModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Project
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => openJobModal()}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </div>
            </div>
            <ClientRecentApplications applications={applications} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
              <Button variant="outline" size="sm" onClick={() => openProjectModal()}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Start by posting your first project</p>
                <Button className="bg-black text-white hover:bg-gray-800" onClick={() => openProjectModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ClientProjectCard key={project.id} project={project} onEdit={openProjectModal} onDelete={handleDeleteProject} />
                ))}
              </div>
            )}
          </div>

          {jobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Job Posts</h2>
                <Button variant="outline" size="sm" onClick={() => openJobModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
                </Button>
              </div>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <ClientJobRow key={job.id} job={job} onEdit={openJobModal} onDelete={handleDeleteJob} />
                ))}
              </div>
            </div>
          )}
        </div>

        <InviteCodeCard />
      </main>

      <ClientProjectModal
        open={showProjectModal}
        editing={!!editingProject}
        form={projectForm}
        setForm={setProjectForm}
        onClose={() => setShowProjectModal(false)}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
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
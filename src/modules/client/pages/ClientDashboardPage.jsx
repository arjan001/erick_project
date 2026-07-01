import React, { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '@/lib/AuthContext';

import { ProjectOwner, Project, Job } from '@/lib/supabaseEntities';

import DashboardStatCard from '@/components/DashboardStatCard';

import { Plus, Briefcase, Users, MessageSquare, TrendingUp, Calendar, MapPin, Eye, Send, Edit2, X, Globe, Upload, Film } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { createPageUrl } from '@/shared/utils/routing';

import { useToast } from '@/hooks/useToast.jsx';



export default function ClientDashboard() {

  const navigate = useNavigate();

  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();

  const { success, error: toastError } = useToast();

  const [user, setUser] = useState(null);

  const [projectOwner, setProjectOwner] = useState(null);

  const [projects, setProjects] = useState([]);

  const [jobs, setJobs] = useState([]);

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

  const [projectForm, setProjectForm] = useState({

    title: '',

    description: '',

    project_type: 'commercial',

    budget: '',

    location: ''

  });

  const [jobForm, setJobForm] = useState({

    title: '',

    description: '',

    job_type: 'director',

    location: '',

    budget: '',

    required_skills: ''

  });

  const logoInputRef = React.useRef(null);



  useEffect(() => {

    if (isLoadingAuth) return;

    if (!isAuthenticated) { navigate('/SignIn'); return; }

    if (!authUser) return;

    setUser(authUser);



    const fetchData = async () => {

      try {

        // Load real ProjectOwner profile
        const owners = await ProjectOwner.filter({ email: authUser.email }, '-created_date', 1);
        const owner = owners?.[0] || { email: authUser.email, full_name: authUser.full_name };
        setProjectOwner(owner);
        setProfileCompanyName(owner.company || '');
        setProfileIndustry('');
        setProfileCompanySize('');
        setProfileWebsite(owner.website || '');
        setProfileBio('');

        // Load real projects
        const projectsData = await Project.filter({ project_owner_email: authUser.email }, '-created_date', 20);
        setProjects(projectsData || []);

        // Load real jobs
        const jobsData = await Job.filter({ client_email: authUser.email }, '-created_date', 20);
        setJobs(jobsData || []);

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
      setProjectOwner(prev => ({ ...prev, logo_url: fileUrl }));

    } catch (err) {

      console.error('Error uploading logo:', err);

      alert('Failed to upload logo');

    } finally {

      setUploadingLogo(false);

    }

  };



  const handleSaveProfile = async () => {

    if (!projectOwner) return;

    try {

      setProjectOwner(prev => ({

        ...prev,

        company_name: profileCompanyName,

        industry: profileIndustry,

        company_size: profileCompanySize

      }));

      setEditingProfile(false);

    } catch (err) {

      console.error('Error saving profile:', err);

      alert('Failed to save profile');

    }

  };



  const handleSaveBio = async () => {

    if (!projectOwner) return;

    try {

      setProjectOwner(prev => ({ ...prev, bio: profileBio }));

      setEditingBio(false);

    } catch (err) {

      console.error('Error saving bio:', err);

      alert('Failed to save bio');

    }

  };



  const handleSaveSocial = async () => {

    if (!projectOwner) return;

    try {

      setProjectOwner(prev => ({ ...prev, website: profileWebsite }));

      setEditingSocial(false);

    } catch (err) {

      console.error('Error saving social:', err);

      toastError('Save Failed', 'Failed to save social');

    }

  };



  const handleDeleteProject = async (projectId) => {

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {

      await Project.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
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
        status: 'submitted',
      });

      setProjects(prev => [...prev, newProject]);

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
        location_city: projectForm.location,
      });

      setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));

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
      setJobs(prev => prev.filter(j => j.id !== jobId));
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

        required_skills: jobForm.required_skills.split(',').map(s => s.trim()).filter(s => s),

        status: 'open',

        created_date: new Date().toISOString()

      });

      setJobs(prev => [...prev, newJob]);

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

        required_skills: jobForm.required_skills.split(',').map(s => s.trim()).filter(s => s)

      });

      setJobs(prev => prev.map(j => j.id === editingJob.id ? updatedJob : j));

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

        description: project.description || '',

        project_type: project.project_type || 'commercial',

        budget: project.budget || '',

        location: project.location || ''

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



  if (isLoadingAuth || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;



  const stats = [

    { label: 'Active Projects', value: projects.filter(p => p.status === 'verified' || p.status === 'in_progress').length, icon: Briefcase, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },

    { label: 'Open Jobs', value: jobs.filter(j => j.status === 'open').length, icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-600' },

    { label: 'Applications', value: 0, icon: Send, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },

    { label: 'Messages', value: 0, icon: MessageSquare, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' }

  ];



  const statusColors = {

    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',

    verified: 'bg-blue-100 text-blue-800 border-blue-300',

    in_progress: 'bg-green-100 text-green-800 border-green-300',

    delivered: 'bg-purple-100 text-purple-800 border-purple-300',

    rejected: 'bg-red-100 text-red-800 border-red-300'

  };



  return (

    <div className="min-h-screen bg-gray-50">

      <main className="w-full flex flex-col">

        {/* Header with Profile */}

        <div className="p-6 bg-white border-b border-gray-100">

          <div className="flex items-start gap-6">

            {/* Logo Upload */}

            <div className="relative">

              <div className="w-20 h-20 rounded-lg bg-gray-300 flex items-center justify-center text-gray-700 text-2xl font-bold overflow-hidden">

                {projectOwner?.logo_url ? (

                  <img src={projectOwner.logo_url} alt="Company Logo" className="w-full h-full object-cover" />

                ) : (

                  profileCompanyName?.charAt(0).toUpperCase() || user?.full_name?.charAt(0).toUpperCase()

                )}

              </div>

              <input

                ref={logoInputRef}

                type="file"

                accept="image/*"

                onChange={handleLogoUpload}

                className="hidden"

                disabled={uploadingLogo}

              />

              <label 

                onClick={() => logoInputRef.current?.click()}

                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"

              >

                {uploadingLogo ? (

                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

                ) : (

                  <Upload className="w-4 h-4 text-gray-600" />

                )}

              </label>

            </div>



            {/* Profile Info */}

            <div className="flex-1">

              <h1 className="text-2xl font-bold text-gray-900 mb-1">

                {profileCompanyName || user.full_name}

              </h1>

              <p className="text-sm text-gray-600 mb-2">

                {profileIndustry && `${profileIndustry} • `}

                {profileCompanySize && `${profileCompanySize}`}

              </p>

              <p className="text-sm text-gray-500">{user.email}</p>



              {/* Bio Section */}

              {editingBio ? (

                <div className="mt-3">

                  <textarea

                    value={profileBio}

                    onChange={(e) => setProfileBio(e.target.value)}

                    placeholder="Tell us about your company..."

                    rows={2}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"

                  />

                  <div className="flex gap-2 mt-2">

                    <Button size="sm" onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save</Button>

                    <Button size="sm" onClick={() => setEditingBio(false)} variant="outline">Cancel</Button>

                  </div>

                </div>

              ) : (

                <div className="mt-3">

                  {projectOwner?.bio ? (

                    <p className="text-gray-700 text-sm leading-relaxed">{projectOwner.bio}</p>

                  ) : (

                    <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 text-sm">Add company bio</button>

                  )}

                  {projectOwner?.bio && (

                    <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 ml-2">

                      <Edit2 className="w-3 h-3 inline" />

                    </button>

                  )}

                </div>

              )}



              {/* Social Links */}

              {editingSocial ? (

                <div className="flex gap-2 items-center mt-3">

                  <Globe className="w-4 h-4 text-gray-400" />

                  <input

                    type="text"

                    value={profileWebsite}

                    onChange={(e) => setProfileWebsite(e.target.value)}

                    placeholder="Website URL"

                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                  />

                  <Button size="sm" onClick={handleSaveSocial} className="bg-black text-white hover:bg-gray-800">Save</Button>

                  <Button size="sm" onClick={() => setEditingSocial(false)} variant="outline">Cancel</Button>

                </div>

              ) : (

                <div className="flex items-center gap-3 mt-3">

                  {projectOwner?.website && (

                    <a href={projectOwner.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Website">

                      <Globe className="w-5 h-5" />

                    </a>

                  )}

                  <button onClick={() => setEditingSocial(true)} className="text-gray-400 hover:text-gray-600">

                    <Edit2 className="w-4 h-4" />

                  </button>

                </div>

              )}

            </div>



            {/* Edit Profile Button */}

            <Button

              onClick={() => setEditingProfile(!editingProfile)}

              variant="outline"

              size="sm"

              className="flex items-center gap-2"

            >

              <Edit2 className="w-4 h-4" />

              {editingProfile ? 'Cancel' : 'Edit Profile'}

            </Button>

          </div>



          {/* Edit Profile Form */}

          {editingProfile && (

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

              <div className="grid md:grid-cols-3 gap-4">

                <div>

                  <label className="block text-sm font-medium mb-2">Company Name</label>

                  <input

                    type="text"

                    value={profileCompanyName}

                    onChange={(e) => setProfileCompanyName(e.target.value)}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400"

                  />

                </div>

                <div>

                  <label className="block text-sm font-medium mb-2">Industry</label>

                  <input

                    type="text"

                    value={profileIndustry}

                    onChange={(e) => setProfileIndustry(e.target.value)}

                    placeholder="e.g., Technology, Retail"

                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400"

                  />

                </div>

                <div>

                  <label className="block text-sm font-medium mb-2">Company Size</label>

                  <select

                    value={profileCompanySize}

                    onChange={(e) => setProfileCompanySize(e.target.value)}

                    className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-gray-400"

                  >

                    <option value="">Select size</option>

                    <option value="1-10">1-10 employees</option>

                    <option value="11-50">11-50 employees</option>

                    <option value="51-200">51-200 employees</option>

                    <option value="201-500">201-500 employees</option>

                    <option value="500+">500+ employees</option>

                  </select>

                </div>

              </div>

              <div className="flex gap-2 mt-4">

                <Button onClick={handleSaveProfile} className="bg-black text-white hover:bg-gray-800">Save Changes</Button>

                <Button onClick={() => setEditingProfile(false)} variant="outline">Cancel</Button>

              </div>

            </div>

          )}

        </div>



        {/* Stats */}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {stats.map((stat) => (
            <DashboardStatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} iconBg={stat.iconBg} iconColor={stat.iconColor} />
          ))}

        </div>



        {/* Quick Actions */}

        <div className="px-6 pb-6">

          <div className="bg-gray-900 rounded-xl p-6 text-white">

            <h2 className="text-xl font-bold mb-2">Ready to start a new project?</h2>

            <p className="text-sm mb-4 text-blue-50">Connect with talented creators and teams to bring your vision to life</p>

            <div className="flex gap-3">

              <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => openProjectModal()}>

                <Plus className="w-4 h-4 mr-2" />

                Post a Project

              </Button>

              <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => openJobModal()}>

                <Briefcase className="w-4 h-4 mr-2" />

                Post a Job

              </Button>

            </div>

          </div>

        </div>



        {/* Projects List */}

        <div className="px-6 pb-6">

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

                <div key={project.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">

                  {project.image_url && (

                    <div className="h-40 bg-gray-200 relative">

                      <img src={project.image_url} alt={project.project_type} className="w-full h-full object-cover" />

                      <button

                        onClick={() => handleDeleteProject(project.id)}

                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"

                      >

                        <X className="w-4 h-4 text-white" />

                      </button>

                    </div>

                  )}

                  <div className="p-4">

                    <div className="flex items-center justify-between mb-2">

                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[project.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>

                        {project.status}

                      </span>

                      <span className="text-xs text-gray-500">{new Date(project.created_date).toLocaleDateString()}</span>

                    </div>

                    <h3 className="font-bold text-gray-900 mb-2 capitalize">{project.project_type?.replace(/_/g, ' ')}</h3>

                    {project.notes && (

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.notes}</p>

                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">

                      <span className="flex items-center gap-1">

                        <MapPin className="w-3 h-3" />

                        {project.location_city}

                      </span>

                      {project.timeline_start && (

                        <span className="flex items-center gap-1">

                          <Calendar className="w-3 h-3" />

                          {new Date(project.timeline_start).toLocaleDateString()}

                        </span>

                      )}

                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openProjectModal(project)}>
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleDeleteProject(project.id)}>
                        <X className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>



        {/* Jobs List */}

        {jobs.length > 0 && (

          <div className="px-6 pb-6">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl font-bold text-gray-900">Your Job Posts</h2>

              <Button variant="outline" size="sm" onClick={() => openJobModal()}>

                <Plus className="w-4 h-4 mr-2" />

                New Job

              </Button>

            </div>



            <div className="space-y-3">

              {jobs.map((job) => (

                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

                  <div className="flex items-start justify-between">

                    <div className="flex-1">

                      <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{job.short_description}</p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">

                        <span className="flex items-center gap-1">

                          <MapPin className="w-3 h-3" />

                          {job.location}

                        </span>

                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">

                          {job.status}

                        </span>

                      </div>

                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openJobModal(job)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteJob(job.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </main>



      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Project Title</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Enter project title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Project Type</label>
                <select
                  value={projectForm.project_type}
                  onChange={(e) => setProjectForm({ ...projectForm, project_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
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
                <label className="block text-sm font-medium text-gray-900 mb-2">Budget</label>
                <input
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  placeholder="Enter budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  value={projectForm.location}
                  onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowProjectModal(false)}>Cancel</Button>
              <Button onClick={editingProject ? handleUpdateProject : handleCreateProject} className="bg-black text-white hover:bg-gray-800">
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="Enter job title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe the job"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Job Type</label>
                <select
                  value={jobForm.job_type}
                  onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="director">Director</option>
                  <option value="cinematographer">Cinematographer</option>
                  <option value="editor">Editor</option>
                  <option value="sound_engineer">Sound Engineer</option>
                  <option value="producer">Producer</option>
                  <option value="actor">Actor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Budget</label>
                <input
                  type="number"
                  value={jobForm.budget}
                  onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })}
                  placeholder="Enter budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={jobForm.required_skills}
                  onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
                  placeholder="e.g., editing, color grading, vfx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowJobModal(false)}>Cancel</Button>
              <Button onClick={editingJob ? handleUpdateJob : handleCreateJob} className="bg-black text-white hover:bg-gray-800">
                {editingJob ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
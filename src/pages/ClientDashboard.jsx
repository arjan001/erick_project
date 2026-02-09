import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ClientSidebar from '../components/ClientSidebar';
import { Plus, Briefcase, Users, MessageSquare, TrendingUp, Calendar, MapPin, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projectOwner, setProjectOwner] = useState(null);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        // Fetch or create ProjectOwner
        const owners = await base44.entities.ProjectOwner.filter({ email: parsedUser.email });
        if (owners.length === 0) {
          const newOwner = await base44.entities.ProjectOwner.create({
            email: parsedUser.email,
            full_name: parsedUser.full_name,
            projects_submitted: []
          });
          setProjectOwner(newOwner);
        } else {
          setProjectOwner(owners[0]);
        }

        // Fetch projects
        const projectsData = await base44.entities.Project.filter({ project_owner_email: parsedUser.email });
        setProjects(projectsData);

        // Fetch jobs posted by this client
        const jobsData = await base44.entities.Job.filter({ client_email: parsedUser.email });
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching client data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (!user || loading) return null;

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'verified' || p.status === 'in_progress').length, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Open Jobs', value: jobs.filter(j => j.status === 'open').length, icon: Users, color: 'bg-green-500' },
    { label: 'Applications', value: 0, icon: Send, color: 'bg-purple-500' },
    { label: 'Messages', value: 0, icon: MessageSquare, color: 'bg-orange-500' }
  ];

  const statusColors = {
    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    verified: 'bg-blue-100 text-blue-800 border-blue-300',
    in_progress: 'bg-green-100 text-green-800 border-green-300',
    delivered: 'bg-purple-100 text-purple-800 border-purple-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="h-screen bg-white">
      <ClientSidebar />
      
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user.full_name}!</h1>
          <p className="text-sm text-gray-600">Manage your projects and track progress</p>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Ready to start a new project?</h2>
            <p className="text-sm mb-4 text-blue-50">Connect with talented creators and teams to bring your vision to life</p>
            <div className="flex gap-3">
              <Link to={createPageUrl('SubmitProject')}>
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Project
                </Button>
              </Link>
              <Link to={createPageUrl('Jobs')}>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
            <Link to={createPageUrl('SubmitProject')}>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Start by posting your first project</p>
              <Link to={createPageUrl('SubmitProject')}>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {project.image_url && (
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                      <img src={project.image_url} alt={project.project_type} className="w-full h-full object-cover" />
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
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Eye className="w-3 h-3 mr-2" />
                      View Details
                    </Button>
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
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">€{job.budget_min}</p>
                      <p className="text-xs text-gray-500">{job.budget_type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/lib/supabaseEntities';
import TeamSidebar from '@/components/TeamSidebar';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, Filter, Calendar, DollarSign, MapPin, Check, X, Clock } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function TeamProjectsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (!storedTeam) {
      window.location.href = '/';
      return;
    }
    setTeam(JSON.parse(storedTeam));
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const allProjects = await Project.filter({ team_id: team?.id });
      setProjects(allProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toastError('Load Failed', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProject = async (projectId) => {
    try {
      await Project.update(projectId, { status: 'in_progress' });
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'in_progress' } : p));
      success('Project Accepted', 'Project has been accepted');
    } catch (err) {
      console.error('Error accepting project:', err);
      toastError('Action Failed', 'Failed to accept project');
    }
  };

  const handleDeclineProject = async (projectId) => {
    try {
      await Project.update(projectId, { status: 'declined' });
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'declined' } : p));
      success('Project Declined', 'Project has been declined');
    } catch (err) {
      console.error('Error declining project:', err);
      toastError('Action Failed', 'Failed to decline project');
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="h-screen bg-white">
        <TeamSidebar />
        <main className="w-full h-full flex items-center justify-center pl-20">
          <div className="text-gray-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <TeamSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(project.created_date).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>${project.budget || 'Budget not set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{project.timeline_start || 'Start date not set'}</span>
                  </div>
                </div>

                {project.status === 'submitted' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptProject(project.id)}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineProject(project.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600">Projects from clients will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
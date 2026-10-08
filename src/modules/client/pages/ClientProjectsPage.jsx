import React, { useState, useEffect } from 'react';
import { Project } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, Plus, Search, Filter, Calendar, MapPin, DollarSign, Eye, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';

export default function ClientProjectsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    project_type: 'film',
    budget_min: '',
    budget_max: '',
    location_city: '',
    location_country: 'Kenya'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    if (!user?.email) {
      error('Authentication Required', 'Please sign in to view your projects');
      return;
    }
    try {
      setLoading(true);
      const rows = await Project.filter({ project_owner_email: user.email }, '-created_at', 50);
      setProjects(rows || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      error('Error', 'Failed to fetch projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user?.email) {
      error('Authentication Required', 'Please sign in to create a project');
      return;
    }
    if (!createForm.title || !createForm.description) {
      error('Validation Error', 'Title and description are required');
      return;
    }
    try {
      const newProject = await Project.create({
        ...createForm,
        project_owner_email: user.email,
        project_owner_name: user.full_name,
        status: 'draft',
        created_at: new Date().toISOString()
      });
      success('Created', 'Project created successfully');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        project_type: 'film',
        budget_min: '',
        budget_max: '',
        location_city: '',
        location_country: 'Kenya'
      });
      fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
      error('Failed', 'Failed to create project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await Project.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      success('Deleted', 'Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      error('Failed', 'Failed to delete project. Please try again.');
    }
  };

  const handleEditProject = (project) => {
    setCreateForm({
      title: project.title || '',
      description: project.description || '',
      project_type: project.project_type || 'film',
      budget_min: project.budget_min || '',
      budget_max: project.budget_max || '',
      location_city: project.location_city || '',
      location_country: project.location_country || 'Kenya'
    });
    setShowCreateModal(true);
  };

  const handleUpdateProject = async (projectId) => {
    if (!user?.email) {
      error('Authentication Required', 'Please sign in to update this project');
      return;
    }
    if (!createForm.title || !createForm.description) {
      error('Validation Error', 'Title and description are required');
      return;
    }
    try {
      await Project.update(projectId, {
        ...createForm,
        updated_at: new Date().toISOString()
      });
      success('Updated', 'Project updated successfully');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        project_type: 'film',
        budget_min: '',
        budget_max: '',
        location_city: '',
        location_country: 'Kenya'
      });
      fetchProjects();
    } catch (err) {
      console.error('Error updating project:', err);
      error('Failed', 'Failed to update project. Please try again.');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Our Projects</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your project listings</p>
          </div>
          <Button
            onClick={() => {
              setEditingProjectId(null);
              setCreateForm({
                title: '',
                description: '',
                project_type: 'film',
                budget_min: '',
                budget_max: '',
                location_city: '',
                location_country: 'Kenya'
              });
              setShowCreateModal(true);
            }}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white sm:w-auto w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4F46E5]" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{project.project_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'verified' ? 'bg-green-100 text-green-700' :
                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {project.status || 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location_city || 'Remote'}
                  </div>
                  {project.budget_min && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {project.budget_min}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingProjectId ? 'Edit Project' : 'Create New Project'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Project description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min</label>
                    <Input
                      type="number"
                      value={createForm.budget_min}
                      onChange={(e) => setCreateForm({ ...createForm, budget_min: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max</label>
                    <Input
                      type="number"
                      value={createForm.budget_max}
                      onChange={(e) => setCreateForm({ ...createForm, budget_max: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={createForm.location_city}
                    onChange={(e) => setCreateForm({ ...createForm, location_city: e.target.value })}
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProjectId(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => editingProjectId ? handleUpdateProject(editingProjectId) : handleCreateProject()}
                  className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA]"
                >
                  {editingProjectId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

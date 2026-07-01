import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { FolderKanban, Search, Eye, Trash2, DollarSign, CheckCircle, XCircle, TrendingUp, X } from 'lucide-react';

const STATUSES = ['submitted', 'verified', 'in_progress', 'delivered', 'rejected'];

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const rows = await base44.entities.Project.list('-created_date');
      setProjects(rows || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      error('Error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await base44.entities.Project.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      success('Deleted', 'Project deleted successfully');
      base44.entities.AuditLog.create({ actor_email: user?.email, action: 'project.delete', entity_type: 'Project', entity_id: projectId, details: 'Deleted project' }).catch(() => {});
    } catch (err) {
      console.error('Error deleting project:', err);
      error('Failed', 'Failed to delete project');
    }
  };

  const handleVerify = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'verified' ? 'submitted' : 'verified';
    try {
      await base44.entities.Project.update(projectId, { status: newStatus });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      success('Updated', 'Project status updated successfully');
      base44.entities.AuditLog.create({ actor_email: user?.email, action: 'project.status_update', entity_type: 'Project', entity_id: projectId, details: `Changed status to ${newStatus}` }).catch(() => {});
    } catch (err) {
      console.error('Error updating project status:', err);
      error('Failed', 'Failed to update project status');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      submitted: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status?.replace('_', ' ')}</span>;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.project_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
        <p className="text-gray-600 mt-1">View and manage all submitted projects</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Projects</div>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            </div>
            <FolderKanban className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Seeking Backing</div>
              <div className="text-2xl font-bold text-gray-900">{projects.filter(p => p.open_to_backing).length}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Verified</div>
              <div className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'verified').length}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-500">Total: {filteredProjects.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">No projects found</td></tr>
              )}
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 capitalize">{project.project_type?.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{project.notes}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.project_owner_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{project.budget_range?.replace(/_/g, ' ') || 'N/A'}</td>
                  <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.created_date ? new Date(project.created_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)} title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleVerify(project.id, project.status)} title="Toggle Verified">
                        {project.status === 'verified' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Project Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium text-gray-500">Owner:</span> {selectedProject.project_owner_name} ({selectedProject.project_owner_email})</div>
              <div><span className="font-medium text-gray-500">Type:</span> <span className="capitalize">{selectedProject.project_type?.replace('_', ' ')}</span></div>
              <div><span className="font-medium text-gray-500">Location:</span> {[selectedProject.location_city, selectedProject.location_country].filter(Boolean).join(', ') || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Budget:</span> <span className="capitalize">{selectedProject.budget_range?.replace(/_/g, ' ') || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500">Notes:</span> {selectedProject.notes || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Open to Backing:</span> {selectedProject.open_to_backing ? 'Yes' : 'No'}</div>
              <div><span className="font-medium text-gray-500">Status:</span> <span className="capitalize">{selectedProject.status?.replace('_', ' ')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
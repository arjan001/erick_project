import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { FolderKanban, Search, Filter, Eye, Edit, Trash2, Calendar, DollarSign, Users, Target, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function AdminProjectsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const mockProjects = [
          { id: 1, title: 'Indie Film Documentary', creator: 'Film Productions Inc', category: 'Film', goal: 50000, raised: 42500, backers: 234, status: 'active', endDate: '2026-08-15', description: 'A documentary about urban street art culture.' },
          { id: 2, title: 'Music Video Production', creator: 'Music Records', category: 'Music', goal: 15000, raised: 18200, backers: 156, status: 'funded', endDate: '2026-07-20', description: 'Professional music video for upcoming album.' },
          { id: 3, title: 'Animated Short Film', creator: 'Animation Studio', category: 'Animation', goal: 30000, raised: 12500, backers: 89, status: 'active', endDate: '2026-09-01', description: 'Short animated film about environmental awareness.' },
          { id: 4, title: 'Documentary Series', creator: 'Media Company', category: 'Film', goal: 100000, raised: 45000, backers: 312, status: 'active', endDate: '2026-10-30', description: 'Multi-part documentary series on technology.' },
          { id: 5, title: 'Commercial Production', creator: 'Ad Agency', category: 'Commercial', goal: 8000, raised: 8500, backers: 45, status: 'funded', endDate: '2026-06-30', description: 'High-end commercial for luxury brand.' },
          { id: 6, title: 'VR Experience Project', creator: 'Tech Studio', category: 'VR/AR', goal: 75000, raised: 15000, backers: 67, status: 'active', endDate: '2026-11-15', description: 'Immersive VR experience for museums.' }
        ];
        setProjects(mockProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        error('Error', 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleDeleteProject = async (projectId) => {
    try {
      setProjects(projects.filter(p => p.id !== projectId));
      success('Deleted', 'Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      error('Failed', 'Failed to delete project');
    }
  };

  const handleToggleStatus = async (projectId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      success('Updated', 'Project status updated successfully');
    } catch (err) {
      console.error('Error updating project status:', err);
      error('Failed', 'Failed to update project status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'funded':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Funded</span>;
      case 'closed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Closed</span>;
      case 'failed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-1">View and manage all backed projects</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
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
                  <div className="text-sm text-gray-500">Total Raised</div>
                  <div className="text-2xl font-bold text-gray-900">${projects.reduce((sum, p) => sum + p.raised, 0).toLocaleString()}</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Backers</div>
                  <div className="text-2xl font-bold text-gray-900">{projects.reduce((sum, p) => sum + p.backers, 0).toLocaleString()}</div>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Funded Projects</div>
                  <div className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'funded').length}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                  <option value="active">Active</option>
                  <option value="funded">Funded</option>
                  <option value="closed">Closed</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Film">Film</option>
                  <option value="Music">Music</option>
                  <option value="Animation">Animation</option>
                  <option value="Commercial">Commercial</option>
                  <option value="VR/AR">VR/AR</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                Total Projects: {filteredProjects.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{project.creator}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${project.goal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${project.raised.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{getProgressPercentage(project.raised, project.goal).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                getProgressPercentage(project.raised, project.goal) >= 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${getProgressPercentage(project.raised, project.goal)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.backers}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(project.id, project.status)} title="Toggle Status">
                            {project.status === 'active' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
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
        </div>
      </main>
    </div>
  );
}

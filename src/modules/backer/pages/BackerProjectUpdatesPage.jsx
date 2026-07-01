import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer, BackedProject, ProjectUpdate } from '@/lib/supabaseEntities';
import BackerSidebar from '@/components/BackerSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Calendar, Eye, Edit2, Trash2, Bell, Filter } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function BackerProjectUpdatesPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [updateForm, setUpdateForm] = useState({
    project_id: '',
    project_title: '',
    title: '',
    content: '',
    update_type: 'progress'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('studio22_user'));
      
      const backers = await Backer.filter({ contact_email: storedUser.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
      }

      // Fetch investments
      const backedProjects = await BackedProject.filter({ backer_email: storedUser.email });
      setInvestments(backedProjects);

      // Fetch project updates
      const allUpdates = await ProjectUpdate.filter({ backer_email: storedUser.email });
      setUpdates(allUpdates);
    } catch (err) {
      console.error('Error fetching updates:', err);
      toastError('Load Failed', 'Failed to load project updates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async () => {
    if (!backer) return;
    try {
      await ProjectUpdate.create({
        ...updateForm,
        backer_email: user.email,
        backer_id: backer.id,
        created_at: new Date().toISOString()
      });
      success('Update Created', 'Project update has been created');
      setShowModal(false);
      setUpdateForm({
        project_id: '',
        project_title: '',
        title: '',
        content: '',
        update_type: 'progress'
      });
      fetchData();
    } catch (err) {
      console.error('Error creating update:', err);
      toastError('Creation Failed', 'Failed to create update');
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!confirm('Are you sure you want to delete this update?')) return;
    try {
      await ProjectUpdate.delete(updateId);
      success('Update Deleted', 'Project update has been deleted');
      fetchData();
    } catch (err) {
      console.error('Error deleting update:', err);
      toastError('Delete Failed', 'Failed to delete update');
    }
  };

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || update.project_id === filterProject;
    return matchesSearch && matchesProject;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const uniqueProjects = [...new Set(investments.map(inv => inv.project_id).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BackerSidebar />
      <div className="ml-20 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Updates</h1>
            <p className="text-gray-600">Stay informed about your invested projects</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Create Update
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold">{updates.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Projects Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold">{uniqueProjects.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold">
                  {updates.filter(u => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(u.created_at) > weekAgo;
                  }).length}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search updates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Projects</option>
            {investments.map(inv => (
              <option key={inv.project_id} value={inv.project_id}>{inv.project_title}</option>
            ))}
          </select>
        </div>

        {/* Updates List */}
        {filteredUpdates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No updates yet</h3>
              <p className="text-gray-600 mb-4">Create your first project update</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Update
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          update.update_type === 'progress' ? 'bg-blue-100 text-blue-700' :
                          update.update_type === 'milestone' ? 'bg-green-100 text-green-700' :
                          update.update_type === 'announcement' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {update.update_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {update.project_title}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{update.title}</h3>
                      <p className="text-gray-600 mb-3">{update.content}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(update.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Update Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create Project Update</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Select Project</label>
                  <select
                    value={updateForm.project_id}
                    onChange={(e) => {
                      const selected = investments.find(inv => inv.project_id === e.target.value);
                      setUpdateForm({ 
                        ...updateForm, 
                        project_id: e.target.value,
                        project_title: selected?.project_title || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select a project</option>
                    {investments.map(inv => (
                      <option key={inv.project_id} value={inv.project_id}>{inv.project_title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Update Title</label>
                  <Input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                    placeholder="e.g. Production Milestone Reached"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Update Type</label>
                  <select
                    value={updateForm.update_type}
                    onChange={(e) => setUpdateForm({ ...updateForm, update_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="progress">Progress Update</option>
                    <option value="milestone">Milestone</option>
                    <option value="announcement">Announcement</option>
                    <option value="financial">Financial Update</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
                  <textarea
                    value={updateForm.content}
                    onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                    placeholder="Describe the update..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateUpdate} className="bg-black text-white hover:bg-gray-800">
                  Create Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { RecentProject, Project } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Clock, ArrowUp, ArrowDown, FolderKanban } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminRecentProjectsPage() {
  const { success, error: toastError } = useToast();
  const [projects, setProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    project_id: '', title: '', description: '', studio: '', type: '',
    images: [], display_order: 0, is_active: true
  });

  const fetchData = async () => {
    try {
      const [recentProjectsData, allProjectsData] = await Promise.all([
        RecentProject.list('display_order', 100),
        Project.filter({ status: 'open' }, '-created_at', 100)
      ]);
      setProjects(recentProjectsData || []);
      setAvailableProjects(allProjectsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Don't show error toast - table might not exist yet
      setProjects([]);
      setAvailableProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (project = null) => {
    if (project) {
      setEditing(project);
      setForm({
        project_id: project.project_id || '',
        title: project.title || '', description: project.description || '',
        studio: project.studio || '', type: project.type || '',
        images: project.images || [], display_order: project.display_order || 0,
        is_active: project.is_active ?? true
      });
    } else {
      setEditing(null);
      setForm({ project_id: '', title: '', description: '', studio: '', type: '', images: [], display_order: 0, is_active: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toastError('Validation', 'Title is required'); return; }
    try {
      const dataToSave = {
        project_id: form.project_id || null,
        title: form.title,
        description: form.description,
        studio: form.studio,
        type: form.type,
        images: form.images,
        display_order: form.display_order,
        is_active: form.is_active
      };
      if (editing) {
        await RecentProject.update(editing.id, dataToSave);
        success('Updated', 'Recent project updated');
      } else {
        await RecentProject.create(dataToSave);
        success('Created', 'Recent project created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving recent project:', err);
      toastError('Save Failed', `Failed to save: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recent project?')) return;
    try {
      await RecentProject.delete(id);
      success('Deleted', 'Recent project deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete recent project');
    }
  };

  const toggleStatus = async (project) => {
    try {
      await RecentProject.update(project.id, { is_active: !project.is_active });
      success(!project.is_active ? 'Activated' : 'Deactivated', `Project ${!project.is_active ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update status'); }
  };

  const moveOrder = async (project, direction) => {
    const newOrder = (project.display_order || 0) + direction;
    try {
      await RecentProject.update(project.id, { display_order: newOrder });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to reorder'); }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recent Projects</h1>
          <p className="text-gray-600">Manage recent projects displayed on homepage (max 4)</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add Recent Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {project.images?.[0] ? (
                <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Clock className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => toggleStatus(project)} className={`p-1.5 rounded ${
                  project.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {project.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{project.title}</h3>
                  {project.studio && <p className="text-xs text-gray-500">{project.studio}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => moveOrder(project, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => moveOrder(project, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowDown className="w-3 h-3" /></button>
                  <button onClick={() => openModal(project)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {project.type && <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-medium rounded mb-2">{project.type}</span>}
              {project.description && <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <p className="mb-4">No recent projects yet</p>
          <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Add First Recent Project
          </Button>
        </CardContent></Card>
      )}

      {projects.length > 4 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> You have {projects.length} recent projects. Only the first 4 will be displayed on the homepage.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Recent Project' : 'Add Recent Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-gray-500" /> Select Project (Optional)
                </label>
                <select 
                  value={form.project_id} 
                  onChange={(e) => {
                    const selectedProject = availableProjects.find(p => p.id === e.target.value);
                    setForm({ 
                      ...form, 
                      project_id: e.target.value,
                      title: selectedProject?.title || form.title,
                      description: selectedProject?.description || form.description,
                      type: selectedProject?.type || form.type
                    });
                  }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Manual entry (no project selected)</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.title || 'Unknown Project'}</option>
                  ))}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-2">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" className="rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Studio</label><Input value={form.studio} onChange={(e) => setForm({ ...form, studio: e.target.value })} placeholder="Studio name" className="rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-2">Type</label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g., Documentary, Commercial" className="rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Images (comma-separated URLs)</label><Input value={form.images.join(',')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').filter(Boolean) })} placeholder="https://..." className="rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Display Order</label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="rounded-lg" /></div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                  <label className="text-sm">Active</label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

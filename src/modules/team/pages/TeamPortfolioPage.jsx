import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TeamSidebar from '@/components/TeamSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Plus, Play, Trash2, Edit2, Upload, Film, Image, Music } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function TeamPortfolioPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    project_type: '',
    client_name: '',
    year: ''
  });

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (!storedTeam) {
      window.location.href = '/';
      return;
    }
    setTeam(JSON.parse(storedTeam));
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const clips = await base44.entities.PortfolioClip.filter({ 
        uploaded_by_type: 'team',
        uploaded_by_id: team?.id,
        status: 'approved'
      });
      setPortfolioItems(clips);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      toastError('Load Failed', 'Failed to load portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!team) return;
    setUploading(true);

    try {
      const response = await base44.integrations.Core.UploadFile({ file: e.target.file });
      const fileUrl = response.file_url || response.url;

      await base44.entities.PortfolioClip.create({
        title: uploadForm.title,
        description: uploadForm.description,
        project_type: uploadForm.project_type,
        client_name: uploadForm.client_name,
        year: uploadForm.year,
        video_url: fileUrl,
        thumbnail_url: fileUrl,
        uploaded_by_type: 'team',
        uploaded_by_id: team.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      success('Upload Successful', 'Portfolio item uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', project_type: '', client_name: '', year: '' });
      fetchPortfolio();
    } catch (err) {
      console.error('Error uploading portfolio:', err);
      toastError('Upload Failed', 'Failed to upload portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await base44.entities.PortfolioClip.delete(itemId);
      setPortfolioItems(portfolioItems.filter(item => item.id !== itemId));
      success('Item Deleted', 'Portfolio item deleted successfully');
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
      toastError('Deletion Failed', 'Failed to delete portfolio item');
    }
  };

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

  const typeIcons = {
    film: Film,
    photography: Image,
    music: Music,
    other: FolderOpen
  };

  return (
    <div className="h-screen bg-white">
      <TeamSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Team Portfolio</h1>
            <Button onClick={() => setShowUploadModal(true)} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => {
              const TypeIcon = typeIcons[item.project_type] || FolderOpen;
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{item.client_name || 'Client'}</span>
                      <span>{item.year || 'Year'}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {portfolioItems.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-600 mb-4">Showcase your team's best work</p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Portfolio Item</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Project title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Project Type</label>
                <select
                  value={uploadForm.project_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, project_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select type</option>
                  <option value="film">Film</option>
                  <option value="photography">Photography</option>
                  <option value="music">Music</option>
                  <option value="animation">Animation</option>
                  <option value="design">Design</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Client Name</label>
                  <Input
                    value={uploadForm.client_name}
                    onChange={(e) => setUploadForm({ ...uploadForm, client_name: e.target.value })}
                    placeholder="Client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                  <Input
                    type="number"
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Upload File</label>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] })}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

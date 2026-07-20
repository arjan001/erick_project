import React, { useState, useEffect } from 'react';
import { FeaturedWork, Artist, PortfolioClip, Subscription } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Star, Calendar, DollarSign, User, Search, Check, Play, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminFeaturedWorkPage() {
  const { success, error: toastError } = useToast();
  const [works, setWorks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artistPortfolioClips, setArtistPortfolioClips] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClips, setLoadingClips] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedPortfolioClip, setSelectedPortfolioClip] = useState(null);
  const [form, setForm] = useState({
    artist_id: '', portfolio_clip_id: '', title: '', description: '', images: [], video_url: '',
    featured_type: 'paid', featured_until: '', display_order: 0, status: 'active'
  });

  const fetchData = async () => {
    try {
      const [worksData, artistsData] = await Promise.all([
        FeaturedWork.list('display_order', 100),
        Artist.list('-created_at', 100)
      ]);
      setWorks(worksData || []);
      setArtists(artistsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setWorks([]);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const getActiveSubscriptionArtists = async () => {
    try {
      const activeSubscriptions = await Subscription.filter({ status: 'active' });
      const artistEmails = activeSubscriptions.map(sub => sub.user_email);
      const allArtists = await Artist.list('-created_at', 100);
      return allArtists.filter(artist => artistEmails.includes(artist.email));
    } catch (err) {
      console.error('Error fetching active subscription artists:', err);
      return [];
    }
  };

  const fetchArtistPortfolioClips = async (artistId) => {
    if (!artistId) {
      setArtistPortfolioClips([]);
      return;
    }
    setLoadingClips(true);
    try {
      const clips = await PortfolioClip.filter({ 
        uploaded_by_type: 'artist', 
        uploaded_by_id: artistId
      });
      setArtistPortfolioClips(clips || []);
    } catch (err) {
      console.error('Error fetching portfolio clips:', err);
      setArtistPortfolioClips([]);
    } finally {
      setLoadingClips(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = async (work = null) => {
    if (work) {
      setEditing(work);
      setForm({
        artist_id: work.artist_id || '',
        portfolio_clip_id: work.portfolio_clip_id || '',
        title: work.title || '', description: work.description || '',
        images: work.images || [], video_url: work.video_url || '',
        featured_type: work.featured_type || 'paid',
        featured_until: work.featured_until || '',
        display_order: work.display_order || 0,
        status: work.status || 'active'
      });
      if (work.artist_id) {
        await fetchArtistPortfolioClips(work.artist_id);
      }
    } else {
      setEditing(null);
      setForm({ artist_id: '', portfolio_clip_id: '', title: '', description: '', images: [], video_url: '', featured_type: 'paid', featured_until: '', display_order: 0, status: 'active' });
      setArtistPortfolioClips([]);
      setSelectedPortfolioClip(null);
      setSelectedProjects([]);
      // Load only artists with active subscriptions
      const activeArtists = await getActiveSubscriptionArtists();
      setArtists(activeArtists);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    // Check if adding would exceed 6 limit
    if (!editing && works.length >= 6) {
      toastError('Limit Reached', 'Maximum 6 featured projects allowed (3 per line)');
      return;
    }

    if (selectedProjects.length === 0 && !editing) {
      toastError('Validation', 'Please select at least one project');
      return;
    }

    try {
      if (editing) {
        // Single edit mode
        const dataToSave = {
          artist_id: form.artist_id || null,
          portfolio_clip_id: form.portfolio_clip_id || null,
          title: form.title,
          description: form.description,
          images: form.images,
          video_url: form.video_url,
          featured_type: form.featured_type,
          featured_until: form.featured_until,
          display_order: form.display_order,
          status: form.status
        };
        await FeaturedWork.update(editing.id, dataToSave);
        success('Updated', 'Featured work updated');
      } else {
        // Multi-select mode - create multiple featured works
        const totalSlots = 6 - works.length;
        const projectsToAdd = selectedProjects.slice(0, totalSlots);
        
        for (let i = 0; i < projectsToAdd.length; i++) {
          const project = projectsToAdd[i];
          await FeaturedWork.create({
            artist_id: form.artist_id,
            portfolio_clip_id: project.id,
            title: project.title,
            description: project.description,
            images: project.cover_image_url ? [project.cover_image_url] : [],
            video_url: project.video_embed_url || project.video_url || '',
            featured_type: 'admin_pick',
            display_order: works.length + i,
            status: 'active'
          });
        }
        
        if (selectedProjects.length > totalSlots) {
          toastError('Partial Success', `Only ${totalSlots} projects added (max 6 total)`);
        } else {
          success('Created', `${projectsToAdd.length} featured works created`);
        }
      }
      setShowModal(false);
      setSelectedProjects([]);
      fetchData();
    } catch (err) {
      console.error('Error saving featured work:', err);
      toastError('Save Failed', `Failed to save: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this featured work?')) return;
    try {
      await FeaturedWork.delete(id);
      success('Deleted', 'Featured work deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete featured work');
    }
  };

  const toggleStatus = async (work) => {
    try {
      await FeaturedWork.update(work.id, { status: work.status === 'active' ? 'suspended' : 'active' });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update status'); }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Works</h1>
          <p className="text-gray-600">Manage paid and subscription-based featured artist works</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add Featured Work
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map((work) => (
          <Card key={work.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {work.images?.[0] ? (
                <img src={work.images[0]} alt={work.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Star className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  work.featured_type === 'paid' ? 'bg-green-500 text-white' :
                  work.featured_type === 'subscription' ? 'bg-blue-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {work.featured_type}
                </span>
                <button onClick={() => toggleStatus(work)} className={`p-1.5 rounded ${
                  work.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {work.status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{work.title}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openModal(work)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(work.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {work.description && <p className="text-sm text-gray-600 line-clamp-2">{work.description}</p>}
              {work.featured_until && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Featured until: {new Date(work.featured_until).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {works.length === 0 && (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <p className="mb-4">No featured works yet</p>
          <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Create First Featured Work
          </Button>
        </CardContent></Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{editing ? 'Edit Featured Work' : 'Add Featured Projects'}</h2>
                {!editing && <p className="text-sm text-gray-300 mt-1">Select artist and projects to feature (max 6 total)</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {!editing && (
                <>
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        Only artists with active subscriptions are shown
                      </span>
                    </div>
                    <span className="text-xs text-amber-700">
                      {works.length}/6 slots used
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-500" /> Select Artist
                    </label>
                    <select 
                      value={form.artist_id} 
                      onChange={(e) => {
                        setForm({ ...form, artist_id: e.target.value, portfolio_clip_id: '' });
                        setSelectedPortfolioClip(null);
                        setSelectedProjects([]);
                        fetchArtistPortfolioClips(e.target.value);
                      }} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select an artist with active subscription...</option>
                      {artists.map(artist => (
                        <option key={artist.id} value={artist.id}>{artist.full_name || 'Unknown Artist'}</option>
                      ))}
                    </select>
                    {artists.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No artists with active subscriptions found</p>
                    )}
                  </div>
                  
                  {form.artist_id && (
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Play className="w-4 h-4 text-gray-500" /> 
                        Select Projects to Feature
                        <span className="text-xs text-gray-500 font-normal">
                          ({selectedProjects.length} selected, max {6 - works.length} more)
                        </span>
                      </label>
                      {loadingClips ? (
                        <div className="text-sm text-gray-500 py-8 text-center">Loading portfolio clips...</div>
                      ) : artistPortfolioClips.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                          {artistPortfolioClips.map(clip => (
                            <div 
                              key={clip.id}
                              onClick={() => {
                                const isSelected = selectedProjects.some(p => p.id === clip.id);
                                if (isSelected) {
                                  setSelectedProjects(selectedProjects.filter(p => p.id !== clip.id));
                                } else if (selectedProjects.length < 6 - works.length) {
                                  setSelectedProjects([...selectedProjects, clip]);
                                }
                              }}
                              className={`cursor-pointer border-2 rounded-lg p-3 transition-all relative ${
                                selectedProjects.some(p => p.id === clip.id) 
                                  ? 'border-black bg-gray-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {selectedProjects.some(p => p.id === clip.id) && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                                {clip.thumbnail_url || clip.cover_image_url ? (
                                  <img src={clip.thumbnail_url || clip.cover_image_url} alt={clip.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Play className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-medium text-gray-900 truncate">{clip.title}</p>
                              <p className="text-xs text-gray-500 truncate">{clip.project_type || 'Portfolio'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 py-8 text-center">No portfolio clips found for this artist.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {editing && (
                <>
                  <div><label className="block text-sm font-medium mb-2">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Work title" className="rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-2">Images (comma-separated URLs)</label><Input value={form.images.join(',')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').filter(Boolean) })} placeholder="https://..." className="rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-2">Video URL</label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." className="rounded-lg" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Featured Type</label>
                      <select value={form.featured_type} onChange={(e) => setForm({ ...form, featured_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="paid">Paid</option>
                        <option value="subscription">Subscription</option>
                        <option value="admin_pick">Admin Pick</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">Featured Until</label><Input type="date" value={form.featured_until} onChange={(e) => setForm({ ...form, featured_until: e.target.value })} className="rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Display Order</label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="rounded-lg" /></div>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleSave} disabled={!editing && selectedProjects.length === 0} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
                {editing ? 'Update' : `Add ${selectedProjects.length} Project${selectedProjects.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

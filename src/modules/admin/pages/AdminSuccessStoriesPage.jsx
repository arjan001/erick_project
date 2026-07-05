import React, { useState, useEffect } from 'react';
import { SuccessStory } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Star, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminSuccessStoriesPage() {
  const { success, error: toastError } = useToast();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', story: '', images: [], video_url: '',
    testimonial: '', score: 0, category: '', display_order: 0,
    status: 'draft', is_featured: false
  });

  const fetchData = async () => {
    try {
      const all = await SuccessStory.list('display_order', 100);
      setStories(all || []);
    } catch (err) {
      console.error('Error fetching success stories:', err);
      toastError('Load Failed', 'Failed to load success stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (story = null) => {
    if (story) {
      setEditing(story);
      setForm({
        title: story.title || '', story: story.story || '',
        images: story.images || [], video_url: story.video_url || '',
        testimonial: story.testimonial || '', score: story.score || 0,
        category: story.category || '', display_order: story.display_order || 0,
        status: story.status || 'draft', is_featured: story.is_featured || false
      });
    } else {
      setEditing(null);
      setForm({ title: '', story: '', images: [], video_url: '', testimonial: '', score: 0, category: '', display_order: 0, status: 'draft', is_featured: false });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.story.trim()) { toastError('Validation', 'Title and story are required'); return; }
    try {
      if (editing) {
        await SuccessStory.update(editing.id, form);
        success('Updated', 'Success story updated');
      } else {
        await SuccessStory.create({ ...form });
        success('Created', 'Success story created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving success story:', err);
      toastError('Save Failed', 'Failed to save success story');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this success story?')) return;
    try {
      await SuccessStory.delete(id);
      success('Deleted', 'Success story deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete success story');
    }
  };

  const toggleStatus = async (story) => {
    try {
      await SuccessStory.update(story.id, { status: story.status === 'published' ? 'draft' : 'published' });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update status'); }
  };

  const toggleFeatured = async (story) => {
    try {
      await SuccessStory.update(story.id, { is_featured: !story.is_featured });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update featured'); }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  const draftStories = stories.filter(s => s.status === 'draft');
  const publishedStories = stories.filter(s => s.status === 'published');
  const archivedStories = stories.filter(s => s.status === 'archived');

  const StoryCard = ({ story }) => (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-100 relative">
        {story.images?.[0] ? (
          <img src={story.images[0]} alt={story.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FileText className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {story.is_featured && <span className="px-2 py-1 rounded text-xs font-medium bg-amber-400 text-white"><Star className="w-3 h-3 inline mr-1" />Featured</span>}
          <button onClick={() => toggleStatus(story)} className={`p-1.5 rounded ${
            story.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {story.status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900">{story.title}</h3>
            {story.score > 0 && <p className="text-xs text-gray-500">Score: {story.score}/10</p>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => toggleFeatured(story)} className={`p-1 rounded ${story.is_featured ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-600'}`}><Star className="w-3.5 h-3.5" /></button>
            <button onClick={() => openModal(story)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleDelete(story.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {story.category && <p className="text-xs text-gray-500 mb-1">{story.category}</p>}
        <p className="text-sm text-gray-600 line-clamp-2">{story.story}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Success Stories</h1>
          <p className="text-gray-600">Manage success stories displayed on the platform</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add Success Story
        </Button>
      </div>

      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">Published ({publishedStories.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftStories.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedStories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedStories.map(story => <StoryCard key={story.id} story={story} />)}
          </div>
          {publishedStories.length === 0 && <Card><CardContent className="p-12 text-center text-gray-500">No published stories yet</CardContent></Card>}
        </TabsContent>

        <TabsContent value="draft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftStories.map(story => <StoryCard key={story.id} story={story} />)}
          </div>
          {draftStories.length === 0 && <Card><CardContent className="p-12 text-center text-gray-500">No draft stories</CardContent></Card>}
        </TabsContent>

        <TabsContent value="archived">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedStories.map(story => <StoryCard key={story.id} story={story} />)}
          </div>
          {archivedStories.length === 0 && <Card><CardContent className="p-12 text-center text-gray-500">No archived stories</CardContent></Card>}
        </TabsContent>
      </Tabs>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Success Story' : 'Add Success Story'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Story title" /></div>
              <div><label className="block text-sm font-medium mb-2">Story</label><textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="Success story content" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">Testimonial</label><textarea value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} placeholder="Client testimonial" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">Images (comma-separated URLs)</label><Input value={form.images.join(',')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').filter(Boolean) })} placeholder="https://..." /></div>
              <div><label className="block text-sm font-medium mb-2">Video URL</label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Category</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Film, Commercial" /></div>
                <div><label className="block text-sm font-medium mb-2">Score (0-10)</label><Input type="number" min="0" max="10" step="0.1" value={form.score} onChange={(e) => setForm({ ...form, score: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-2">Display Order</label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" />
                <label className="text-sm">Featured on homepage</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ContentCategory } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, X, ArrowUp, ArrowDown, Eye, EyeOff, Star, Upload } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';
import { base44 } from '@/api/base44Client';

export default function AdminCategoriesPage() {
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', display_order: 0, status: 'active', is_featured: false });

  const fetchData = async () => {
    try {
      console.log('Fetching categories from Supabase...');
      const all = await ContentCategory.list('display_order', 100);
      console.log('Categories fetched:', all);
      setCategories(all || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toastError('Load Failed', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', image_url: cat.image_url || '', display_order: cat.display_order || 0, status: cat.status || 'active', is_featured: cat.is_featured || false });
    } else {
      setEditing(null);
      setForm({ name: '', slug: '', description: '', image_url: '', display_order: 0, status: 'active', is_featured: false });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toastError('Validation', 'Name is required'); return; }
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const dataToSave = {
        name: form.name,
        slug: slug,
        description: form.description,
        image_url: form.image_url,
        display_order: form.display_order,
        status: form.status,
        is_featured: form.is_featured
      };
      if (editing) {
        await ContentCategory.update(editing.id, dataToSave);
        success('Updated', 'Category updated');
      } else {
        await ContentCategory.create(dataToSave);
        success('Created', 'Category created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving category:', err);
      toastError('Save Failed', `Failed to save: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await ContentCategory.delete(id);
      success('Deleted', 'Category deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete category');
    }
  };

  const toggleFeatured = async (cat) => {
    try {
      await ContentCategory.update(cat.id, { is_featured: !cat.is_featured });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update'); }
  };

  const toggleStatus = async (cat) => {
    try {
      await ContentCategory.update(cat.id, { status: cat.status === 'active' ? 'hidden' : 'active' });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update status'); }
  };

  const moveOrder = async (cat, dir) => {
    try {
      await ContentCategory.update(cat.id, { display_order: (cat.display_order || 0) + dir });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to reorder'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url || response.data?.url;
      if (!fileUrl) {
        throw new Error('No file URL returned from upload service');
      }
      setForm({ ...form, image_url: fileUrl });
    } catch (err) {
      console.error('Error uploading image:', err);
      toastError('Upload Failed', `Failed to upload image: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Categories</h1>
          <p className="text-gray-600">Manage categories shown on the landing page and categories page</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Plus className="w-12 h-12" /></div>}
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => toggleFeatured(cat)} className={`p-1.5 rounded ${cat.is_featured ? 'bg-amber-400 text-white' : 'bg-white/80 text-gray-500'}`}><Star className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleStatus(cat)} className={`p-1.5 rounded ${cat.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>{cat.status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{cat.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => moveOrder(cat, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => moveOrder(cat, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowDown className="w-3 h-3" /></button>
                  <button onClick={() => openModal(cat)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {cat.description && <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <p className="mb-4">No categories yet</p>
          <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800"><Plus className="w-4 h-4 mr-2" /> Create First Category</Button>
        </CardContent></Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Cinema Cameras" /></div>
              <div><label className="block text-sm font-medium mb-2">Slug</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" /></div>
              <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Category description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
              <div>
                <label className="block text-sm font-medium mb-2">Category Image</label>
                <div className="flex gap-2">
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="flex-1" />
                  <input type="file" id="category-image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  <label htmlFor="category-image-upload" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors" disabled={uploadingImage}>
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-gray-600" />
                    )}
                  </label>
                </div>
                {form.image_url && (
                  <div className="mt-2">
                    <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" /> Featured on landing page</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
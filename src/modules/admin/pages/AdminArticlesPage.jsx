import React, { useState, useEffect } from 'react';
import { Article } from '@/lib/supabaseEntities';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, ArrowUp, ArrowDown, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminArticlesPage() {
  const { success, error: toastError } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author_name: '',
    category: 'news',
    tags: '',
    status: 'draft',
    display_order: 0,
    is_featured: false,
    meta_title: '',
    meta_description: '',
  });

  const fetchArticles = async () => {
    try {
      const all = await Article.list('-display_order', 100);
      setArticles(all || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      toastError('Load Failed', 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const openModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setForm({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        featured_image_url: article.featured_image_url || '',
        author_name: article.author_name || '',
        category: article.category || 'news',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        status: article.status || 'draft',
        display_order: article.display_order || 0,
        is_featured: article.is_featured || false,
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
      });
    } else {
      setEditingArticle(null);
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image_url: '',
        author_name: '',
        category: 'news',
        tags: '',
        status: 'draft',
        display_order: 0,
        is_featured: false,
        meta_title: '',
        meta_description: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toastError('Validation', 'Title is required'); return; }
    if (!form.content.trim()) { toastError('Validation', 'Content is required'); return; }
    try {
      const dataToSave = {
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        published_date: form.status === 'published' && !editingArticle?.published_date ? new Date().toISOString() : editingArticle?.published_date,
      };
      if (editingArticle) {
        await Article.update(editingArticle.id, dataToSave);
        success('Updated', 'Article updated');
      } else {
        await Article.create(dataToSave);
        success('Created', 'Article created');
      }
      setShowModal(false);
      fetchArticles();
    } catch (err) {
      console.error('Error saving article:', err);
      toastError('Save Failed', `Failed to save article: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await Article.delete(id);
      success('Deleted', 'Article deleted');
      fetchArticles();
    } catch (err) {
      console.error('Error deleting:', err);
      toastError('Delete Failed', 'Failed to delete article');
    }
  };

  const toggleStatus = async (article) => {
    try {
      const newStatus = article.status === 'published' ? 'draft' : 'published';
      await Article.update(article.id, { 
        status: newStatus, 
        published_date: newStatus === 'published' ? new Date().toISOString() : article.published_date 
      });
      success(newStatus === 'published' ? 'Published' : 'Unpublished', `Article is now ${newStatus}`);
      fetchArticles();
    } catch (err) {
      toastError('Failed', 'Failed to update status');
    }
  };

  const toggleFeatured = async (article) => {
    try {
      await Article.update(article.id, { is_featured: !article.is_featured });
      success('Updated', `Article ${article.is_featured ? 'removed from' : 'added to'} featured`);
      fetchArticles();
    } catch (err) {
      toastError('Failed', 'Failed to update featured status');
    }
  };

  const moveOrder = async (article, direction) => {
    const newOrder = (article.display_order || 0) + direction;
    try {
      await Article.update(article.id, { display_order: newOrder });
      fetchArticles();
    } catch (err) {
      toastError('Failed', 'Failed to reorder');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
          <p className="text-gray-600">Manage blog posts, news, and content articles</p>
        </div>
        <Button onClick={() => openModal()} className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add Article
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {articles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No articles yet</p>
              <Button onClick={() => openModal()} className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" /> Create First Article
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {articles.map((article) => (
                <div key={article.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => moveOrder(article, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveOrder(article, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                  {article.featured_image_url && (
                    <img src={article.featured_image_url} alt="" className="w-16 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{article.title}</span>
                      {article.is_featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{article.category}</span>
                      <span>Order: {article.display_order || 0}</span>
                      {article.author_name && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author_name}</span>}
                      {article.published_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.published_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleFeatured(article)} className={`p-2 rounded-lg ${article.is_featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStatus(article)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${article.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {article.status === 'published' ? <><Eye className="w-3 h-3 inline mr-1" />Published</> : <><EyeOff className="w-3 h-3 inline mr-1" />Draft</>}
                    </button>
                    <button onClick={() => openModal(article)} className="p-2 hover:bg-gray-200 rounded text-gray-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(article.id)} className="p-2 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingArticle ? 'Edit Article' : 'Add Article'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" className="rounded-lg" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-friendly-slug" className="rounded-lg" />
                </div>
              </div>
              <div>
                <Label>Excerpt</Label>
                <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary for previews" className="rounded-lg" />
              </div>
              <div>
                <Label>Content</Label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  placeholder="Article content (HTML or markdown supported)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                />
              </div>
              <div>
                <Label>Featured Image URL</Label>
                <Input value={form.featured_image_url} onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })} placeholder="https://..." className="rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Author Name</Label>
                  <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Author name" className="rounded-lg" />
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="news">News</option>
                    <option value="documentary">Documentary</option>
                    <option value="cultural">Cultural</option>
                    <option value="production">Production</option>
                    <option value="funding">Funding</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" className="rounded-lg" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="rounded-lg" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <Label htmlFor="is_featured" className="mb-0">Featured Article</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="SEO title" className="rounded-lg" />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} placeholder="SEO description" className="rounded-lg" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">{editingArticle ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

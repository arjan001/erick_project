import React, { useState, useEffect } from 'react'
import { TickerEntry, Article } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit2, Trash2, X, ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/useToast.jsx'

export default function AdminTickerPage() {
  const { success, error: toastError } = useToast()
  const [entries, setEntries] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [form, setForm] = useState({
    text: '', category: 'news', link_type: 'none',
    link_url: '', link_target_id: null, status: 'draft', display_order: 0,
  })

  const fetchData = async () => {
    try {
      const [tickerData, articlesData] = await Promise.all([
        TickerEntry.list('-display_order', 100),
        Article.list('-published_date', 100)
      ])
      setEntries(tickerData || [])
      setArticles(articlesData || [])
    } catch (err) {
      
      toastError('Load Failed', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(); }, [])

  const openModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry)
      setForm({
        text: entry.text || '',
        category: entry.category || 'news', link_type: entry.link_type || 'none',
        link_url: entry.link_url || '', link_target_id: entry.link_target_id || null,
        status: entry.status || 'draft', display_order: entry.display_order || 0,
      })
    } else {
      setEditingEntry(null)
      setForm({ text: '', category: 'news', link_type: 'none', link_url: '', link_target_id: null, status: 'draft', display_order: 0 })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.text.trim()) { toastError('Validation', 'Text is required'); return; }
    try {
      const dataToSave = {
        ...form,
        link_target_id: form.link_target_id || null
      }
      if (editingEntry) {
        await TickerEntry.update(editingEntry.id, dataToSave)
        success('Updated', 'Ticker entry updated')
      } else {
        await TickerEntry.create({ ...dataToSave, published_date: new Date().toISOString() })
        success('Created', 'Ticker entry created')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      
      toastError('Save Failed', `Failed to save ticker entry: ${err.message || 'Unknown error'}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this ticker entry?')) return
    try {
      await TickerEntry.delete(id)
      success('Deleted', 'Ticker entry deleted')
      fetchData()
    } catch (err) {
      
      toastError('Delete Failed', 'Failed to delete entry')
    }
  }

  const toggleStatus = async (entry) => {
    try {
      const newStatus = entry.status === 'live' ? 'draft' : 'live'
      await TickerEntry.update(entry.id, { status: newStatus, published_date: newStatus === 'live' ? new Date().toISOString() : entry.published_date })
      success(newStatus === 'live' ? 'Published' : 'Unpublished', `Entry is now ${newStatus}`)
      fetchData()
    } catch (err) {
      toastError('Failed', 'Failed to update status')
    }
  }

  const moveOrder = async (entry, direction) => {
    const newOrder = (entry.display_order || 0) + direction
    try {
      await TickerEntry.update(entry.id, { display_order: newOrder })
      fetchData()
    } catch (err) {
      toastError('Failed', 'Failed to reorder')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Navbar Marquee / Ticker</h1>
          <p className="text-gray-600">Manage the scrolling marquee items shown on the top banner. Items can link to articles, projects, or external URLs.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add Ticker Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No ticker entries yet</p>
              <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" /> Create First Entry
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => moveOrder(entry, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveOrder(entry, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{entry.text}</span>
                      {entry.link_type !== 'none' && entry.link_url && (
                        <a href={entry.link_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{entry.category?.replace(/_/g, ' ')}</span>
                      <span>Order: {entry.display_order || 0}</span>
                      <span>Link: {entry.link_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleStatus(entry)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${entry.status === 'live' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {entry.status === 'live' ? <><Eye className="w-3 h-3 inline mr-1" />Live</> : <><EyeOff className="w-3 h-3 inline mr-1" />Draft</>}
                    </button>
                    <button onClick={() => openModal(entry)} className="p-2 hover:bg-gray-200 rounded text-gray-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(entry.id)} className="p-2 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingEntry ? 'Edit Ticker Item' : 'Add Ticker Item'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Text (shown in marquee)</label>
                <Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="e.g., New documentary project seeking cultural backing" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="news">News</option>
                    <option value="article">Article</option>
                    <option value="announcement">Announcement</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="cultural_support">Cultural Support</option>
                    <option value="co_production">Co-Production</option>
                    <option value="partnership">Partnership</option>
                    <option value="institutional">Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="draft">Draft (hidden)</option>
                    <option value="live">Live (visible in marquee)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Link Type (what happens when clicked)</label>
                <select value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value, link_url: '', link_target_id: null })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="none">No link (plain text)</option>
                  <option value="url">External URL</option>
                  <option value="article">Article page</option>
                </select>
              </div>
              {form.link_type === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Link URL</label>
                  <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
                </div>
              )}
              {form.link_type === 'article' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Select Article</label>
                  <select 
                    value={form.link_target_id || ''} 
                    onChange={(e) => setForm({ ...form, link_target_id: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Select an article --</option>
                    {articles.filter(a => a.status === 'published').map(article => (
                      <option key={article.id} value={article.id}>{article.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Display Order (lower = appears first)</label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editingEntry ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
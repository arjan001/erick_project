import React, { useState, useEffect } from 'react'
import { TickerEntry } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit2, Trash2, X, Search, Check, ExternalLink, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import DataTable from '@/components/admin/DataTable'

export default function AdminTickerPage() {
  const { success, error: toastError } = useToast()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [form, setForm] = useState({
    text: '', link: '', active: true, display_order: 0,
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const tickerData = await TickerEntry.list('-display_order', 100)
      setEntries(tickerData || [])
    } catch (err) {
      console.error('Error fetching ticker entries:', err)
      toastError('Load Failed', 'Failed to load ticker entries')
      setEntries([])
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
        link: entry.link || '',
        active: entry.active !== false,
        display_order: entry.display_order || 0,
      })
    } else {
      setEditingEntry(null)
      setForm({ text: '', link: '', active: true, display_order: entries.length })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.text.trim()) { toastError('Validation', 'Text is required'); return; }
    try {
      const dataToSave = {
        text: form.text,
        link: form.link || null,
        active: form.active,
        display_order: form.display_order || 0,
      }
      if (editingEntry) {
        await TickerEntry.update(editingEntry.id, dataToSave)
        success('Updated', 'Ticker entry updated')
      } else {
        await TickerEntry.create(dataToSave)
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} ticker entries?`)) return
    try {
      await Promise.all(selectedIds.map(id => TickerEntry.delete(id)))
      success('Deleted', `${selectedIds.length} entries deleted`)
      setSelectedIds([])
      fetchData()
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete entries')
    }
  }

  const toggleStatus = async (entry) => {
    try {
      await TickerEntry.update(entry.id, { active: !entry.active })
      success(!entry.active ? 'Activated' : 'Deactivated', `Entry is now ${!entry.active ? 'active' : 'inactive'}`)
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

  const columns = [
    { key: 'text', label: 'Text', sortable: true, filterable: true },
    { key: 'link', label: 'Link', sortable: false, filterable: false, render: (value) => value ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />{value}</a> : '-' },
    { key: 'display_order', label: 'Order', sortable: true, filterable: false },
    {
      key: 'active', label: 'Status', sortable: true, filterable: true, render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'created_at', label: 'Created', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ]

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
          <p className="text-gray-600">Manage the scrolling marquee items shown on the top banner</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Add Ticker Item
          </Button>
        </div>
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
            <DataTable
              data={entries}
              columns={columns}
              searchable={true}
              exportable={true}
              pagination={true}
              pageSize={10}
              selectable={true}
              onSelect={(ids) => setSelectedIds(ids)}
              onRowClick={(row) => openModal(row)}
              actions={(row) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => moveOrder(row, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Move Up"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveOrder(row, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Move Down"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => toggleStatus(row)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title={row.active ? 'Deactivate' : 'Activate'}>{row.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  <button onClick={() => openModal(row)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(row.id)} className="p-1 hover:bg-red-50 rounded text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            />
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
                <Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="e.g., 🎬 SmartGigs Kenya - Your gateway to creative talent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Link URL (optional)</label>
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://smartgigs.oneplusafrica.com/FindGigs" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" />
                  Active (visible in marquee)
                </label>
              </div>
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

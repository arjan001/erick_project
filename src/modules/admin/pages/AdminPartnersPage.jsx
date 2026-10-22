import React, { useEffect, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Edit, Eye, EyeOff, Handshake, Plus, Trash2, X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const emptyForm = { name: '', logo_url: '', website: '', description: '', industry: '', contact_email: '', status: 'active', featured: false }

export default function AdminPartnersPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [partners, setPartners] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPartners(data || [])
    } catch (err) {
      console.error('Error loading partners:', err)
      error('Error', 'Failed to load partner logos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setForm({ ...emptyForm, sort_order: partners.length + 1 })
    setEditing({})
  }

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      logo_url: p.logo_url || '',
      website: p.website || '',
      description: p.description || '',
      industry: p.industry || '',
      contact_email: p.contact_email || '',
      status: p.status || 'active',
      featured: p.featured || false,
    })
    setEditing(p)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      error('Missing details', 'A name is required')
      return
    }
    setSaving(true)
    const data = {
      name: form.name.trim(),
      logo_url: form.logo_url || null,
      website: form.website || null,
      description: form.description || null,
      industry: form.industry || null,
      contact_email: form.contact_email || null,
      status: form.status || 'active',
      featured: form.featured || false,
    }
    try {
      if (editing?.id) {
        const { error } = await supabase
          .from('partners')
          .update(data)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('partners')
          .insert(data)
        if (error) throw error
      }
      success('Saved', editing?.id ? 'Partner updated' : 'Partner added')
      setEditing(null)
      await load()
    } catch (err) {
      console.error('Error saving partner:', err)
      error('Failed', 'Could not save the partner')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (p) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: p.status === 'active' ? 'inactive' : 'active' })
        .eq('id', p.id)
      if (error) throw error
      await load()
    } catch (err) {
      console.error('Error toggling partner:', err)
      error('Failed', 'Could not update the partner')
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', p.id)
      if (error) throw error
      success('Deleted', `${p.name} removed`)
      await load()
    } catch (err) {
      console.error('Error deleting partner:', err)
      error('Failed', 'Could not delete the partner')
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-black'

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="mt-1 text-gray-600">Brand logos shown in the "Trusted by" carousels on the landing and hiring pages.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" /> Add partner
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white py-16 text-gray-500">
          <Handshake className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm">No partners yet. Add your first logo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {partners.map((p) => (
            <div key={p.id} className={`rounded-lg border bg-white p-4 ${p.is_active === false ? 'border-dashed border-gray-300 opacity-60' : 'border-gray-200'}`}>
              <div className="flex h-24 items-center justify-center rounded-md bg-gray-50 p-3">
                <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="truncate text-xs text-gray-500">{p.website_url || 'No website'}</p>
                  <p className="mt-1 text-xs text-gray-400">Order: {p.sort_order}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <button onClick={() => handleToggle(p)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title={p.is_active === false ? 'Show' : 'Hide'}>
                    {p.is_active === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">{editing.id ? 'Edit partner' : 'Add partner'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Name</span>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Logo URL</span>
                <input
                  className={inputCls}
                  placeholder="https://… or /brands/logo.svg"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Or upload logo file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    try {
                      const fileName = `partner-${Date.now()}-${file.name}`
                      const { data, error } = await supabase.storage
                        .from('cms-assets')
                        .upload(fileName, file)
                      if (error) throw error
                      const { data: { publicUrl } } = supabase.storage
                        .from('cms-assets')
                        .getPublicUrl(fileName)
                      setForm({ ...form, logo_url: publicUrl })
                    } catch (err) {
                      console.error('Error uploading logo:', err)
                      error('Upload Failed', 'Failed to upload logo')
                    }
                  }}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </label>
              {form.logo_url && (
                <div className="flex h-16 items-center justify-center rounded-md bg-gray-50 p-2">
                  <img src={form.logo_url} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Website (optional)</span>
                <input className={inputCls} value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
              </label>
              <div className="flex items-center gap-4">
                <label className="block flex-1">
                  <span className="mb-1 block text-xs font-medium text-gray-600">Display order</span>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </label>
                <label className="mt-5 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Visible
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

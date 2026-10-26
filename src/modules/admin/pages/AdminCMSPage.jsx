import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Edit2, Save, X, FileText, Image, Bold, Italic, Underline, List, Link2, Heading } from 'lucide-react'
import { auditService } from '@/services/auditService'

const STORAGE_KEY = 'smartgigs_cms_pages'

const DEFAULT_PAGES = [
  { page_key: 'about', title: 'About Us', content: '', hero_image: '' },
  { page_key: 'privacy', title: 'Privacy Policy', content: '', hero_image: '' },
  { page_key: 'terms', title: 'Terms & Conditions', content: '', hero_image: '' },
  { page_key: 'gdpr', title: 'GDPR', content: '', hero_image: '' },
  { page_key: 'cookies', title: 'Cookie Policy', content: '', hero_image: '' },
  { page_key: 'imprint', title: 'Imprint', content: '', hero_image: '' },
  { page_key: 'faq', title: 'FAQ', content: '', hero_image: '' },
  { page_key: 'contact', title: 'Contact Us', content: '', hero_image: '' },
  { page_key: 'careers', title: 'Careers', content: '', hero_image: '' },
  { page_key: 'pricing', title: 'Pricing', content: '', hero_image: '' },
  { page_key: 'signin', title: 'Sign In Page', content: '', hero_image: '' },
  { page_key: 'signup', title: 'Sign Up Page', content: '', hero_image: '' },
  { page_key: 'footer', title: 'Footer Content', content: '', hero_image: '' },
  { page_key: 'newsletter', title: 'Newsletter Content', content: '', hero_image: '' },
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null; }
}

function saveToStorage(pages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
}

export default function AdminCMSPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingPage, setEditingPage] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '', hero_image: '' })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        const merged = DEFAULT_PAGES.map(dp => {
          const found = data.find(r => r.page_key === dp.page_key)
          return found || dp
        })
        setPages(merged)
      } else {
        const stored = loadFromStorage()
        if (stored && stored.length > 0) {
          setPages(stored)
        } else {
          setPages(DEFAULT_PAGES)
        }
      }
    } catch (err) {
      console.error('Error fetching CMS pages:', err)
      const stored = loadFromStorage()
      setPages(stored && stored.length > 0 ? stored : DEFAULT_PAGES)
    }
    setLoading(false)
  }

  const handleEdit = (page) => {
    setEditingPage(page)
    setFormData({ title: page.title || '', content: page.content || '', hero_image: page.hero_image || '' })
  }

  const handleSave = async () => {
    const updated = pages.map(p =>
      p.page_key === editingPage.page_key
        ? { ...p, ...formData, updated_at: new Date().toISOString() }
        : p
    )
    setPages(updated)
    saveToStorage(updated)
    try {
      if (editingPage.id) {
        const { error } = await supabase
          .from('cms_pages')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingPage.id)
        if (error) throw error
        
        await auditService.logUpdate('cms_pages', editingPage.id, 'admin', { 
          page_key: editingPage.page_key,
          title: formData.title 
        })
      } else {
        const { error } = await supabase
          .from('cms_pages')
          .insert({ page_key: editingPage.page_key, ...formData })
        if (error) throw error
        
        await auditService.logCreate('cms_pages', null, 'admin', { 
          page_key: editingPage.page_key,
          title: formData.title 
        })
      }
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'save_cms_page', page_key: editingPage.page_key })
      console.error('Error saving CMS page:', err)
    }
    setEditingPage(null)
  }

  const execCommand = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    const editor = document.getElementById('cms-rich-editor')
    if (editor) setFormData(prev => ({ ...prev, content: editor.innerHTML }))
  }

  const filtered = pages.filter(p =>
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.page_key || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">CMS — Page Content</h1>
        <p className="text-sm text-gray-500">Edit content for all site pages including policies, about, login, and more</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-8 text-center text-gray-400">Loading...</div>
        ) : (
          filtered.map((page) => (
            <div key={page.page_key} className="rounded-xl border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{page.title}</h3>
                    <p className="text-xs text-gray-400">/{page.page_key}</p>
                  </div>
                </div>
                <button onClick={() => handleEdit(page)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Edit: {editingPage.title}</h2>
              <button onClick={() => setEditingPage(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Hero Image URL</label>
                <input
                  type="text"
                  value={formData.hero_image}
                  onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                <div className="mb-2 flex gap-2">
                  <button onClick={() => execCommand('bold')} className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button onClick={() => execCommand('italic')} className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50">
                    <Italic className="h-4 w-4" />
                  </button>
                  <button onClick={() => execCommand('underline')} className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50">
                    <Underline className="h-4 w-4" />
                  </button>
                  <button onClick={() => execCommand('insertUnorderedList')} className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50">
                    <List className="h-4 w-4" />
                  </button>
                  <button onClick={() => execCommand('createLink', prompt('Enter URL:'))} className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50">
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>
                <div
                  id="cms-rich-editor"
                  contentEditable
                  className="min-h-[300px] rounded-lg border border-gray-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                  onInput={(e) => setFormData({ ...formData, content: e.target.innerHTML })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingPage(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                <Save className="mr-2 inline h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

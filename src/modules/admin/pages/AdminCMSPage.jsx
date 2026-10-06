import React, { useState, useEffect } from 'react';
import { Search, Edit2, Save, X, FileText, Image, Bold, Italic, Underline, List, Link2, Heading } from 'lucide-react';
import { CMSPage as CMSPageEntity } from '@/lib/supabaseEntities';

const STORAGE_KEY = 'smartgigs_cms_pages';

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
];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToStorage(pages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

export default function AdminCMSPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', hero_image: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const rows = await CMSPageEntity.list('-updated_at', 100);
      if (rows && rows.length > 0) {
        const merged = DEFAULT_PAGES.map(dp => {
          const found = rows.find(r => r.page_key === dp.page_key);
          return found || dp;
        });
        setPages(merged);
      } else {
        const stored = loadFromStorage();
        if (stored && stored.length > 0) {
          setPages(stored);
        } else {
          setPages(DEFAULT_PAGES);
        }
      }
    } catch {
      const stored = loadFromStorage();
      setPages(stored && stored.length > 0 ? stored : DEFAULT_PAGES);
    }
    setLoading(false);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({ title: page.title || '', content: page.content || '', hero_image: page.hero_image || '' });
  };

  const handleSave = async () => {
    const updated = pages.map(p =>
      p.page_key === editingPage.page_key
        ? { ...p, ...formData, updated_at: new Date().toISOString() }
        : p
    );
    setPages(updated);
    saveToStorage(updated);
    try {
      if (editingPage.id) {
        await CMSPageEntity.update(editingPage.id, { ...formData, updated_at: new Date().toISOString() });
      } else {
        await CMSPageEntity.create({ page_key: editingPage.page_key, ...formData });
      }
    } catch { /* fallback to localStorage */ }
    setEditingPage(null);
  };

  const execCommand = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    const editor = document.getElementById('cms-rich-editor');
    if (editor) setFormData(prev => ({ ...prev, content: editor.innerHTML }));
  };

  const filtered = pages.filter(p =>
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.page_key || '').toLowerCase().includes(search.toLowerCase())
  );

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
              {page.content ? (
                <p className="mt-3 text-xs text-gray-500 line-clamp-2">
                  {page.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                </p>
              ) : (
                <p className="mt-3 text-xs text-gray-400 italic">No content yet</p>
              )}
            </div>
          ))
        )}
      </div>

      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Edit: {editingPage.title}</h2>
              <button onClick={() => setEditingPage(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Page Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Image className="h-3.5 w-3.5" /> Hero Image URL
                </label>
                <input
                  type="text"
                  value={formData.hero_image}
                  onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="https://..."
                />
                {formData.hero_image && (
                  <img src={formData.hero_image} alt="Preview" className="mt-2 h-32 w-full rounded-lg object-cover" />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 px-2 py-1.5">
                  <button onClick={() => execCommand('bold')} className="rounded p-1.5 hover:bg-gray-200" title="Bold"><Bold className="h-4 w-4 text-gray-600" /></button>
                  <button onClick={() => execCommand('italic')} className="rounded p-1.5 hover:bg-gray-200" title="Italic"><Italic className="h-4 w-4 text-gray-600" /></button>
                  <button onClick={() => execCommand('underline')} className="rounded p-1.5 hover:bg-gray-200" title="Underline"><Underline className="h-4 w-4 text-gray-600" /></button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button onClick={() => execCommand('insertUnorderedList')} className="rounded p-1.5 hover:bg-gray-200" title="Bullet list"><List className="h-4 w-4 text-gray-600" /></button>
                  <button onClick={() => execCommand('formatBlock', 'h2')} className="rounded px-2 py-1 text-xs font-bold hover:bg-gray-200">H2</button>
                  <button onClick={() => execCommand('formatBlock', 'h3')} className="rounded px-2 py-1 text-xs font-bold hover:bg-gray-200">H3</button>
                  <button onClick={() => execCommand('formatBlock', 'p')} className="rounded px-2 py-1 text-xs hover:bg-gray-200">P</button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button onClick={() => { const url = prompt('Enter URL:'); if (url) execCommand('createLink', url); }} className="rounded p-1.5 hover:bg-gray-200" title="Insert link"><Link2 className="h-4 w-4 text-gray-600" /></button>
                  <button onClick={() => { const url = prompt('Enter image URL:'); if (url) execCommand('insertImage', url); }} className="rounded p-1.5 hover:bg-gray-200" title="Insert image"><Image className="h-4 w-4 text-gray-600" /></button>
                </div>
                <div
                  id="cms-rich-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setFormData(prev => ({ ...prev, content: e.currentTarget.innerHTML }))}
                  className="min-h-[300px] rounded-b-lg border border-gray-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  style={{ lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setEditingPage(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

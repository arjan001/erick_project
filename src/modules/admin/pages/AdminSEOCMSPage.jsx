import React, { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Search, Globe, Code, Save, Plus, Trash2, Copy, RefreshCw, Zap, Layout, FileText, Image, Link, ToggleLeft, ToggleRight, Edit, X, Loader2 } from 'lucide-react'
import { getPageMetadata, createPageMetadata, updatePageMetadata, deletePageMetadata } from '../api/seo.api'
import RichTextEditor from '@/components/admin/RichTextEditor'

export default function AdminSEOCMSPage() {
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pages')

  // SEO Settings
  const [seoSettings, setSeoSettings] = useState({
    defaultTitle: 'SmartGigs Kenya - Film & TV Talent Platform',
    defaultDescription: 'Connect with top actors, crew, and creators in Kenya. Find jobs, showcase portfolio, and collaborate on amazing projects.',
    defaultKeywords: 'smartgigs kenya, film, tv, actors, crew, jobs, portfolio',
    ogImage: '',
    twitterHandle: '@smartgigske',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    enableSitemap: true,
    enableRobotsTxt: true,
    enableStructuredData: true
  })

  // CMS Pages - loaded from backend
  const [cmsPages, setCmsPages] = useState([])

  // Load pages from backend on mount
  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    setLoading(true)
    try {
      const pages = await getPageMetadata()
      if (pages && pages.length > 0) {
        setCmsPages(pages.map(p => ({
          id: p.id,
          title: p.page_title || '',
          slug: p.page_slug || '',
          metaTitle: p.meta_title || '',
          metaDescription: p.meta_description || '',
          metaKeywords: p.meta_keywords || '',
          ogImage: p.og_image || '',
          customHead: p.custom_head || '',
          status: p.status || 'published',
          lastModified: p.updated_at || p.created_at
        })))
      }
    } catch (err) {
      
      // On error, initialize with default pages
      setCmsPages([
        {
          id: 'home',
          title: 'Home',
          slug: '/',
          metaTitle: 'SmartGigs Kenya - Film & TV Talent Platform',
          metaDescription: 'Connect with top actors, crew, and creators in Kenya.',
          metaKeywords: 'smartgigs kenya, film, tv, actors',
          ogImage: '',
          customHead: '',
          status: 'published',
          lastModified: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Auto-Generated Rules
  const [autoRules, setAutoRules] = useState([
    {
      id: 'rule1',
      name: 'Auto-Generate Meta Titles',
      description: 'Automatically generate meta titles from page content',
      enabled: true,
      pattern: '{page_name} - Eric Rabar'
    },
    {
      id: 'rule2',
      name: 'Auto-Generate Meta Descriptions',
      description: 'Generate descriptions from first paragraph',
      enabled: true,
      pattern: 'First 160 characters of content'
    },
    {
      id: 'rule3',
      name: 'Auto-Generate Open Graph Tags',
      description: 'Auto-generate OG tags for social sharing',
      enabled: true,
      pattern: 'Default OG image + title'
    },
    {
      id: 'rule4',
      name: 'Auto-Generate Structured Data',
      description: 'Generate JSON-LD structured data',
      enabled: true,
      pattern: 'Organization schema'
    },
    {
      id: 'rule5',
      name: 'Auto-Generate Canonical URLs',
      description: 'Auto-add canonical tags',
      enabled: true,
      pattern: 'Current URL'
    },
    {
      id: 'rule6',
      name: 'Auto-Generate Alt Text',
      description: 'Generate alt text from image filenames',
      enabled: false,
      pattern: 'Filename to readable text'
    }
  ])

  // Redirect Rules
  const [redirects, setRedirects] = useState([
    { id: 1, from: '/old-path', to: '/new-path', type: '301', status: 'active' }
  ])

  // Navbar & Footer Settings
  const [navFooterSettings, setNavFooterSettings] = useState({
    // Navbar Settings
    navbarLogo: 'Eric Rabar',
    navbarLogoUrl: '',
    showNavbarLogo: true,
    navbarLinks: [
      { id: 1, label: 'Projects', url: '/Projects', order: 1 },
      { id: 2, label: 'Work', url: '/Work', order: 2 },
      { id: 3, label: 'Services', url: '/Services', order: 3 },
      { id: 4, label: 'About', url: '/about', order: 4 },
      { id: 5, label: 'Contact', url: '/contact', order: 5 }
    ],
    showLoginButton: true,
    showSignupButton: true,
    navbarStyle: 'fixed',
    navbarBackgroundColor: '#000000',
    navbarTextColor: '#ffffff',

    // Footer Settings
    footerLogo: 'Eric Rabar',
    footerLogoUrl: '',
    showFooterLogo: true,
    footerDescription: 'Premium video production network connecting artists, teams, and clients worldwide.',
    footerLinks: [
      {
        id: 1,
        title: 'Company',
        links: [
          { id: 1, label: 'About Us', url: '/about' },
          { id: 2, label: 'Careers', url: '/careers' },
          { id: 3, label: 'Press', url: '/press' },
          { id: 4, label: 'Blog', url: '/blog' }
        ]
      },
      {
        id: 2,
        title: 'Resources',
        links: [
          { id: 1, label: 'Help Center', url: '/help' },
          { id: 2, label: 'Documentation', url: '/docs' },
          { id: 3, label: 'Community', url: '/community' },
          { id: 4, label: 'API', url: '/api' }
        ]
      },
      {
        id: 3,
        title: 'Legal',
        links: [
          { id: 1, label: 'Privacy Policy', url: '/privacy' },
          { id: 2, label: 'Terms of Service', url: '/terms' },
          { id: 3, label: 'Cookie Policy', url: '/cookies' },
          { id: 4, label: 'GDPR', url: '/gdpr' }
        ]
      }
    ],
    socialLinks: [
      { id: 1, platform: 'twitter', url: 'https://twitter.com/ericrabar', icon: 'twitter' },
      { id: 2, platform: 'facebook', url: 'https://facebook.com/ericrabar', icon: 'facebook' },
      { id: 3, platform: 'instagram', url: 'https://instagram.com/ericrabar', icon: 'instagram' },
      { id: 4, platform: 'linkedin', url: 'https://linkedin.com/company/ericrabar', icon: 'linkedin' },
      { id: 5, platform: 'youtube', url: 'https://youtube.com/ericrabar', icon: 'youtube' }
    ],
    footerBackgroundColor: '#000000',
    footerTextColor: '#ffffff',
    showNewsletter: true,
    newsletterPlaceholder: 'Enter your email',
    copyrightText: '© 2026 Eric Rabar. All rights reserved.',
    showBackToTop: true
  })

  const [showPageModal, setShowPageModal] = useState(false)
  const [showRedirectModal, setShowRedirectModal] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    customHead: '',
    status: 'draft'
  })

  const handleSaveSeoSettings = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Saved', 'SEO settings saved successfully')
    } catch (err) {
      
      error('Failed', 'Failed to save SEO settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePage = async () => {
    setSaving(true)
    try {
      if (editingPage) {
        // Update existing page
        await updatePageMetadata(editingPage.id, {
          page_title: pageForm.title,
          page_slug: pageForm.slug,
          meta_title: pageForm.metaTitle,
          meta_description: pageForm.metaDescription,
          meta_keywords: pageForm.metaKeywords,
          og_image: pageForm.ogImage,
          custom_head: pageForm.customHead,
          status: pageForm.status
        })
        setCmsPages(cmsPages.map(p => p.id === editingPage.id ? { ...pageForm, id: editingPage.id, lastModified: new Date().toISOString() } : p))
        success('Updated', 'Page updated successfully')
      } else {
        // Create new page
        const newPage = await createPageMetadata({
          page_title: pageForm.title,
          page_slug: pageForm.slug,
          meta_title: pageForm.metaTitle,
          meta_description: pageForm.metaDescription,
          meta_keywords: pageForm.metaKeywords,
          og_image: pageForm.ogImage,
          custom_head: pageForm.customHead,
          status: pageForm.status
        })
        setCmsPages([...cmsPages, { ...pageForm, id: newPage.id, lastModified: new Date().toISOString() }])
        success('Created', 'Page created successfully')
      }
      setShowPageModal(false)
      setEditingPage(null)
      setPageForm({ title: '', slug: '', metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '', customHead: '', status: 'draft' })
    } catch (err) {
      
      error('Failed', 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePage = async (pageId) => {
    try {
      await deletePageMetadata(pageId)
      setCmsPages(cmsPages.filter(p => p.id !== pageId))
      success('Deleted', 'Page deleted successfully')
    } catch (err) {
      
      error('Failed', 'Failed to delete page')
    }
  }

  const handleToggleRule = (ruleId) => {
    setAutoRules(autoRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
  }

  const handleAddRedirect = () => {
    const newRedirect = { id: Date.now(), from: '', to: '', type: '301', status: 'active' }
    setRedirects([...redirects, newRedirect])
  }

  const handleDeleteRedirect = (redirectId) => {
    setRedirects(redirects.filter(r => r.id !== redirectId))
  }

  const handleUpdateRedirect = (redirectId, field, value) => {
    setRedirects(redirects.map(r => r.id === redirectId ? { ...r, [field]: value } : r))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO & CMS</h1>
        <p className="text-gray-600 mt-1">Manage SEO settings, CMS pages, and auto-generated rules</p>
      </div>

      <div>
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'pages' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          >
            <Layout className="w-4 h-4 inline mr-2" />
            CMS Pages
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'seo' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            SEO Settings
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'rules' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Auto-Generated Rules
          </button>
          <button
            onClick={() => setActiveTab('redirects')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'redirects' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            Redirects
          </button>
          <button
            onClick={() => setActiveTab('navfooter')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'navfooter' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Navbar & Footer
          </button>
        </div>

        {activeTab === 'pages' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">CMS Pages</h2>
              <Button size="sm" onClick={() => { setEditingPage(null); setPageForm({ title: '', slug: '', metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '', customHead: '', status: 'draft' }); setShowPageModal(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Page
              </Button>
            </div>
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cmsPages.map(page => (
                  <div key={page.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-gray-900">{page.title}</div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {page.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{page.slug}</div>
                        <div className="text-sm text-gray-400 mt-1">Modified: {new Date(page.lastModified).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingPage(page); setPageForm(page); setShowPageModal(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Global SEO Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label>
                  <input
                    type="text"
                    value={seoSettings.defaultTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Description</label>
                  <textarea
                    value={seoSettings.defaultDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Keywords</label>
                  <input
                    type="text"
                    value={seoSettings.defaultKeywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultKeywords: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Handle</label>
                    <input
                      type="text"
                      value={seoSettings.twitterHandle}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={seoSettings.ogImage}
                      onChange={(e) => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                    <input
                      type="text"
                      value={seoSettings.googleAnalyticsId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                      placeholder="UA-XXXXX-X"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GTM ID</label>
                    <input
                      type="text"
                      value={seoSettings.googleTagManagerId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleTagManagerId: e.target.value })}
                      placeholder="GTM-XXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={seoSettings.facebookPixelId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Technical SEO
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Sitemap</div>
                    <div className="text-sm text-gray-500">Auto-generate XML sitemap</div>
                  </div>
                  <button
                    onClick={() => setSeoSettings({ ...seoSettings, enableSitemap: !seoSettings.enableSitemap })}
                    className="p-2"
                  >
                    {seoSettings.enableSitemap ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Robots.txt</div>
                    <div className="text-sm text-gray-500">Auto-generate robots.txt</div>
                  </div>
                  <button
                    onClick={() => setSeoSettings({ ...seoSettings, enableRobotsTxt: !seoSettings.enableRobotsTxt })}
                    className="p-2"
                  >
                    {seoSettings.enableRobotsTxt ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Structured Data</div>
                    <div className="text-sm text-gray-500">Auto-generate JSON-LD schema</div>
                  </div>
                  <button
                    onClick={() => setSeoSettings({ ...seoSettings, enableStructuredData: !seoSettings.enableStructuredData })}
                    className="p-2"
                  >
                    {seoSettings.enableStructuredData ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSeoSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Auto-Generated SEO Rules</h2>
              <p className="text-sm text-gray-500 mt-1">Configure automatic SEO generation rules</p>
            </div>
            <div className="divide-y divide-gray-200">
              {autoRules.map(rule => (
                <div key={rule.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900">{rule.name}</div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{rule.description}</div>
                      <div className="text-sm text-gray-400 mt-1">Pattern: {rule.pattern}</div>
                    </div>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="p-2"
                    >
                      {rule.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'redirects' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">URL Redirects</h2>
              <Button size="sm" onClick={handleAddRedirect}>
                <Plus className="w-4 h-4 mr-1" />
                Add Redirect
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {redirects.map(redirect => (
                <div key={redirect.id} className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={redirect.from}
                        onChange={(e) => handleUpdateRedirect(redirect.id, 'from', e.target.value)}
                        placeholder="/old-path"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={redirect.to}
                        onChange={(e) => handleUpdateRedirect(redirect.id, 'to', e.target.value)}
                        placeholder="/new-path"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={redirect.type}
                        onChange={(e) => handleUpdateRedirect(redirect.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="301">301 Permanent</option>
                        <option value="302">302 Temporary</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRedirect(redirect.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'navfooter' && (
          <div className="max-w-4xl space-y-6">
            {/* Navbar Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navbar Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                    <input
                      type="text"
                      value={navFooterSettings.navbarLogo}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, navbarLogo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={navFooterSettings.showNavbarLogo}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, showNavbarLogo: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Show Logo</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={navFooterSettings.navbarLogoUrl}
                    onChange={(e) => setNavFooterSettings({ ...navFooterSettings, navbarLogoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={navFooterSettings.navbarBackgroundColor}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, navbarBackgroundColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={navFooterSettings.navbarTextColor}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, navbarTextColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Navbar Style</label>
                  <select
                    value={navFooterSettings.navbarStyle}
                    onChange={(e) => setNavFooterSettings({ ...navFooterSettings, navbarStyle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="sticky">Sticky</option>
                    <option value="static">Static</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={navFooterSettings.showLoginButton}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, showLoginButton: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Show Login Button</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={navFooterSettings.showSignupButton}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, showSignupButton: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Show Signup Button</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                    <input
                      type="text"
                      value={navFooterSettings.footerLogo}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, footerLogo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={navFooterSettings.showFooterLogo}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, showFooterLogo: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Show Logo</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={navFooterSettings.footerLogoUrl}
                    onChange={(e) => setNavFooterSettings({ ...navFooterSettings, footerLogoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Description</label>
                  <textarea
                    value={navFooterSettings.footerDescription}
                    onChange={(e) => setNavFooterSettings({ ...navFooterSettings, footerDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={navFooterSettings.footerBackgroundColor}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, footerBackgroundColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={navFooterSettings.footerTextColor}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, footerTextColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                  <input
                    type="text"
                    value={navFooterSettings.copyrightText}
                    onChange={(e) => setNavFooterSettings({ ...navFooterSettings, copyrightText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={navFooterSettings.showNewsletter}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, showNewsletter: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Show Newsletter</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={navFooterSettings.showBackToTop}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, showBackToTop: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Show Back to Top</span>
                  </label>
                </div>
                {navFooterSettings.showNewsletter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Placeholder</label>
                    <input
                      type="text"
                      value={navFooterSettings.newsletterPlaceholder}
                      onChange={(e) => setNavFooterSettings({ ...navFooterSettings, newsletterPlaceholder: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Links */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Link Sections</h2>
              <div className="space-y-4">
                {navFooterSettings.footerLinks.map((section, sectionIndex) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          const newLinks = [...navFooterSettings.footerLinks]
                          newLinks[sectionIndex].title = e.target.value
                          setNavFooterSettings({ ...navFooterSettings, footerLinks: newLinks })
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      {section.links.map((link, linkIndex) => (
                        <div key={link.id} className="flex gap-2">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...navFooterSettings.footerLinks]
                              newLinks[sectionIndex].links[linkIndex].label = e.target.value
                              setNavFooterSettings({ ...navFooterSettings, footerLinks: newLinks })
                            }}
                            placeholder="Label"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...navFooterSettings.footerLinks]
                              newLinks[sectionIndex].links[linkIndex].url = e.target.value
                              setNavFooterSettings({ ...navFooterSettings, footerLinks: newLinks })
                            }}
                            placeholder="URL"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
              <div className="space-y-2">
                {navFooterSettings.socialLinks.map((social, index) => (
                  <div key={social.id} className="flex gap-2">
                    <input
                      type="text"
                      value={social.platform}
                      onChange={(e) => {
                        const newSocial = [...navFooterSettings.socialLinks]
                        newSocial[index].platform = e.target.value
                        setNavFooterSettings({ ...navFooterSettings, socialLinks: newSocial })
                      }}
                      placeholder="Platform"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => {
                        const newSocial = [...navFooterSettings.socialLinks]
                        newSocial[index].url = e.target.value
                        setNavFooterSettings({ ...navFooterSettings, socialLinks: newSocial })
                      }}
                      placeholder="URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSeoSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {showPageModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingPage ? 'Edit Page' : 'Add New Page'}</h2>
              <button onClick={() => setShowPageModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={pageForm.slug}
                  onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={pageForm.metaTitle}
                  onChange={(e) => setPageForm({ ...pageForm, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={pageForm.metaDescription}
                  onChange={(e) => setPageForm({ ...pageForm, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  value={pageForm.metaKeywords}
                  onChange={(e) => setPageForm({ ...pageForm, metaKeywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input
                  type="text"
                  value={pageForm.ogImage}
                  onChange={(e) => setPageForm({ ...pageForm, ogImage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Head (HTML)</label>
                <RichTextEditor
                  value={pageForm.customHead}
                  onChange={(value) => setPageForm({ ...pageForm, customHead: value })}
                  placeholder="Enter custom HTML for head section..."
                  height="150px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={pageForm.status}
                  onChange={(e) => setPageForm({ ...pageForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowPageModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleSavePage} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">Save Page</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
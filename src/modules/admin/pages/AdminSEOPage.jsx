import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Switch } from '@/shared/components/ui/switch';
import { Save, Globe, FileText, Image as ImageIcon, Map, Settings, Code, RefreshCw, Plus, Trash2, Edit, ChevronLeft, ChevronRight, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getSeoSettings, updateSeoSettings, getPageMetadata, updatePageMetadata, createPageMetadata, deletePageMetadata, generateSitemap } from '../api/seo.api';

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sitemapRegenerating, setSitemapRegenerating] = useState(false);
  const [seoSettings, setSeoSettings] = useState(null);
  const [cmsPages, setCmsPages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editingPage, setEditingPage] = useState(null);
  const [showAddPage, setShowAddPage] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settings, pages] = await Promise.all([
        getSeoSettings().catch(() => null),
        getPageMetadata().catch(() => [])
      ]);
      
      if (settings) {
        setSeoSettings({
          siteTitle: settings.site_title || '',
          siteDescription: settings.site_description || '',
          siteKeywords: settings.site_keywords || '',
          canonicalUrl: settings.canonical_url || '',
          sitemapEnabled: settings.sitemap_enabled || false,
          sitemapPriority: settings.sitemap_priority || 0.8,
          sitemapChangeFreq: settings.sitemap_change_freq || 'weekly',
          robotsTxt: settings.robots_txt || '',
          ogTitle: settings.og_title || '',
          ogDescription: settings.og_description || '',
          ogImage: settings.og_image || '',
          ogType: settings.og_type || 'website',
          ogLocale: settings.og_locale || 'en_US',
          twitterCard: settings.twitter_card || 'summary_large_image',
          twitterSite: settings.twitter_site || '',
          twitterCreator: settings.twitter_creator || '',
          twitterImage: settings.twitter_image || '',
          enableSchema: settings.enable_schema || false,
          organizationName: settings.organization_name || '',
          organizationLogo: settings.organization_logo || '',
          organizationUrl: settings.organization_url || '',
          sameAs: settings.same_as || [],
          enableAnalytics: settings.enable_analytics || false,
          googleAnalyticsId: settings.google_analytics_id || '',
          enableGTM: settings.enable_gtm || false,
          gtmId: settings.gtm_id || '',
          enableFacebookPixel: settings.enable_facebook_pixel || false,
          facebookPixelId: settings.facebook_pixel_id || '',
        });
      }
      
      if (pages && pages.length > 0) {
        setCmsPages(pages.map(p => ({
          id: p.id,
          title: p.page_title || '',
          slug: p.page_slug || '',
          metaTitle: p.meta_title || '',
          metaDescription: p.meta_description || '',
          canonical: p.canonical_url || '',
          ogImage: p.og_image || '',
          noIndex: p.no_index || false,
          priority: p.sitemap_priority || 0.8,
          changeFreq: p.sitemap_change_freq || 'weekly'
        })));
      }
    } catch (error) {
      console.error('Error loading SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Save SEO settings
      if (seoSettings) {
        await updateSeoSettings({
          site_title: seoSettings.siteTitle,
          site_description: seoSettings.siteDescription,
          site_keywords: seoSettings.siteKeywords,
          canonical_url: seoSettings.canonicalUrl,
          sitemap_enabled: seoSettings.sitemapEnabled,
          sitemap_priority: seoSettings.sitemapPriority,
          sitemap_change_freq: seoSettings.sitemapChangeFreq,
          robots_txt: seoSettings.robotsTxt,
          og_title: seoSettings.ogTitle,
          og_description: seoSettings.ogDescription,
          og_image: seoSettings.ogImage,
          og_type: seoSettings.ogType,
          og_locale: seoSettings.ogLocale,
          twitter_card: seoSettings.twitterCard,
          twitter_site: seoSettings.twitterSite,
          twitter_creator: seoSettings.twitterCreator,
          twitter_image: seoSettings.twitterImage,
          enable_schema: seoSettings.enableSchema,
          organization_name: seoSettings.organizationName,
          organization_logo: seoSettings.organizationLogo,
          organization_url: seoSettings.organizationUrl,
          same_as: seoSettings.sameAs,
          enable_analytics: seoSettings.enableAnalytics,
          google_analytics_id: seoSettings.googleAnalyticsId,
          enable_gtm: seoSettings.enableGTM,
          gtm_id: seoSettings.gtmId,
          enable_facebook_pixel: seoSettings.enableFacebookPixel,
          facebook_pixel_id: seoSettings.facebookPixelId,
        });
      }
      
      // Save page metadata
      for (const page of cmsPages) {
        if (page.id) {
          await updatePageMetadata(page.id, {
            page_title: page.title,
            page_slug: page.slug,
            meta_title: page.metaTitle,
            meta_description: page.metaDescription,
            canonical_url: page.canonical,
            og_image: page.ogImage,
            no_index: page.noIndex,
            sitemap_priority: page.priority,
            sitemap_change_freq: page.changeFreq,
          });
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving SEO settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateSitemap = async () => {
    setSitemapRegenerating(true);
    try {
      await generateSitemap();
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
    } finally {
      setSitemapRegenerating(false);
    }
  };

  // Pagination
  const filteredPages = cmsPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddPage = () => {
    const newPage = {
      id: null,
      title: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      canonical: '',
      ogImage: '',
      noIndex: false,
      priority: 0.8,
      changeFreq: 'weekly'
    };
    setEditingPage(newPage);
    setShowAddPage(true);
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setShowAddPage(true);
  };

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page metadata?')) {
      try {
        await deletePageMetadata(pageId);
        setCmsPages(cmsPages.filter(p => p.id !== pageId));
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };

  const handleSavePage = async () => {
    try {
      if (editingPage.id) {
        await updatePageMetadata(editingPage.id, {
          page_title: editingPage.title,
          page_slug: editingPage.slug,
          meta_title: editingPage.metaTitle,
          meta_description: editingPage.metaDescription,
          canonical_url: editingPage.canonical,
          og_image: editingPage.ogImage,
          no_index: editingPage.noIndex,
          sitemap_priority: editingPage.priority,
          sitemap_change_freq: editingPage.changeFreq,
        });
        setCmsPages(cmsPages.map(p => p.id === editingPage.id ? editingPage : p));
      } else {
        const newPage = await createPageMetadata({
          page_title: editingPage.title,
          page_slug: editingPage.slug,
          meta_title: editingPage.metaTitle,
          meta_description: editingPage.metaDescription,
          canonical_url: editingPage.canonical,
          og_image: editingPage.ogImage,
          no_index: editingPage.noIndex,
          sitemap_priority: editingPage.priority,
          sitemap_change_freq: editingPage.changeFreq,
        });
        setCmsPages([...cmsPages, { ...editingPage, id: newPage.id }]);
      }
      setShowAddPage(false);
      setEditingPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO & Metadata Management</h1>
          <p className="text-gray-600">Comprehensive SEO settings, sitemap generation, and social media optimization</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRegenerateSitemap} 
            variant="outline" 
            className="border-gray-300 hover:bg-gray-50"
            disabled={sitemapRegenerating}
          >
            {sitemapRegenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {sitemapRegenerating ? 'Regenerating...' : 'Regenerate Sitemap'}
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-black text-white hover:bg-gray-800"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
          <TabsTrigger value="cms">Page Metadata</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="schema">Schema.org</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-700" />
                Global SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Site Title (60 chars max)</Label>
                <Input
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">{seoSettings.siteTitle.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Site Description (160 chars max)</Label>
                <Textarea
                  value={seoSettings.siteDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteDescription: e.target.value })}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">{seoSettings.siteDescription.length}/160 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Textarea
                  value={seoSettings.siteKeywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteKeywords: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={seoSettings.canonicalUrl}
                  onChange={(e) => setSeoSettings({ ...seoSettings, canonicalUrl: e.target.value })}
                  placeholder="https://ericrabar.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Robots.txt</Label>
                <Textarea
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings({ ...seoSettings, robotsTxt: e.target.value })}
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cms">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-700" />
                  Page Metadata
                </CardTitle>
                <Button 
                  onClick={handleAddPage}
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Page
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
              
              {/* Pages Table */}
              <div className="space-y-3">
                {paginatedPages.map((page) => (
                  <div key={page.id} className="p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900">{page.title}</h4>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">/{page.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs flex items-center gap-2 cursor-pointer">
                          <Switch 
                            checked={!page.noIndex}
                            onCheckedChange={(checked) => {
                              setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, noIndex: !checked } : p));
                            }}
                          />
                          <span className={page.noIndex ? 'text-red-600' : 'text-green-600'}>
                            {page.noIndex ? 'No Index' : 'Indexed'}
                          </span>
                        </Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPage(page)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePage(page.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Meta Title ({page.metaTitle.length}/60)</Label>
                        <Input 
                          value={page.metaTitle} 
                          className="text-sm border-gray-300"
                          maxLength={60}
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, metaTitle: e.target.value } : p))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Canonical URL</Label>
                        <Input 
                          value={page.canonical} 
                          className="text-sm border-gray-300"
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, canonical: e.target.value } : p))}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-xs text-gray-500 mb-1 block">Meta Description ({page.metaDescription.length}/160)</Label>
                      <Input 
                        value={page.metaDescription} 
                        className="text-sm border-gray-300"
                        maxLength={160}
                        onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, metaDescription: e.target.value } : p))}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">OG Image</Label>
                        <Input 
                          value={page.ogImage} 
                          className="text-sm border-gray-300"
                          placeholder="https://ericrabar.com/og-home.jpg"
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, ogImage: e.target.value } : p))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Priority</Label>
                        <select 
                          value={page.priority}
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, priority: parseFloat(e.target.value) } : p))}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="1.0">1.0</option>
                          <option value="0.9">0.9</option>
                          <option value="0.8">0.8</option>
                          <option value="0.7">0.7</option>
                          <option value="0.6">0.6</option>
                          <option value="0.5">0.5</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Change Freq</Label>
                        <select 
                          value={page.changeFreq}
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, changeFreq: e.target.value } : p))}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="always">Always</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPages.length)} of {filteredPages.length} pages
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add/Edit Page Modal */}
          {showAddPage && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>{editingPage?.id ? 'Edit Page' : 'Add New Page'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Page Title</Label>
                    <Input
                      value={editingPage?.title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Page Slug</Label>
                    <Input
                      value={editingPage?.slug || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      placeholder="/your-page"
                    />
                  </div>
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={editingPage?.metaTitle || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={editingPage?.metaDescription || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                      rows={3}
                      maxLength={160}
                    />
                  </div>
                  <div>
                    <Label>Canonical URL</Label>
                    <Input
                      value={editingPage?.canonical || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, canonical: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSavePage} className="flex-1">
                      Save Page
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddPage(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="social">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-700" />
                Social Media & Open Graph
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>OG Title</Label>
                <Input
                  value={seoSettings.ogTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, ogTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>OG Description</Label>
                <Textarea
                  value={seoSettings.ogDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, ogDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>OG Image URL (1200x630px recommended)</Label>
                <Input
                  value={seoSettings.ogImage}
                  onChange={(e) => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                  placeholder="https://ericrabar.com/og-image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>OG Type</Label>
                  <select
                    value={seoSettings.ogType}
                    onChange={(e) => setSeoSettings({ ...seoSettings, ogType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="video.other">Video</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>OG Locale</Label>
                  <Input
                    value={seoSettings.ogLocale}
                    onChange={(e) => setSeoSettings({ ...seoSettings, ogLocale: e.target.value })}
                    placeholder="en_US"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Twitter Card</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Card Type</Label>
                    <select
                      value={seoSettings.twitterCard}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterCard: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="summary_large_image">Large Image</option>
                      <option value="summary">Summary</option>
                      <option value="player">Player</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Site</Label>
                    <Input
                      value={seoSettings.twitterSite}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterSite: e.target.value })}
                      placeholder="@ericrabar"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-2">
                    <Label>Twitter Creator</Label>
                    <Input
                      value={seoSettings.twitterCreator}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterCreator: e.target.value })}
                      placeholder="@ericrabar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Image</Label>
                    <Input
                      value={seoSettings.twitterImage}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterImage: e.target.value })}
                      placeholder="https://ericrabar.com/twitter-image.jpg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-gray-700" />
                Sitemap Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={seoSettings.sitemapEnabled}
                  onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, sitemapEnabled: checked })}
                />
                <Label>Enable Dynamic Sitemap Generation</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Default Priority</Label>
                  <select
                    value={seoSettings.sitemapPriority}
                    onChange={(e) => setSeoSettings({ ...seoSettings, sitemapPriority: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="1.0">1.0 (Highest)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8</option>
                    <option value="0.7">0.7</option>
                    <option value="0.6">0.6</option>
                    <option value="0.5">0.5 (Default)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Change Frequency</Label>
                  <select
                    value={seoSettings.sitemapChangeFreq}
                    onChange={(e) => setSeoSettings({ ...seoSettings, sitemapChangeFreq: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Sitemap will be available at:</p>
                <code className="text-sm bg-white px-2 py-1 rounded">https://ericrabar.com/sitemap.xml</code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-700" />
                Schema.org Structured Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={seoSettings.enableSchema}
                  onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableSchema: checked })}
                />
                <Label>Enable JSON-LD Schema</Label>
              </div>
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={seoSettings.organizationName}
                  onChange={(e) => setSeoSettings({ ...seoSettings, organizationName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Organization Logo URL</Label>
                <Input
                  value={seoSettings.organizationLogo}
                  onChange={(e) => setSeoSettings({ ...seoSettings, organizationLogo: e.target.value })}
                  placeholder="https://ericrabar.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Organization URL</Label>
                <Input
                  value={seoSettings.organizationUrl}
                  onChange={(e) => setSeoSettings({ ...seoSettings, organizationUrl: e.target.value })}
                  placeholder="https://ericrabar.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Same As URLs (comma-separated)</Label>
                <Textarea
                  value={seoSettings.sameAs.join(', ')}
                  onChange={(e) => setSeoSettings({ ...seoSettings, sameAs: e.target.value.split(',').map(s => s.trim()) })}
                  rows={3}
                  placeholder="https://twitter.com/ericrabar, https://linkedin.com/company/ericrabar"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={seoSettings.enableAnalytics}
                  onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableAnalytics: checked })}
                />
                <Label>Enable Google Analytics</Label>
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID (GA4)</Label>
                <Input
                  value={seoSettings.googleAnalyticsId}
                  onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Switch 
                    checked={seoSettings.enableGTM}
                    onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableGTM: checked })}
                  />
                  <Label>Enable Google Tag Manager</Label>
                </div>
                <div className="space-y-2">
                  <Label>GTM Container ID</Label>
                  <Input
                    value={seoSettings.gtmId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, gtmId: e.target.value })}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Switch 
                    checked={seoSettings.enableFacebookPixel}
                    onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableFacebookPixel: checked })}
                  />
                  <Label>Enable Facebook Pixel</Label>
                </div>
                <div className="space-y-2">
                  <Label>Facebook Pixel ID</Label>
                  <Input
                    value={seoSettings.facebookPixelId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                    placeholder="XXXXXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

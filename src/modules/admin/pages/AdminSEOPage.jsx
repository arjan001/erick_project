import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Switch } from '@/shared/components/ui/switch';
import { Save, Globe, FileText, Image as ImageIcon, Map, Settings, Code, RefreshCw } from 'lucide-react';

export default function AdminSEOPage() {
  const [seoSettings, setSeoSettings] = useState({
    // Global Settings
    siteTitle: 'Studio22 - Premium Video Production Network',
    siteDescription: 'Connect with world-class creators, teams, and production studios for your next project. The curated marketplace for video production projects.',
    siteKeywords: 'video production, filmmakers, creators, studios, production teams, commercial, music video, short film, documentary, branded content, corporate video',
    canonicalUrl: 'https://studio22.com',
    
    // Sitemap Settings
    sitemapEnabled: true,
    sitemapPriority: 0.8,
    sitemapChangeFreq: 'weekly',
    
    // Robots.txt
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://studio22.com/sitemap.xml',
    
    // Open Graph
    ogTitle: 'Studio22 - Premium Video Production Network',
    ogDescription: 'Connect with world-class creators, teams, and production studios for your next project.',
    ogImage: 'https://studio22.com/og-image.jpg',
    ogType: 'website',
    ogLocale: 'en_US',
    
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterSite: '@studio22',
    twitterCreator: '@studio22',
    twitterImage: 'https://studio22.com/twitter-image.jpg',
    
    // JSON-LD Schema
    enableSchema: true,
    organizationName: 'Studio22',
    organizationLogo: 'https://studio22.com/logo.png',
    organizationUrl: 'https://studio22.com',
    sameAs: ['https://twitter.com/studio22', 'https://linkedin.com/company/studio22', 'https://instagram.com/studio22'],
    
    // Advanced
    enableAnalytics: true,
    googleAnalyticsId: '',
    enableGTM: false,
    gtmId: '',
    enableFacebookPixel: false,
    facebookPixelId: '',
  });

  const [cmsPages, setCmsPages] = useState([
    { id: 1, title: 'Home', slug: '/', metaTitle: 'Studio22 - Premium Video Production Network', metaDescription: 'Connect with world-class creators, teams, and production studios for your next video project.', canonical: 'https://studio22.com/', ogImage: '', noIndex: false, priority: 1.0, changeFreq: 'daily' },
    { id: 2, title: 'Projects', slug: '/Projects', metaTitle: 'Browse Video Production Projects | Studio22', metaDescription: 'Discover and apply to video production projects from brands and creators worldwide.', canonical: 'https://studio22.com/Projects', ogImage: '', noIndex: false, priority: 0.9, changeFreq: 'daily' },
    { id: 3, title: 'Creators', slug: '/ApplyArtist', metaTitle: 'Join as Creator | Studio22', metaDescription: 'Create your profile and apply to video production projects on Studio22.', canonical: 'https://studio22.com/ApplyArtist', ogImage: '', noIndex: false, priority: 0.8, changeFreq: 'weekly' },
    { id: 4, title: 'Teams', slug: '/ApplyTeam', metaTitle: 'Join as Production Team | Studio22', metaDescription: 'Register your production team and connect with clients seeking video production services.', canonical: 'https://studio22.com/ApplyTeam', ogImage: '', noIndex: false, priority: 0.8, changeFreq: 'weekly' },
    { id: 5, title: 'Services', slug: '/Services', metaTitle: 'Our Services | Studio22', metaDescription: 'Learn about Studio22 services for video production, creator matching, and project management.', canonical: 'https://studio22.com/Services', ogImage: '', noIndex: false, priority: 0.7, changeFreq: 'monthly' },
    { id: 6, title: 'Backed Projects', slug: '/BackedProjects', metaTitle: 'Backed Projects | Studio22', metaDescription: 'Explore film and video projects seeking funding and co-production partnerships.', canonical: 'https://studio22.com/BackedProjects', ogImage: '', noIndex: false, priority: 0.8, changeFreq: 'daily' },
  ]);

  const handleSave = () => {
    console.log('Saving SEO settings:', seoSettings);
    console.log('Saving CMS pages:', cmsPages);
    // TODO: Integrate with backend API
  };

  const handleRegenerateSitemap = () => {
    console.log('Regenerating sitemap...');
    // TODO: Call sitemap regeneration API
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO & Metadata Management</h1>
          <p className="text-gray-600">Comprehensive SEO settings, sitemap generation, and social media optimization</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRegenerateSitemap} variant="outline" className="border-gray-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Sitemap
          </Button>
          <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="https://studio22.com"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Page Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmsPages.map((page) => (
                  <div key={page.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{page.title}</h4>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs flex items-center gap-1">
                          <Switch 
                            checked={!page.noIndex}
                            onCheckedChange={(checked) => {
                              setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, noIndex: !checked } : p));
                            }}
                          />
                          Index
                        </Label>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">/{page.slug}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Meta Title (60 chars)</Label>
                        <Input 
                          value={page.metaTitle} 
                          className="text-sm"
                          maxLength={60}
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, metaTitle: e.target.value } : p))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Canonical URL</Label>
                        <Input 
                          value={page.canonical} 
                          className="text-sm"
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, canonical: e.target.value } : p))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Meta Description (160 chars)</Label>
                      <Input 
                        value={page.metaDescription} 
                        className="text-sm"
                        maxLength={160}
                        onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, metaDescription: e.target.value } : p))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">OG Image URL</Label>
                        <Input 
                          value={page.ogImage} 
                          className="text-sm"
                          placeholder="https://studio22.com/og-home.jpg"
                          onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, ogImage: e.target.value } : p))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Priority</Label>
                          <select 
                            value={page.priority}
                            onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, priority: parseFloat(e.target.value) } : p))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
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
                          <Label className="text-xs">Change Freq</Label>
                          <select 
                            value={page.changeFreq}
                            onChange={(e) => setCmsPages(cmsPages.map(p => p.id === page.id ? { ...p, changeFreq: e.target.value } : p))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Social Media & Open Graph
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="https://studio22.com/og-image.jpg"
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
                      placeholder="@studio22"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-2">
                    <Label>Twitter Creator</Label>
                    <Input
                      value={seoSettings.twitterCreator}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterCreator: e.target.value })}
                      placeholder="@studio22"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Image</Label>
                    <Input
                      value={seoSettings.twitterImage}
                      onChange={(e) => setSeoSettings({ ...seoSettings, twitterImage: e.target.value })}
                      placeholder="https://studio22.com/twitter-image.jpg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Sitemap Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <code className="text-sm bg-white px-2 py-1 rounded">https://studio22.com/sitemap.xml</code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Schema.org Structured Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="https://studio22.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Organization URL</Label>
                <Input
                  value={seoSettings.organizationUrl}
                  onChange={(e) => setSeoSettings({ ...seoSettings, organizationUrl: e.target.value })}
                  placeholder="https://studio22.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Same As URLs (comma-separated)</Label>
                <Textarea
                  value={seoSettings.sameAs.join(', ')}
                  onChange={(e) => setSeoSettings({ ...seoSettings, sameAs: e.target.value.split(',').map(s => s.trim()) })}
                  rows={3}
                  placeholder="https://twitter.com/studio22, https://linkedin.com/company/studio22"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Save, Globe, FileText, Image as ImageIcon } from 'lucide-react';

export default function AdminSEOPage() {
  const [seoSettings, setSeoSettings] = useState({
    siteTitle: 'Studio22 - Premium Video Production Network',
    siteDescription: 'Connect with world-class creators, teams, and production studios for your next project.',
    siteKeywords: 'video production, filmmakers, creators, studios, projects',
    ogImage: '',
    twitterHandle: '@studio22',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true
  });

  const [cmsPages, setCmsPages] = useState([
    { id: 1, title: 'Home', slug: '/', metaTitle: 'Studio22 - Premium Video Production Network', metaDescription: 'Connect with world-class creators' },
    { id: 2, title: 'About', slug: '/about', metaTitle: 'About Studio22', metaDescription: 'Learn about our mission and vision' },
    { id: 3, title: 'Services', slug: '/services', metaTitle: 'Our Services', metaDescription: 'Video production services' },
  ]);

  const handleSave = () => {
    console.log('Saving SEO settings:', seoSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO & CMS</h1>
          <p className="text-gray-600">Manage SEO settings and website content</p>
        </div>
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="cms">CMS Pages</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Title</Label>
                <Input
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Site Description</Label>
                <Textarea
                  value={seoSettings.siteDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={seoSettings.siteKeywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteKeywords: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Robots.txt</Label>
                <Textarea
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings({ ...seoSettings, robotsTxt: e.target.value })}
                  rows={5}
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
                CMS Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmsPages.map((page) => (
                  <div key={page.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{page.title}</h4>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">/{page.slug}</p>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Meta Title</Label>
                        <Input value={page.metaTitle} className="text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Meta Description</Label>
                        <Input value={page.metaDescription} className="text-sm" />
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
                <Label>OG Image URL</Label>
                <Input
                  value={seoSettings.ogImage}
                  onChange={(e) => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                  placeholder="https://studio22.com/og-image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter Handle</Label>
                <Input
                  value={seoSettings.twitterHandle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })}
                  placeholder="@studio22"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

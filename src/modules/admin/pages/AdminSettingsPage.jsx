import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Save, Globe, Mail, Bell, Shield, Users, CreditCard, Store, Settings as SettingsIcon, Layout, FileText, Link as LinkIcon, ScrollText, Grid3x3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { SystemSetting } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminSettingsPage() {
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'Studio22',
    siteUrl: 'https://studio22.com',
    contactEmail: 'contact@studio22.com',
    supportEmail: 'support@studio22.com',
    maintenanceMode: false,
    enableRegistration: true,
    requireEmailVerification: true,
    notificationEmail: true,
    notificationPush: false,
    maxUploadSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,mp4,pdf',
    sessionTimeout: '30',
    twoFactorAuth: false,
    passwordMinLength: '8',
    enableMarquee: true,
    marqueeSpeed: '40',
    enableCategories: true,
    featuredCategories: '',
    defaultCurrency: 'EUR',
    taxRate: '21',
    enableSubscriptions: true,
    enableMarketplace: true,
    enableReferrals: true,
    referralBonus: '10'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const settingsData = await SystemSetting.filter({}, 'key', 100);
      if (settingsData && settingsData.length > 0) {
        const settingsMap = {};
        settingsData.forEach(setting => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings(prev => ({
          ...prev,
          ...settingsMap,
          maintenanceMode: settingsMap.maintenanceMode === 'true',
          enableRegistration: settingsMap.enableRegistration === 'true',
          requireEmailVerification: settingsMap.requireEmailVerification === 'true',
          notificationEmail: settingsMap.notificationEmail === 'true',
          notificationPush: settingsMap.notificationPush === 'true',
          twoFactorAuth: settingsMap.twoFactorAuth === 'true',
          enableMarquee: settingsMap.enableMarquee === 'true',
          enableCategories: settingsMap.enableCategories === 'true',
          enableSubscriptions: settingsMap.enableSubscriptions === 'true',
          enableMarketplace: settingsMap.enableMarketplace === 'true',
          enableReferrals: settingsMap.enableReferrals === 'true'
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value
      }));

      for (const setting of settingsToSave) {
        const existing = await SystemSetting.filter({ key: setting.key });
        if (existing && existing.length > 0) {
          await SystemSetting.update(existing[0].id, { value: setting.value });
        } else {
          await SystemSetting.create({ key: setting.key, value: setting.value });
        }
      }

      success('Settings Saved', 'Your settings have been updated successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toastError('Save Failed', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const quickLinks = [
    { icon: ScrollText, label: 'Marquee/Ticker', href: 'AdminTicker' },
    { icon: Grid3x3, label: 'Categories', href: 'AdminCategories' },
    { icon: Users, label: 'Users', href: 'AdminUsers' },
    { icon: CreditCard, label: 'Subscriptions', href: 'AdminSubscriptionSettings' },
    { icon: Store, label: 'Shop', href: 'AdminShopSettings' },
    { icon: SettingsIcon, label: 'General', href: 'AdminGeneralSettings' },
    { icon: FileText, label: 'Articles', href: 'AdminArticles' },
    { icon: LinkIcon, label: 'API', href: 'AdminAPISettings' },
  ];

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Configure all aspects of your Studio22 platform</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gray-900 text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} to={createPageUrl(link.href)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <link.icon className="w-6 h-6 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Disable site for maintenance</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Layout & Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Marquee/Ticker</Label>
                    <p className="text-sm text-gray-600">Show scrolling announcements</p>
                  </div>
                  <Switch
                    checked={settings.enableMarquee}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableMarquee: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marquee Speed (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.marqueeSpeed}
                    onChange={(e) => setSettings({ ...settings, marqueeSpeed: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Categories</Label>
                    <p className="text-sm text-gray-600">Show categories on landing page</p>
                  </div>
                  <Switch
                    checked={settings.enableCategories}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableCategories: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Featured Category IDs (comma-separated)</Label>
                  <Input
                    value={settings.featuredCategories}
                    onChange={(e) => setSettings({ ...settings, featuredCategories: e.target.value })}
                    placeholder="id1,id2,id3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Manage content sections:</p>
                  <div className="space-y-2">
                    <Link to={createPageUrl('AdminTicker')} className="block p-2 bg-white rounded hover:bg-gray-100 text-sm">
                      → Marquee/Ticker Entries
                    </Link>
                    <Link to={createPageUrl('AdminCategories')} className="block p-2 bg-white rounded hover:bg-gray-100 text-sm">
                      → Categories
                    </Link>
                    <Link to={createPageUrl('AdminArticles')} className="block p-2 bg-white rounded hover:bg-gray-100 text-sm">
                      → Articles & News
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Referrals</Label>
                    <p className="text-sm text-gray-600">Allow users to refer others</p>
                  </div>
                  <Switch
                    checked={settings.enableReferrals}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableReferrals: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referral Bonus (%)</Label>
                  <Input
                    type="number"
                    value={settings.referralBonus}
                    onChange={(e) => setSettings({ ...settings, referralBonus: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Registration</Label>
                  <p className="text-sm text-gray-600">Allow new user registrations</p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-gray-600">Users must verify email</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Enable 2FA for all users</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Password Length</Label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Subscriptions</Label>
                    <p className="text-sm text-gray-600">Allow subscription plans</p>
                  </div>
                  <Switch
                    checked={settings.enableSubscriptions}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableSubscriptions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Marketplace</Label>
                    <p className="text-sm text-gray-600">Allow marketplace features</p>
                  </div>
                  <Switch
                    checked={settings.enableMarketplace}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableMarketplace: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send email notifications</p>
                </div>
                <Switch
                  checked={settings.notificationEmail}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationEmail: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Send push notifications</p>
                </div>
                <Switch
                  checked={settings.notificationPush}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationPush: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>Upload Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Max Upload Size (MB)</Label>
                <Input
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <Input
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                  placeholder="jpg,jpeg,png,mp4,pdf"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

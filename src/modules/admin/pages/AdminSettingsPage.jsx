import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Save, Globe, Mail, Bell, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
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
    passwordMinLength: '8'
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Implement save logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
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

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Save, Globe, Mail, Bell, Shield, Users, CreditCard, Store, Settings as SettingsIcon, Layout, FileText, Link as LinkIcon, ScrollText, Grid3x3, CheckCircle, AlertTriangle, Info, Zap, Lock, Palette, Smartphone, Database, Globe2, Gavel } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SystemSetting } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast.jsx'
import { clearSettingsCache } from '@/lib/settings'

export default function AdminSettingsPage() {
  const { success, error: toastError } = useToast()
  const [settings, setSettings] = useState({
    siteName: 'Eric Rabar',
    siteUrl: 'https://ericrabar.com',
    contactEmail: 'contact@ericrabar.com',
    supportEmail: 'support@ericrabar.com',
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
    enableCrewPortal: false,
    defaultCurrency: 'EUR',
    taxRate: '21',
    enableSubscriptions: true,
    enableMarketplace: true,
    enableReferrals: true,
    referralBonus: '10',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    enableDarkMode: false,
    enableMobileApp: false,
    apiRateLimit: '1000',
    enableCache: true,
    cacheTimeout: '3600'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const loadSettings = async () => {
    try {
      const settingsData = await SystemSetting.filter({}, 'setting_key', 100)
      if (settingsData && settingsData.length > 0) {
        const settingsMap = {}
        settingsData.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value
        })
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
          enableCrewPortal: settingsMap.enableCrewPortal === 'true',
          enableSubscriptions: settingsMap.enableSubscriptions === 'true',
          enableMarketplace: settingsMap.enableMarketplace === 'true',
          enableReferrals: settingsMap.enableReferrals === 'true',
          enableDarkMode: settingsMap.enableDarkMode === 'true',
          enableMobileApp: settingsMap.enableMobileApp === 'true',
          enableCache: settingsMap.enableCache === 'true'
        }))
      }
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'boolean' ? value.toString() : value
      }))

      for (const setting of settingsToSave) {
        const existing = await SystemSetting.filter({ setting_key: setting.setting_key })
        if (existing && existing.length > 0) {
          await SystemSetting.update(existing[0].id, { setting_value: setting.setting_value })
        } else {
          await SystemSetting.create({ setting_key: setting.setting_key, setting_value: setting.setting_value })
        }
      }

      // Clear settings cache so changes take effect immediately
      clearSettingsCache()

      success('Settings Saved', 'Your settings have been updated successfully')
    } catch (err) {
      
      toastError('Save Failed', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const quickLinks = [
    { icon: ScrollText, label: 'Marquee/Ticker', href: '/Admin/Ticker', color: 'bg-gray-50 text-gray-600' },
    { icon: Grid3x3, label: 'Categories', href: '/Admin/Categories', color: 'bg-gray-50 text-gray-600' },
    { icon: Users, label: 'Users', href: '/Admin/UserManagement', color: 'bg-gray-50 text-gray-600' },
    { icon: CreditCard, label: 'Subscriptions', href: '/Admin/FinanceDashboard', color: 'bg-gray-50 text-gray-600' },
    { icon: Store, label: 'Shop', href: '/Admin/ShopSettings', color: 'bg-gray-50 text-gray-600' },
    { icon: SettingsIcon, label: 'General', href: '/Admin/GeneralSettings', color: 'bg-gray-50 text-gray-600' },
    { icon: FileText, label: 'SEO & CMS', href: '/Admin/SEOCMS', color: 'bg-gray-50 text-gray-600' },
    { icon: LinkIcon, label: 'API', href: '/Admin/APISettings', color: 'bg-gray-50 text-gray-600' },
    { icon: FileText, label: 'Popups', href: '/Admin/Popups', color: 'bg-gray-50 text-gray-600' },
    { icon: Users, label: 'Featured Creatives', href: '/Admin/FeaturedCreatives', color: 'bg-gray-50 text-gray-600' },
    { icon: Building2, label: 'Featured Brands', href: '/Admin/FeaturedBrands', color: 'bg-gray-50 text-gray-600' },
    { icon: Gavel, label: 'Shop Auctions', href: '/Admin/ShopAuctions', color: 'bg-gray-50 text-gray-600' },
  ]

  const SettingCard = ({ icon: Icon, title, description, children, warning }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${warning ? 'bg-amber-50' : 'bg-gray-100'}`}>
            <Icon className={`w-6 h-6 ${warning ? 'text-amber-600' : 'text-gray-600'}`} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )

  const ToggleSetting = ({ label, description, checked, onChange, warning }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${warning ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
      <div>
        <Label className="font-medium text-gray-900">{label}</Label>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Settings
              </h1>
              <p className="text-gray-600 mt-1">Configure all aspects of your Eric Rabar platform</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className={`hover:shadow-lg transition-all cursor-pointer border-0 ${link.color}`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <link.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <TabsTrigger value="general" className="rounded-lg">
              <Globe2 className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg">
              <Database className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SettingCard icon={Globe} title="Site Configuration" description="Basic site information">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Site URL</Label>
                    <Input
                      value={settings.siteUrl}
                      onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard icon={Layout} title="Layout & Display" description="Customize site appearance">
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Marquee/Ticker"
                    description="Show scrolling announcements"
                    checked={settings.enableMarquee}
                    onChange={(checked) => setSettings({ ...settings, enableMarquee: checked })}
                  />
                  <div className="space-y-2">
                    <Label>Marquee Speed (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.marqueeSpeed}
                      onChange={(e) => setSettings({ ...settings, marqueeSpeed: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <ToggleSetting
                    label="Enable Categories"
                    description="Show categories on landing page"
                    checked={settings.enableCategories}
                    onChange={(checked) => setSettings({ ...settings, enableCategories: checked })}
                  />
                  <ToggleSetting
                    label="Enable Crew Portal"
                    description="Open crew profiles and registration (launch with actors first)"
                    checked={settings.enableCrewPortal}
                    onChange={(checked) => setSettings({ ...settings, enableCrewPortal: checked })}
                  />
                  <div className="space-y-2">
                    <Label>Featured Category IDs (comma-separated)</Label>
                    <Input
                      value={settings.featuredCategories}
                      onChange={(e) => setSettings({ ...settings, featuredCategories: e.target.value })}
                      placeholder="id1,id2,id3"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>
            </div>

            <SettingCard
              icon={AlertTriangle}
              title="Maintenance Mode"
              description="Control site availability"
              warning
            >
              <ToggleSetting
                label="Enable Maintenance Mode"
                description="Disable site for maintenance - users will see a maintenance page"
                checked={settings.maintenanceMode}
                onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                warning
              />
            </SettingCard>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SettingCard icon={Palette} title="Brand Colors" description="Customize your brand colors">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-16 h-10 rounded-xl p-1"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-16 h-10 rounded-xl p-1"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="flex-1 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </SettingCard>

              <SettingCard icon={Smartphone} title="Mobile & Display" description="Mobile and display settings">
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Dark Mode"
                    description="Allow users to switch to dark theme"
                    checked={settings.enableDarkMode}
                    onChange={(checked) => setSettings({ ...settings, enableDarkMode: checked })}
                  />
                  <ToggleSetting
                    label="Enable Mobile App"
                    description="Enable mobile app features"
                    checked={settings.enableMobileApp}
                    onChange={(checked) => setSettings({ ...settings, enableMobileApp: checked })}
                  />
                </div>
              </SettingCard>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SettingCard icon={Shield} title="Authentication" description="User authentication settings">
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Registration"
                    description="Allow new user registrations"
                    checked={settings.enableRegistration}
                    onChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                  />
                  <ToggleSetting
                    label="Require Email Verification"
                    description="Users must verify email before accessing"
                    checked={settings.requireEmailVerification}
                    onChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                  />
                  <ToggleSetting
                    label="Two-Factor Authentication"
                    description="Enable 2FA for all users"
                    checked={settings.twoFactorAuth}
                    onChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>
              </SettingCard>

              <SettingCard icon={Lock} title="Password & Session" description="Security policies">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SettingCard icon={CreditCard} title="Payment Configuration" description="Payment settings">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select
                      value={settings.defaultCurrency}
                      onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard icon={Store} title="Feature Toggles" description="Enable/disable payment features">
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Subscriptions"
                    description="Allow subscription plans"
                    checked={settings.enableSubscriptions}
                    onChange={(checked) => setSettings({ ...settings, enableSubscriptions: checked })}
                  />
                  <ToggleSetting
                    label="Enable Marketplace"
                    description="Allow marketplace features"
                    checked={settings.enableMarketplace}
                    onChange={(checked) => setSettings({ ...settings, enableMarketplace: checked })}
                  />
                  <ToggleSetting
                    label="Enable Referrals"
                    description="Allow users to refer others"
                    checked={settings.enableReferrals}
                    onChange={(checked) => setSettings({ ...settings, enableReferrals: checked })}
                  />
                  <div className="space-y-2">
                    <Label>Referral Bonus (%)</Label>
                    <Input
                      type="number"
                      value={settings.referralBonus}
                      onChange={(e) => setSettings({ ...settings, referralBonus: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <SettingCard icon={Bell} title="Notification Settings" description="Configure notification preferences">
              <div className="space-y-4">
                <ToggleSetting
                  label="Email Notifications"
                  description="Send email notifications to users"
                  checked={settings.notificationEmail}
                  onChange={(checked) => setSettings({ ...settings, notificationEmail: checked })}
                />
                <ToggleSetting
                  label="Push Notifications"
                  description="Send push notifications to users"
                  checked={settings.notificationPush}
                  onChange={(checked) => setSettings({ ...settings, notificationPush: checked })}
                />
              </div>
            </SettingCard>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SettingCard icon={Database} title="Upload Settings" description="File upload configuration">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Max Upload Size (MB)</Label>
                    <Input
                      type="number"
                      value={settings.maxUploadSize}
                      onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed File Types</Label>
                    <Input
                      value={settings.allowedFileTypes}
                      onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                      placeholder="jpg,jpeg,png,mp4,pdf"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard icon={Zap} title="Performance" description="System performance settings">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Rate Limit (requests/min)</Label>
                    <Input
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => setSettings({ ...settings, apiRateLimit: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <ToggleSetting
                    label="Enable Caching"
                    description="Enable system caching for better performance"
                    checked={settings.enableCache}
                    onChange={(checked) => setSettings({ ...settings, enableCache: checked })}
                  />
                  <div className="space-y-2">
                    <Label>Cache Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.cacheTimeout}
                      onChange={(e) => setSettings({ ...settings, cacheTimeout: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </SettingCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


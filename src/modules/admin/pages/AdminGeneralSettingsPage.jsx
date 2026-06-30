import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Settings, Save, Globe, Mail, Bell, Shield, Clock, Users, Database, ToggleLeft, ToggleRight, CreditCard, Layers } from 'lucide-react';

export default function AdminGeneralSettingsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Site Settings
    siteName: 'Studio22',
    siteDescription: 'Premium Video Production Network',
    siteUrl: 'https://studio22.com',
    contactEmail: 'contact@studio22.com',
    supportEmail: 'support@studio22.com',
    
    // User Settings
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'artist',
    maxPortfolioClips: 20,
    maxTeamMembers: 50,
    
    // Content Settings
    autoModerateContent: true,
    requireApprovalForProjects: false,
    allowGuestViewing: true,
    maxFileSize: 50, // MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf'],
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    notificationRetentionDays: 90,
    
    // Security Settings
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    twoFactorAuth: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    
    // Rate Limiting
    apiRateLimit: 100, // requests per minute
    uploadRateLimit: 10, // uploads per hour
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'Site is under maintenance. Please check back soon.',
    
    // Analytics
    enableAnalytics: true,
    analyticsRetentionDays: 365
  });

  const [subscriptionSettings, setSubscriptionSettings] = useState({
    enableSubscriptions: true,
    freeTrialDays: 14,
    plans: [
      {
        id: 'basic',
        name: 'Basic',
        price: 0,
        features: ['5 portfolio clips', 'Basic profile', 'Limited job applications'],
        maxPortfolioClips: 5,
        maxJobApplications: 10
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29,
        features: ['20 portfolio clips', 'Featured profile', 'Unlimited job applications', 'Priority support'],
        maxPortfolioClips: 20,
        maxJobApplications: -1
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        features: ['Unlimited portfolio clips', 'Verified badge', 'Team management', 'API access', 'Dedicated support'],
        maxPortfolioClips: -1,
        maxJobApplications: -1
      }
    ],
    currency: 'USD',
    billingCycle: 'monthly',
    prorateUpgrades: true,
    autoRenew: true,
    gracePeriodDays: 7
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        // In a real app, fetch from AdminSettings entity
        // For now, use defaults
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        error('Error', 'Failed to fetch settings');
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, save to AdminSettings entity
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      success('Saved', 'Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      error('Failed', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl space-y-6">
            {/* Site Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Site Settings
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => handleChange('siteUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* User Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Allow Registration</div>
                    <div className="text-sm text-gray-500">Allow new users to register</div>
                  </div>
                  <button
                    onClick={() => handleToggle('allowRegistration')}
                    className="p-2"
                  >
                    {settings.allowRegistration ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Require Email Verification</div>
                    <div className="text-sm text-gray-500">Users must verify email before access</div>
                  </div>
                  <button
                    onClick={() => handleToggle('requireEmailVerification')}
                    className="p-2"
                  >
                    {settings.requireEmailVerification ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default User Role</label>
                  <select
                    value={settings.defaultUserRole}
                    onChange={(e) => handleChange('defaultUserRole', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="artist">Artist</option>
                    <option value="client">Client</option>
                    <option value="team">Team</option>
                    <option value="backer">Backer</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Portfolio Clips</label>
                    <input
                      type="number"
                      value={settings.maxPortfolioClips}
                      onChange={(e) => handleChange('maxPortfolioClips', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Members</label>
                    <input
                      type="number"
                      value={settings.maxTeamMembers}
                      onChange={(e) => handleChange('maxTeamMembers', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Content Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Auto-Moderate Content</div>
                    <div className="text-sm text-gray-500">Automatically moderate uploaded content</div>
                  </div>
                  <button
                    onClick={() => handleToggle('autoModerateContent')}
                    className="p-2"
                  >
                    {settings.autoModerateContent ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Require Project Approval</div>
                    <div className="text-sm text-gray-500">Projects need admin approval before publishing</div>
                  </div>
                  <button
                    onClick={() => handleToggle('requireApprovalForProjects')}
                    className="p-2"
                  >
                    {settings.requireApprovalForProjects ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Allow Guest Viewing</div>
                    <div className="text-sm text-gray-500">Non-logged-in users can view content</div>
                  </div>
                  <button
                    onClick={() => handleToggle('allowGuestViewing')}
                    className="p-2"
                  >
                    {settings.allowGuestViewing ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowed File Types</label>
                    <input
                      type="text"
                      value={settings.allowedFileTypes.join(', ')}
                      onChange={(e) => handleChange('allowedFileTypes', e.target.value.split(', '))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-500">Send email notifications to users</div>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNotifications')}
                    className="p-2"
                  >
                    {settings.emailNotifications ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-500">Send push notifications</div>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications')}
                    className="p-2"
                  >
                    {settings.pushNotifications ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Retention (Days)</label>
                  <input
                    type="number"
                    value={settings.notificationRetentionDays}
                    onChange={(e) => handleChange('notificationRetentionDays', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Settings
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (min)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (min)</label>
                    <input
                      type="number"
                      value={settings.lockoutDuration}
                      onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-500">Require 2FA for all users</div>
                  </div>
                  <button
                    onClick={() => handleToggle('twoFactorAuth')}
                    className="p-2"
                  >
                    {settings.twoFactorAuth ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Password Length</label>
                    <input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Require Special Chars</div>
                    </div>
                    <button
                      onClick={() => handleToggle('passwordRequireSpecial')}
                      className="p-2"
                    >
                      {settings.passwordRequireSpecial ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Require Numbers</div>
                    </div>
                    <button
                      onClick={() => handleToggle('passwordRequireNumber')}
                      className="p-2"
                    >
                      {settings.passwordRequireNumber ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Rate Limiting
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Rate Limit (req/min)</label>
                  <input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Rate Limit (uploads/hour)</label>
                  <input
                    type="number"
                    value={settings.uploadRateLimit}
                    onChange={(e) => handleChange('uploadRateLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Maintenance Mode
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Maintenance Mode</div>
                    <div className="text-sm text-gray-500">Put site in maintenance mode</div>
                  </div>
                  <button
                    onClick={() => handleToggle('maintenanceMode')}
                    className="p-2"
                  >
                    {settings.maintenanceMode ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
                  <textarea
                    value={settings.maintenanceMessage}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Analytics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Analytics</div>
                    <div className="text-sm text-gray-500">Track user analytics</div>
                  </div>
                  <button
                    onClick={() => handleToggle('enableAnalytics')}
                    className="p-2"
                  >
                    {settings.enableAnalytics ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Analytics Retention (Days)</label>
                  <input
                    type="number"
                    value={settings.analyticsRetentionDays}
                    onChange={(e) => handleChange('analyticsRetentionDays', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Subscription Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Subscription Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Subscriptions</div>
                    <div className="text-sm text-gray-500">Allow users to subscribe to plans</div>
                  </div>
                  <button
                    onClick={() => setSubscriptionSettings({ ...subscriptionSettings, enableSubscriptions: !subscriptionSettings.enableSubscriptions })}
                    className="p-2"
                  >
                    {subscriptionSettings.enableSubscriptions ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {subscriptionSettings.enableSubscriptions && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Free Trial Days</label>
                        <input
                          type="number"
                          value={subscriptionSettings.freeTrialDays}
                          onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, freeTrialDays: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={subscriptionSettings.currency}
                          onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, currency: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                        <select
                          value={subscriptionSettings.billingCycle}
                          onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, billingCycle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Prorate Upgrades</div>
                        <div className="text-sm text-gray-500">Credit unused time on plan upgrades</div>
                      </div>
                      <button
                        onClick={() => setSubscriptionSettings({ ...subscriptionSettings, prorateUpgrades: !subscriptionSettings.prorateUpgrades })}
                        className="p-2"
                      >
                        {subscriptionSettings.prorateUpgrades ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Auto Renew</div>
                        <div className="text-sm text-gray-500">Auto-renew subscriptions by default</div>
                      </div>
                      <button
                        onClick={() => setSubscriptionSettings({ ...subscriptionSettings, autoRenew: !subscriptionSettings.autoRenew })}
                        className="p-2"
                      >
                        {subscriptionSettings.autoRenew ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
                      <input
                        type="number"
                        value={subscriptionSettings.gracePeriodDays}
                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, gracePeriodDays: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="font-medium text-gray-900 mb-3">Subscription Plans</h3>
                      <div className="space-y-3">
                        {subscriptionSettings.plans.map((plan, index) => (
                          <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                                <input
                                  type="text"
                                  value={plan.name}
                                  onChange={(e) => {
                                    const newPlans = [...subscriptionSettings.plans];
                                    newPlans[index].name = e.target.value;
                                    setSubscriptionSettings({ ...subscriptionSettings, plans: newPlans });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                  type="number"
                                  value={plan.price}
                                  onChange={(e) => {
                                    const newPlans = [...subscriptionSettings.plans];
                                    newPlans[index].price = parseFloat(e.target.value);
                                    setSubscriptionSettings({ ...subscriptionSettings, plans: newPlans });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Portfolio Clips</label>
                                <input
                                  type="text"
                                  value={plan.maxPortfolioClips === -1 ? 'Unlimited' : plan.maxPortfolioClips}
                                  onChange={(e) => {
                                    const newPlans = [...subscriptionSettings.plans];
                                    newPlans[index].maxPortfolioClips = e.target.value === 'Unlimited' ? -1 : parseInt(e.target.value);
                                    setSubscriptionSettings({ ...subscriptionSettings, plans: newPlans });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                              <input
                                type="text"
                                value={plan.features.join(', ')}
                                onChange={(e) => {
                                  const newPlans = [...subscriptionSettings.plans];
                                  newPlans[index].features = e.target.value.split(', ').map(f => f.trim());
                                  setSubscriptionSettings({ ...subscriptionSettings, plans: newPlans });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-black text-white hover:bg-gray-800 px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

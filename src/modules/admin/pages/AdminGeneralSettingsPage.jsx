import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Settings, Save, Globe, Bell, Shield, Clock, Users, Database, ToggleLeft, ToggleRight, Layers, ArrowRight } from 'lucide-react';

const DEFAULT_SETTINGS = {
  site_name: 'Studio22',
  site_description: 'Premium video production network',
  site_url: 'https://studio22.com',
  contact_email: 'contact@studio22.com',
  support_email: 'support@studio22.com',
  allow_registration: true,
  require_email_verification: true,
  default_user_role: 'artist',
  max_portfolio_clips: 20,
  max_team_members: 50,
  auto_moderate_content: true,
  require_approval_for_projects: false,
  allow_guest_viewing: true,
  max_file_size_mb: 50,
  allowed_file_types: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf'],
  email_notifications: true,
  push_notifications: true,
  notification_retention_days: 90,
  session_timeout_minutes: 30,
  max_login_attempts: 5,
  lockout_duration_minutes: 15,
  two_factor_auth: false,
  password_min_length: 8,
  password_require_special: true,
  password_require_number: true,
  api_rate_limit: 100,
  upload_rate_limit: 10,
  maintenance_mode: false,
  maintenance_message: 'Site is under maintenance. Please check back soon.',
  enable_analytics: true,
  analytics_retention_days: 365,
  enable_subscriptions: true,
  free_trial_days: 14,
  subscription_currency: 'USD',
  subscription_billing_cycle: 'monthly',
  subscription_grace_period_days: 7,
  subscription_prorate_upgrades: true,
  subscription_auto_renew: true,
};

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="font-medium text-gray-900">{label}</div>
      {description && <div className="text-sm text-gray-500">{description}</div>}
    </div>
    <button onClick={onChange} className="p-2">
      {checked ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
    </button>
  </div>
);

export default function AdminGeneralSettingsPage() {
  const { success, error } = useToast();
  const [settingsId, setSettingsId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const rows = await base44.entities.SystemSetting.list();
        if (rows && rows.length > 0) {
          setSettingsId(rows[0].id);
          setSettings({ ...DEFAULT_SETTINGS, ...rows[0] });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        error('Error', 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        await base44.entities.SystemSetting.update(settingsId, settings);
      } else {
        const created = await base44.entities.SystemSetting.create(settings);
        setSettingsId(created.id);
      }
      success('Saved', 'Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      error('Failed', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Globe className="w-5 h-5 mr-2" />Site Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input type="text" value={settings.site_name} onChange={(e) => handleChange('site_name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <input type="url" value={settings.site_url} onChange={(e) => handleChange('site_url', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea value={settings.site_description} onChange={(e) => handleChange('site_description', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={settings.contact_email} onChange={(e) => handleChange('contact_email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" value={settings.support_email} onChange={(e) => handleChange('support_email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Users className="w-5 h-5 mr-2" />User Settings</h2>
          <div className="space-y-4">
            <ToggleRow label="Allow Registration" description="Allow new users to register" checked={settings.allow_registration} onChange={() => handleToggle('allow_registration')} />
            <ToggleRow label="Require Email Verification" description="Users must verify email before access" checked={settings.require_email_verification} onChange={() => handleToggle('require_email_verification')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default User Role</label>
              <select value={settings.default_user_role} onChange={(e) => handleChange('default_user_role', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                <option value="artist">Artist</option>
                <option value="client">Client</option>
                <option value="team">Team</option>
                <option value="backer">Backer</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Portfolio Clips</label>
                <input type="number" value={settings.max_portfolio_clips} onChange={(e) => handleChange('max_portfolio_clips', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Members</label>
                <input type="number" value={settings.max_team_members} onChange={(e) => handleChange('max_team_members', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Database className="w-5 h-5 mr-2" />Content Settings</h2>
          <div className="space-y-4">
            <ToggleRow label="Auto-Moderate Content" description="Automatically moderate uploaded content" checked={settings.auto_moderate_content} onChange={() => handleToggle('auto_moderate_content')} />
            <ToggleRow label="Require Project Approval" description="Projects need admin approval before publishing" checked={settings.require_approval_for_projects} onChange={() => handleToggle('require_approval_for_projects')} />
            <ToggleRow label="Allow Guest Viewing" description="Non-logged-in users can view content" checked={settings.allow_guest_viewing} onChange={() => handleToggle('allow_guest_viewing')} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                <input type="number" value={settings.max_file_size_mb} onChange={(e) => handleChange('max_file_size_mb', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed File Types</label>
                <input type="text" value={settings.allowed_file_types.join(', ')} onChange={(e) => handleChange('allowed_file_types', e.target.value.split(',').map(t => t.trim()))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Bell className="w-5 h-5 mr-2" />Notification Settings</h2>
          <div className="space-y-4">
            <ToggleRow label="Email Notifications" description="Send email notifications to users" checked={settings.email_notifications} onChange={() => handleToggle('email_notifications')} />
            <ToggleRow label="Push Notifications" description="Send push notifications" checked={settings.push_notifications} onChange={() => handleToggle('push_notifications')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Retention (Days)</label>
              <input type="number" value={settings.notification_retention_days} onChange={(e) => handleChange('notification_retention_days', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" />Security Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (min)</label>
                <input type="number" value={settings.session_timeout_minutes} onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                <input type="number" value={settings.max_login_attempts} onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (min)</label>
                <input type="number" value={settings.lockout_duration_minutes} onChange={(e) => handleChange('lockout_duration_minutes', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
            </div>
            <ToggleRow label="Two-Factor Authentication" description="Require 2FA for all users" checked={settings.two_factor_auth} onChange={() => handleToggle('two_factor_auth')} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Password Length</label>
                <input type="number" value={settings.password_min_length} onChange={(e) => handleChange('password_min_length', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <ToggleRow label="Require Special Chars" checked={settings.password_require_special} onChange={() => handleToggle('password_require_special')} />
              <ToggleRow label="Require Numbers" checked={settings.password_require_number} onChange={() => handleToggle('password_require_number')} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2" />Rate Limiting</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Rate Limit (req/min)</label>
              <input type="number" value={settings.api_rate_limit} onChange={(e) => handleChange('api_rate_limit', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Rate Limit (uploads/hour)</label>
              <input type="number" value={settings.upload_rate_limit} onChange={(e) => handleChange('upload_rate_limit', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Settings className="w-5 h-5 mr-2" />Maintenance Mode</h2>
          <div className="space-y-4">
            <ToggleRow label="Maintenance Mode" description="Put site in maintenance mode" checked={settings.maintenance_mode} onChange={() => handleToggle('maintenance_mode')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
              <textarea value={settings.maintenance_message} onChange={(e) => handleChange('maintenance_message', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Database className="w-5 h-5 mr-2" />Analytics</h2>
          <div className="space-y-4">
            <ToggleRow label="Enable Analytics" description="Track user analytics" checked={settings.enable_analytics} onChange={() => handleToggle('enable_analytics')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analytics Retention (Days)</label>
              <input type="number" value={settings.analytics_retention_days} onChange={(e) => handleChange('analytics_retention_days', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center"><Layers className="w-5 h-5 mr-2" />Subscription Settings</h2>
            <Link to="/Admin/Subscriptions" className="text-sm text-black font-medium flex items-center hover:underline">
              Manage Plans <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <ToggleRow label="Enable Subscriptions" description="Allow users to subscribe to plans" checked={settings.enable_subscriptions} onChange={() => handleToggle('enable_subscriptions')} />
            {settings.enable_subscriptions && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Trial Days</label>
                    <input type="number" value={settings.free_trial_days} onChange={(e) => handleChange('free_trial_days', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select value={settings.subscription_currency} onChange={(e) => handleChange('subscription_currency', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Billing Cycle</label>
                    <select value={settings.subscription_billing_cycle} onChange={(e) => handleChange('subscription_billing_cycle', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <ToggleRow label="Prorate Upgrades" description="Credit unused time on plan upgrades" checked={settings.subscription_prorate_upgrades} onChange={() => handleToggle('subscription_prorate_upgrades')} />
                <ToggleRow label="Auto Renew" description="Auto-renew subscriptions by default" checked={settings.subscription_auto_renew} onChange={() => handleToggle('subscription_auto_renew')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
                  <input type="number" value={settings.subscription_grace_period_days} onChange={(e) => handleChange('subscription_grace_period_days', parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
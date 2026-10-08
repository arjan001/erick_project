import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SystemSetting } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Settings, Save, Globe, Bell, Shield, Clock, Users, Database, ToggleLeft, ToggleRight, Layers, ArrowRight, Mail, Send, CheckCircle2, Trash2, RefreshCw } from 'lucide-react'

const DEFAULT_SETTINGS = {
  site_name: 'Eric Rabar',
  site_description: 'Premium video production network',
  site_url: 'https://ericrabar.com',
  contact_email: 'contact@ericrabar.com',
  support_email: 'support@ericrabar.com',
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
  email_provider: 'brevo',
  email_sender_address: '',
  email_sender_name: '',
  brevo_api_key: '',
  brevo_sender_name: 'Eric Rabar',
  brevo_sms_enabled: false,
  brevo_email_enabled: false,
}

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
)

export default function AdminGeneralSettingsPage() {
  const { success, error } = useToast()
  const [settingsId, setSettingsId] = useState(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const rows = await SystemSetting.filter({}, 'setting_key', 100)
        if (rows && rows.length > 0) {
          const settingsMap = {}
          rows.forEach(setting => {
            const value = setting.setting_value
            // Parse JSON values or convert to appropriate types
            if (setting.setting_type === 'boolean') {
              settingsMap[setting.setting_key] = value === 'true'
            } else if (setting.setting_type === 'number') {
              settingsMap[setting.setting_key] = parseFloat(value)
            } else if (setting.setting_type === 'array') {
              try {
                settingsMap[setting.setting_key] = JSON.parse(value)
              } catch {
                settingsMap[setting.setting_key] = []
              }
            } else {
              settingsMap[setting.setting_key] = value
            }
          })
          setSettings({ ...DEFAULT_SETTINGS, ...settingsMap })
        }
      } catch (err) {
        
        error('Error', 'Failed to fetch settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Convert settings object to array of setting records
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        setting_type: typeof value === 'boolean' ? 'boolean' : 
                     typeof value === 'number' ? 'number' : 
                     Array.isArray(value) ? 'array' : 'string',
        description: ''
      }))

      for (const setting of settingsToSave) {
        const existing = await SystemSetting.filter({ setting_key: setting.setting_key })
        if (existing && existing.length > 0) {
          await SystemSetting.update(existing[0].id, { 
            setting_value: setting.setting_value,
            setting_type: setting.setting_type
          })
        } else {
          await SystemSetting.create(setting)
        }
      }
      success('Saved', 'Settings saved successfully')
    } catch (err) {
      
      error('Failed', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const handleClearCache = async () => {
    setClearingCache(true)
    try {
      // Clear localStorage
      localStorage.clear()
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Clear all cookies
      document.cookie.split(';').forEach(c => {
        const eq = c.indexOf('=')
        const name = eq > -1 ? c.slice(0, eq).trim() : c.trim()
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname
      })
      
      // Clear Supabase session
      const { supabase } = await import('@/lib/supabase')
      await supabase.auth.signOut({ scope: 'local' })
      
      // Clear service worker caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
      }
      
      // Clear IndexedDB if available
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases()
        await Promise.all(databases.map(db => {
          return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(db.name)
            request.onsuccess = resolve
            request.onerror = reject
          })
        }))
      }
      
      success('Cache Cleared', 'All browser and application cache has been cleared successfully')
      
      // Reload page after short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      
      error('Failed', 'Failed to clear cache')
    } finally {
      setClearingCache(false)
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">General Settings</h1>
            <p className="text-gray-300 mt-0.5 text-sm">Configure system-wide settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-2"><Globe className="w-4 h-4" /></span>Site Settings</h2>
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center"><span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mr-2"><Mail className="w-4 h-4" /></span>Transactional Email</h2>
          <p className="text-sm text-gray-500 mb-4">Choose which provider sends login and team invite emails. API keys are configured as server environment variables, never entered here.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { value: 'brevo', label: 'Brevo', desc: 'Formerly Sendinblue' },
              { value: 'resend', label: 'Resend', desc: 'Developer-friendly email API' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('email_provider', opt.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  settings.email_provider === opt.value
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <Send className="w-4 h-4" /> {opt.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </div>
                {settings.email_provider === opt.value && <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
              <input type="email" value={settings.email_sender_address} onChange={(e) => handleChange('email_sender_address', e.target.value)} placeholder="hello@ericrabar.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
              <input type="text" value={settings.email_sender_name} onChange={(e) => handleChange('email_sender_name', e.target.value)} placeholder="Eric Rabar" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center"><span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-2"><Send className="w-4 h-4" /></span>Brevo Integration</h2>
          <p className="text-sm text-gray-500 mb-4">Configure Brevo API for SMS OTP and email notifications. Get your API key from <a href="https://developers.brevo.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Brevo Dashboard</a>.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brevo API Key</label>
              <input type="password" value={settings.brevo_api_key} onChange={(e) => handleChange('brevo_api_key', e.target.value)} placeholder="Enter your Brevo API key" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">Your API key is stored securely in the database.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
              <input type="text" value={settings.brevo_sender_name} onChange={(e) => handleChange('brevo_sender_name', e.target.value)} placeholder="Eric Rabar" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">Max 11 characters for alphanumeric, 15 for numeric.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToggleRow label="Enable SMS" description="Send SMS OTP for phone verification" checked={settings.brevo_sms_enabled} onChange={() => handleToggle('brevo_sms_enabled')} />
              <ToggleRow label="Enable Email" description="Send transactional emails via Brevo" checked={settings.brevo_email_enabled} onChange={() => handleToggle('brevo_email_enabled')} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center"><span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-2"><Layers className="w-4 h-4" /></span>Subscription Settings</h2>
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center"><span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mr-2"><Database className="w-4 h-4" /></span>Cache Management</h2>
          <p className="text-sm text-gray-500 mb-4">Clear browser and application cache to resolve loading issues or force fresh data loading.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">Clear All Cache</div>
                <div className="text-sm text-gray-500 mt-1">Clears localStorage, sessionStorage, cookies, service worker caches, and IndexedDB</div>
              </div>
              <Button 
                onClick={handleClearCache} 
                disabled={clearingCache}
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
              >
                {clearingCache ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>localStorage: {localStorage.length} chars</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>sessionStorage: {sessionStorage.length} chars</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Cookies: {document.cookie.split(';').length} items</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Service Workers: {navigator.serviceWorker?.controller ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 flex justify-end gap-3">
          <Button 
            onClick={handleClearCache} 
            disabled={clearingCache}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
          >
            {clearingCache ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </>
            )}
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8 shadow-lg rounded-xl h-11">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
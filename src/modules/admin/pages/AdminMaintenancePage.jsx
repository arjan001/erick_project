/**
 * Admin Maintenance Mode Page
 * Configure maintenance mode settings with rich text editor
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { 
  Settings, Save, Clock, Globe, Shield, ToggleLeft, ToggleRight, 
  Calendar, Mail, Layout, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  fetchMaintenanceSettings, 
  clearMaintenanceCache,
  MAINTENANCE_TEMPLATES,
  getAllTemplates 
} from '@/lib/maintenanceMode';
import { SystemSetting } from '@/lib/supabaseEntities';

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

export default function AdminMaintenancePage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [settings, setSettings] = useState({
    enabled: false,
    message: '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>',
    startTime: '',
    endTime: '',
    allowedIPs: '',
    showCountdown: true,
    contactEmail: 'support@studio22.com',
    template: 'default'
  });

  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadSettings();
    setTemplates(getAllTemplates());
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenanceSettings();
      setSettings({
        enabled: data.enabled,
        message: data.message,
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        allowedIPs: Array.isArray(data.allowedIPs) ? data.allowedIPs.join(', ') : '',
        showCountdown: data.showCountdown,
        contactEmail: data.contactEmail,
        template: data.template
      });
    } catch (err) {
      console.error('Error loading maintenance settings:', err);
      error('Error', 'Failed to load maintenance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { setting_key: 'maintenance_mode', setting_value: String(settings.enabled), setting_type: 'boolean', description: 'Enable maintenance mode' },
        { setting_key: 'maintenance_message', setting_value: settings.message, setting_type: 'string', description: 'Custom maintenance message (HTML)' },
        { setting_key: 'maintenance_start_time', setting_value: settings.startTime, setting_type: 'string', description: 'Maintenance start time (ISO timestamp)' },
        { setting_key: 'maintenance_end_time', setting_value: settings.endTime, setting_type: 'string', description: 'Maintenance end time (ISO timestamp)' },
        { setting_key: 'maintenance_allowed_ips', setting_value: JSON.stringify(settings.allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip)), setting_type: 'array', description: 'IP addresses allowed during maintenance' },
        { setting_key: 'maintenance_show_countdown', setting_value: String(settings.showCountdown), setting_type: 'boolean', description: 'Show countdown timer' },
        { setting_key: 'maintenance_contact_email', setting_value: settings.contactEmail, setting_type: 'string', description: 'Contact email during maintenance' },
        { setting_key: 'maintenance_template', setting_value: settings.template, setting_type: 'string', description: 'Maintenance template' }
      ];

      for (const setting of settingsToSave) {
        const existing = await SystemSetting.filter({ setting_key: setting.setting_key });
        if (existing && existing.length > 0) {
          await SystemSetting.update(existing[0].id, { 
            setting_value: setting.setting_value,
            setting_type: setting.setting_type
          });
        } else {
          await SystemSetting.create(setting);
        }
      }

      clearMaintenanceCache();
      success('Saved', 'Maintenance settings saved successfully');
    } catch (err) {
      console.error('Error saving maintenance settings:', err);
      error('Failed', 'Failed to save maintenance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const applyTemplate = (templateKey) => {
    const template = MAINTENANCE_TEMPLATES[templateKey];
    if (template) {
      setSettings(prev => ({ ...prev, message: template.message, template: templateKey }));
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Maintenance Mode</h1>
            <p className="text-gray-300 mt-0.5 text-sm">Configure site maintenance mode and custom messages</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Status Card */}
        <div className={`rounded-2xl border-2 p-6 ${settings.enabled ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.enabled ? 'bg-red-100' : 'bg-green-100'}`}>
                {settings.enabled ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${settings.enabled ? 'text-red-900' : 'text-green-900'}`}>
                  {settings.enabled ? 'Maintenance Mode Active' : 'Site Online'}
                </h2>
                <p className={`text-sm ${settings.enabled ? 'text-red-700' : 'text-green-700'}`}>
                  {settings.enabled ? 'All non-admin users will see the maintenance page' : 'Site is accessible to all users'}
                </p>
              </div>
            </div>
            <ToggleRow 
              label={settings.enabled ? 'Disable' : 'Enable'} 
              description="" 
              checked={settings.enabled} 
              onChange={() => handleToggle('enabled')} 
            />
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Layout className="w-5 h-5 mr-2" />
              Maintenance Message
            </h2>
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
              size="sm"
            >
              {previewMode ? 'Edit Message' : 'Full Preview'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            {!previewMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Use Prebuilt Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.key}
                        onClick={() => applyTemplate(template.key)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          settings.template === template.key
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-900">{template.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message (HTML allowed)</label>
                  <textarea
                    value={settings.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="Enter your maintenance message in HTML format..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can use HTML tags for formatting. Example: &lt;h2&gt;Heading&lt;/h2&gt;, &lt;p&gt;Paragraph&lt;/p&gt;, &lt;strong&gt;Bold&lt;/strong&gt;
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message (HTML allowed)</label>
                  <textarea
                    value={settings.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                    placeholder="Enter your maintenance message in HTML format..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can use HTML tags for formatting. Example: &lt;h2&gt;Heading&lt;/h2&gt;, &lt;p&gt;Paragraph&lt;/p&gt;, &lt;strong&gt;Bold&lt;/strong&gt;
                  </p>
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div className={previewMode ? 'block' : 'hidden lg:block'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {previewMode ? 'Preview' : 'Live Preview'}
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white p-6 min-h-[300px]">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-3">
                      <span className="text-white text-xl font-bold">22</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Studio22</h1>
                  </div>
                  <div className="prose prose-gray max-w-none text-sm">
                    <div dangerouslySetInnerHTML={{ __html: settings.message }} />
                  </div>
                  {settings.showCountdown && settings.endTime && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-900 text-sm">Estimated Time Remaining</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600 text-center">
                        Calculating...
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900 text-sm">Need Help?</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      For urgent inquiries, please contact us at:
                    </p>
                    <a 
                      href={`mailto:${settings.contactEmail}`}
                      className="text-black font-medium hover:underline text-sm"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Schedule (Optional)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={settings.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={settings.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Leave empty to start/stop maintenance manually</p>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Access Control
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowed IP Addresses</label>
              <input
                type="text"
                value={settings.allowedIPs}
                onChange={(e) => handleChange('allowedIPs', e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of IP addresses that can access the site during maintenance</p>
            </div>
            <ToggleRow 
              label="Show Countdown Timer" 
              description="Display countdown to maintenance end time" 
              checked={settings.showCountdown} 
              onChange={() => handleToggle('showCountdown')} 
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Contact Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Email displayed to users during maintenance for urgent inquiries</p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-4 flex justify-end gap-3">
          <Button
            onClick={loadSettings}
            variant="outline"
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 px-8 shadow-lg rounded-xl h-11"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}

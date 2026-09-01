/**
 * Admin Maintenance Mode Page
 * Configure maintenance mode settings with rich text editor
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { 
  Settings, Save, Clock, Shield, CheckCircle2, AlertTriangle, RefreshCw,
  Layout, Mail, Key, Plus, Trash2, Copy, Eye, X
} from 'lucide-react';
import { 
  fetchMaintenanceSettings, 
  clearMaintenanceCache,
  MAINTENANCE_TEMPLATES,
  getAllTemplates 
} from '@/lib/maintenanceMode';
import { supabase } from '@/lib/supabase';

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <div className="font-medium text-gray-900 text-sm">{label}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
    <button 
      onClick={onChange} 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-black' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default function AdminMaintenancePage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [templatePreview, setTemplatePreview] = useState(null);
  
  const [settings, setSettings] = useState({
    enabled: false,
    message: '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>',
    startTime: '',
    endTime: '',
    allowedIPs: '',
    showCountdown: true,
    contactEmail: 'support@ericrabar.app',
    template: 'default'
  });

  const [templates, setTemplates] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState('');

  useEffect(() => {
    loadSettings();
    setTemplates(getAllTemplates());
    loadAccessCodes();
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
      // Save each setting individually
      const settingsMap = {
        'maintenance_mode': String(settings.enabled),
        'maintenance_message': settings.message,
        'maintenance_start_time': settings.startTime,
        'maintenance_end_time': settings.endTime,
        'maintenance_allowed_ips': JSON.stringify(settings.allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip)),
        'maintenance_show_countdown': String(settings.showCountdown),
        'maintenance_contact_email': settings.contactEmail,
        'maintenance_template': settings.template
      };

      for (const [key, value] of Object.entries(settingsMap)) {
        const { data: existing } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('setting_key', key)
          .single();
        
        if (existing) {
          await supabase
            .from('admin_settings')
            .update({ setting_value: value })
            .eq('setting_key', key);
        } else {
          await supabase
            .from('admin_settings')
            .insert({ setting_key: key, setting_value: value });
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

  const showTemplatePreview = (templateKey) => {
    const template = MAINTENANCE_TEMPLATES[templateKey];
    if (template) {
      setTemplatePreview(template);
    }
  };

  const loadAccessCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_access_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAccessCodes(data || []);
    } catch (err) {
      console.error('Error loading access codes:', err);
    }
  };

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      error('Error', 'Please enter an access code');
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance_access_codes')
        .insert({
          code: newCode.trim(),
          is_active: true,
          created_by: localStorage.getItem('ericrabar_user') ? JSON.parse(localStorage.getItem('ericrabar_user')).email : 'admin',
          expires_at: codeExpiry || null
        });
      
      if (error) throw error;
      
      success('Success', 'Access code created successfully');
      setNewCode('');
      setCodeExpiry('');
      loadAccessCodes();
    } catch (err) {
      console.error('Error creating access code:', err);
      error('Error', 'Failed to create access code');
    }
  };

  const handleDeleteCode = async (codeId) => {
    try {
      const { error } = await supabase
        .from('maintenance_access_codes')
        .delete()
        .eq('id', codeId);
      
      if (error) throw error;
      
      success('Success', 'Access code deleted');
      loadAccessCodes();
    } catch (err) {
      console.error('Error deleting access code:', err);
      error('Error', 'Failed to delete access code');
    }
  };

  const handleToggleCode = async (codeId, isActive) => {
    try {
      const { error } = await supabase
        .from('maintenance_access_codes')
        .update({ is_active: !isActive })
        .eq('id', codeId);
      
      if (error) throw error;
      
      success('Success', 'Access code updated');
      loadAccessCodes();
    } catch (err) {
      console.error('Error toggling access code:', err);
      error('Error', 'Failed to update access code');
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Mode</h1>
        <p className="text-gray-600 text-sm mt-1">Configure site maintenance mode and custom messages</p>
      </div>

      <div className="max-w-4xl space-y-4">
        {/* Status Card */}
        <div className={`border p-4 rounded-lg ${settings.enabled ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {settings.enabled ? 'Maintenance Mode Active' : 'Site Online'}
                </h2>
                <p className="text-xs text-gray-600">
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
        <div className="border border-gray-300 bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center">
              <Layout className="w-4 h-4 mr-2" />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            {!previewMode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Use Prebuilt Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <div key={template.key} className="flex gap-1">
                        <button
                          onClick={() => applyTemplate(template.key)}
                          className={`flex-1 p-2 rounded border text-left transition-all text-xs ${
                            settings.template === template.key
                              ? 'border-black bg-gray-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                        </button>
                        <button
                          onClick={() => showTemplatePreview(template.key)}
                          className="p-2 rounded border border-gray-300 hover:border-gray-400 text-xs text-gray-600 hover:text-gray-900"
                          title="Preview template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Custom Message (HTML allowed)</label>
                  <textarea
                    value={settings.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent font-mono text-xs"
                    placeholder="Enter your maintenance message in HTML format..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can use HTML tags for formatting
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Custom Message (HTML allowed)</label>
                  <textarea
                    value={settings.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent font-mono text-xs"
                    placeholder="Enter your maintenance message in HTML format..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can use HTML tags for formatting
                  </p>
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div className={previewMode ? 'block' : 'hidden lg:block'}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {previewMode ? 'Preview' : 'Live Preview'}
              </label>
              <div className="border border-gray-300 rounded overflow-hidden bg-gray-50">
                <div className="bg-white p-4 min-h-[250px]">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-black rounded-lg mb-2">
                      <span className="text-white text-lg font-bold">22</span>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">Eric Rabar</h1>
                  </div>
                  <div className="prose prose-gray max-w-none text-xs">
                    <div dangerouslySetInnerHTML={{ __html: settings.message }} />
                  </div>
                  {settings.showCountdown && settings.endTime && (
                    <div className="bg-gray-100 border border-gray-300 rounded p-3 mt-3">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-gray-600" />
                        <span className="font-semibold text-gray-900 text-xs">Estimated Time Remaining</span>
                      </div>
                      <div className="text-sm font-bold text-gray-600 text-center">
                        Calculating...
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3 text-gray-600" />
                      <span className="font-medium text-gray-900 text-xs">Need Help?</span>
                    </div>
                    <p className="text-gray-600 text-xs mb-1">
                      For urgent inquiries, please contact us at:
                    </p>
                    <a 
                      href={`mailto:${settings.contactEmail}`}
                      className="text-black font-medium hover:underline text-xs"
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
        <div className="border border-gray-300 bg-white rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Schedule (Optional)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={settings.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={settings.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Leave empty to start/stop maintenance manually</p>
        </div>

        {/* Access Control */}
        <div className="border border-gray-300 bg-white rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Access Control
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Allowed IP Addresses</label>
              <input
                type="text"
                value={settings.allowedIPs}
                onChange={(e) => handleChange('allowedIPs', e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of IP addresses</p>
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
        <div className="border border-gray-300 bg-white rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Contact Information
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Email displayed to users during maintenance</p>
          </div>
        </div>

        {/* Admin Access Codes */}
        <div className="border border-gray-300 bg-white rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
            <Key className="w-4 h-4 mr-2" />
            Admin Access Codes
          </h2>
          <p className="text-xs text-gray-600 mb-4">
            Generate access codes to bypass maintenance mode. Access the site using: /{`{code}`}
          </p>
          
          {/* Create New Code */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter access code (e.g., test123)"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
            <div>
              <input
                type="datetime-local"
                value={codeExpiry}
                onChange={(e) => setCodeExpiry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
            <Button
              onClick={handleCreateCode}
              className="bg-black text-white hover:bg-gray-800"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Code
            </Button>
          </div>

          {/* Access Codes List */}
          <div className="space-y-2">
            {accessCodes.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No access codes created yet</p>
            ) : (
              accessCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">/{code.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        code.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {new Date(code.created_at).toLocaleString()}
                      {code.expires_at && ` • Expires: ${new Date(code.expires_at).toLocaleString()}`}
                      {code.usage_count > 0 && ` • Used: ${code.usage_count} times`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`/${code.code}`);
                        success('Copied', 'Access code copied to clipboard');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleCode(code.id, code.is_active)}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                      title={code.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {code.is_active ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="p-1.5 hover:bg-red-100 rounded text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={loadSettings}
            variant="outline"
            disabled={saving}
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Template Preview Modal */}
      {templatePreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Template Preview: {templatePreview.name}</h2>
              <button 
                onClick={() => setTemplatePreview(null)} 
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-black rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-lg">
                    <span className="text-black text-3xl font-bold">22</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white">Eric Rabar</h1>
                  <p className="text-gray-400 mt-2">Professional Creative Platform</p>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: templatePreview.message }} />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-white">Need Help?</span>
                  </div>
                  <p className="text-gray-400 mb-2">
                    For urgent inquiries, please contact us at:
                  </p>
                  <a 
                    href={`mailto:${settings.contactEmail}`}
                    className="text-white font-medium hover:underline"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
                <div className="mt-6 text-center">
                  <button
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Check Status
                  </button>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                  <p className="text-sm text-gray-500">
                    © 2026 Eric Rabar. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button 
                onClick={() => applyTemplate(Object.keys(MAINTENANCE_TEMPLATES).find(key => MAINTENANCE_TEMPLATES[key].name === templatePreview.name))}
                className="bg-black text-white hover:bg-gray-800"
              >
                Use This Template
              </Button>
              <Button variant="outline" onClick={() => setTemplatePreview(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

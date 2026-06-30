import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamSidebar from '@/components/TeamSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Bell, Shield, Globe, Users, CreditCard, LogOut } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function TeamSettingsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    twoFactorAuth: false,
    language: 'en',
    timezone: 'UTC'
  });

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (!storedTeam) {
      window.location.href = '/signin';
      return;
    }
    setTeam(JSON.parse(storedTeam));
    
    // Load saved settings
    const savedSettings = localStorage.getItem('studio22_team_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save settings to localStorage for demo
      localStorage.setItem('studio22_team_settings', JSON.stringify(settings));
      success('Settings Saved', 'Your settings have been updated successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toastError('Save Failed', err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studio22_team');
    navigate(createPageUrl('SignIn'));
  };

  if (loading) {
    return (
      <div className="h-screen bg-white">
        <TeamSidebar />
        <main className="w-full h-full flex items-center justify-center pl-20">
          <div className="text-gray-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <TeamSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-8">Manage your team settings and preferences</p>

          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email notifications for new projects</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email notifications for task assignments</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Security</h2>
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Two-factor authentication</span>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                className="bg-black text-white hover:bg-gray-800"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

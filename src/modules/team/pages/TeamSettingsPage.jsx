import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamSidebar from '@/components/TeamSidebar';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Globe, LogOut } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ title, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-1">
      <span className="text-gray-700 text-sm">{title}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

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

    const savedSettings = localStorage.getItem('studio22_team_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
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
      <div className="min-h-screen bg-gray-50">
        <TeamSidebar />
        <main className="w-full h-screen flex items-center justify-center pl-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamSidebar />
      <main className="w-full pl-20">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 mb-8">Manage your team settings and preferences</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {team?.team_name?.charAt(0) || 'T'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{team?.team_name || 'Team'}</h2>
              <p className="text-sm text-gray-500">Team Admin</p>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl">
            <SectionCard icon={Bell} title="Notifications">
              <div className="space-y-3">
                <ToggleRow title="Email notifications for new projects" checked={settings.notifications} onChange={() => setSettings({ ...settings, notifications: !settings.notifications })} />
                <ToggleRow title="Email notifications for task assignments" checked={settings.notifications} onChange={() => setSettings({ ...settings, notifications: !settings.notifications })} />
              </div>
            </SectionCard>

            <SectionCard icon={Shield} title="Security">
              <ToggleRow title="Two-factor authentication" checked={settings.twoFactorAuth} onChange={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })} />
            </SectionCard>

            <SectionCard icon={Globe} title="Preferences">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl">
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
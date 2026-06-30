import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ClientSidebar from '@/components/ClientSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, User, Bell, Shield, Globe } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';

export default function ClientSettings() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [projectOwner, setProjectOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    notifications: true,
    language: 'en'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const owners = await base44.entities.ProjectOwner.filter({ email: JSON.parse(storedUser).email });
        if (owners.length > 0) {
          setProjectOwner(owners[0]);
          setSettings({
            companyName: owners[0].company_name || '',
            email: owners[0].email || '',
            phone: owners[0].phone || '',
            website: owners[0].website || '',
            notifications: true,
            language: 'en'
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!projectOwner) return;
    setSaving(true);

    try {
      await base44.entities.ProjectOwner.update(projectOwner.id, {
        company_name: settings.companyName,
        phone: settings.phone,
        website: settings.website
      });
      success('Settings Saved', 'Your settings have been updated');
    } catch (err) {
      console.error('Error saving settings:', err);
      toastError('Save Failed', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studio22_user');
    window.location.href = createPageUrl('Home');
  };

  if (loading) {
    return (
      <div className="h-screen bg-white">
        <ClientSidebar />
        <main className="w-full h-full flex items-center justify-center pl-20">
          <div className="text-gray-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <ClientSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Company Name</label>
                  <Input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <Input
                    type="email"
                    value={settings.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                  <Input
                    type="url"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Language</h2>
              </div>
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
                Logout
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ClientSidebar from '@/components/ClientSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Bell, Globe, LogOut } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';

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
      <div className="min-h-screen bg-gray-50">
        <ClientSidebar />
        <main className="w-full h-screen flex items-center justify-center pl-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSidebar />
      <main className="w-full pl-20">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 mb-8">Manage your account settings and preferences</p>

          {/* Profile header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {settings.companyName?.charAt(0) || user?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{settings.companyName || user?.full_name || 'Client'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl">
            <SectionCard icon={User} title="Profile Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Company Name</label>
                  <Input
                    type="text"
                    className="rounded-xl border-gray-200 focus-visible:ring-indigo-500"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <Input type="email" value={settings.email} disabled className="rounded-xl bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <Input
                    type="tel"
                    className="rounded-xl border-gray-200 focus-visible:ring-indigo-500"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                  <Input
                    type="url"
                    className="rounded-xl border-gray-200 focus-visible:ring-indigo-500"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Bell} title="Notifications">
              <label className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">Email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="w-5 h-5 rounded accent-indigo-600"
                />
              </label>
            </SectionCard>

            <SectionCard icon={Globe} title="Language">
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
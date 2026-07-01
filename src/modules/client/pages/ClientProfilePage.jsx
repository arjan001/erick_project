import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ProjectOwner } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Globe, Phone, Mail, Upload, Bell, Shield } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

function ToggleRow({ title, description, checked, onChange, isLast }) {
  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function ClientProfilePage() {
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/SignIn';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const owners = await ProjectOwner.filter({ email: parsedUser.email });
        if (owners.length > 0) {
          const o = owners[0];
          setOwner(o);
          setCompanyName(o.company || '');
          setPhone(o.phone || '');
          setWebsite(o.website || '');
          setBio(o.bio || '');
          setEmailNotifications(o.email_notifications ?? true);
          setProjectUpdates(o.project_updates ?? true);
          setProfilePublic(o.profile_public ?? true);
        }
      } catch (err) {
        console.error('Error fetching client profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    if (!owner) return;
    setSaving(true);
    try {
      const updated = await ProjectOwner.update(owner.id, { company: companyName, phone, website, bio });
      setOwner(updated);
      success('Profile Updated', 'Your profile has been saved');
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!owner) return;
    try {
      const updated = await ProjectOwner.update(owner.id, {
        email_notifications: emailNotifications,
        project_updates: projectUpdates,
        profile_public: profilePublic
      });
      setOwner(updated);
      success('Preferences Updated', 'Your settings have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !owner) return;
    setUploadingLogo(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;
      const updated = await ProjectOwner.update(owner.id, { profile_photo_url: fileUrl });
      setOwner(updated);
      success('Photo Updated', 'Your profile photo has been updated');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toastError('Upload Failed', 'Failed to upload photo');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="w-full px-6 sm:px-10 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile & Settings</h1>
        <p className="text-gray-500 mb-8">Manage your company profile, contact info and preferences</p>

        <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm w-fit">
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Profile</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Account Settings</button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-3xl">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-28 h-28 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {owner?.profile_photo_url ? <img src={owner.profile_photo_url} alt="Profile" className="w-full h-full object-cover" /> : <Building2 className="w-14 h-14 text-gray-400" />}
                </div>
                <label className="absolute bottom-1 right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{companyName || user.full_name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Company Name</label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-500" />Email</label>
                <Input type="email" value={user.email} disabled className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-500" />Phone</label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-500" />Website</label>
                <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">About</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell creators about your company..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-500" /> Notifications</h3>
              <ToggleRow title="Email Notifications" description="Get emailed about applications and messages" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
              <ToggleRow title="Project Updates" description="Get notified about your project's progress" checked={projectUpdates} onChange={() => setProjectUpdates(!projectUpdates)} isLast />
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">Save Notification Preferences</Button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> Privacy</h3>
              <ToggleRow title="Public Profile" description="Allow creators to view your company profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">Save Privacy Settings</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
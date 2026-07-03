import React, { useState, useEffect } from 'react';
import { Backer } from '@/lib/supabaseEntities';
import { Edit2, Save, X, Upload, Globe, Linkedin, Instagram, Twitter, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast.jsx';

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

export default function BackerProfile() {
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    organization_name: '', bio: '', website: '', linkedin: '', instagram: '', twitter: '', investment_focus: []
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  const logoInputRef = React.useRef(null);

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
        const backers = await Backer.filter({ contact_email: parsedUser.email });
        if (backers.length > 0) {
          const b = backers[0];
          setBacker(b);
          setFormData({
            organization_name: b.organization_name || '', bio: b.bio || '', website: b.website || '',
            linkedin: b.linkedin || '', instagram: b.instagram || '', twitter: b.twitter || '',
            investment_focus: b.investment_focus || []
          });
          setEmailNotifications(b.email_notifications ?? true);
          setDealAlerts(b.deal_alerts ?? true);
          setProfilePublic(b.profile_public ?? true);
        }
      } catch (error) {
        console.error('Error fetching backer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const updated = await Backer.update(backer.id, {
        organization_name: formData.organization_name,
        bio: formData.bio,
        website: formData.website,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        twitter: formData.twitter,
        investment_focus: formData.investment_focus
      });
      setBacker(updated);
      setEditing(false);
      success('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toastError('Save Failed', 'Failed to save profile. Please try again.');
    }
  };

  const handleSavePreferences = async () => {
    if (!backer) return;
    try {
      const updated = await Backer.update(backer.id, {
        email_notifications: emailNotifications,
        deal_alerts: dealAlerts,
        profile_public: profilePublic
      });
      setBacker(updated);
      success('Preferences Updated', 'Your settings have been saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;

      const updated = await Backer.update(backer.id, { logo_url: fileUrl });
      setBacker(updated);
      success('Logo Updated', 'Your logo has been uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toastError('Upload Failed', 'Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = "rounded-xl border-gray-200 focus-visible:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Investor Profile & Settings</h1>
        <p className="text-gray-500 mb-8">Manage your public profile, investment preferences and account settings</p>

        <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm w-fit">
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Profile</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Account Settings</button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Organization Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-indigo-50 ring-2 ring-indigo-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {backer?.logo_url ? (
                      <img src={backer.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-indigo-300">22.</span>
                    )}
                  </div>
                  <div>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <Button variant="outline" className="rounded-xl" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Organization Name</label>
                {editing ? (
                  <Input className={inputClass} value={formData.organization_name} onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })} placeholder="Enter organization name" />
                ) : (
                  <p className="text-gray-900">{backer?.organization_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                {editing ? (
                  <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about your organization" className="w-full min-h-[100px] px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{backer?.bio || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> Website
                </label>
                {editing ? (
                  <Input className={inputClass} value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
                ) : (
                  <p className="text-gray-900">{backer?.website || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-900">Social Links</label>

                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {editing ? (
                    <Input className={inputClass} value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="LinkedIn URL" />
                  ) : (
                    <p className="text-gray-900">{backer?.linkedin || 'Not set'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {editing ? (
                    <Input className={inputClass} value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="Instagram URL" />
                  ) : (
                    <p className="text-gray-900">{backer?.instagram || 'Not set'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {editing ? (
                    <Input className={inputClass} value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="Twitter URL" />
                  ) : (
                    <p className="text-gray-900">{backer?.twitter || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-500" /> Notifications</h3>
              <ToggleRow title="Email Notifications" description="Get emailed about activity on your investments" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
              <ToggleRow title="Deal Alerts" description="Get notified about new investment opportunities" checked={dealAlerts} onChange={() => setDealAlerts(!dealAlerts)} isLast />
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">Save Notification Preferences</Button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> Privacy</h3>
              <ToggleRow title="Public Profile" description="Allow project owners to view your investor profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">Save Privacy Settings</Button>
            </div>
          </div>
        )}
    </div>
    </div>
  );
}
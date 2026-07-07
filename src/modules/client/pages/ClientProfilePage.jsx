import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ProjectOwner } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/CountrySelector';
import { Building2, Globe, Phone, Mail, Upload, Bell, Shield, Edit2, Save, X, Linkedin, Instagram, Twitter, Youtube } from 'lucide-react';
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-black' : 'bg-gray-200'}`}
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
  const [editing, setEditing] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);

  const [formData, setFormData] = useState({
    company: '', phone: '', website: '', bio: '', linkedin: '', instagram: '', twitter: '', youtube: '',
    city: '', country: ''
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
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
          setFormData({
            company: o.company || '', phone: o.phone || '', website: o.website || '', bio: o.bio || '',
            linkedin: o.linkedin || '', instagram: o.instagram || '', twitter: o.twitter || '', youtube: o.youtube || '',
            city: o.city || '', country: o.country || ''
          });
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
      const updated = await ProjectOwner.update(owner.id, { 
        company: formData.company, 
        phone: formData.phone, 
        website: formData.website, 
        bio: formData.bio,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        twitter: formData.twitter,
        youtube: formData.youtube,
        city: formData.city,
        country: formData.country
      });
      setOwner(updated);
      success('Profile Updated', 'Your profile has been saved');
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBio = async () => {
    if (!owner) return;
    try {
      const updated = await ProjectOwner.update(owner.id, { bio: formData.bio });
      setOwner(updated);
      success('Bio Updated', 'Your bio has been updated');
      setShowBioModal(false);
    } catch (err) {
      console.error('Error saving bio:', err);
      toastError('Save Failed', 'Failed to save bio');
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
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Client Profile</h1>
            <p className="text-gray-500">Manage your company profile, contact info and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8">
              <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Profile</button>
              <button onClick={() => setActiveTab('settings')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Account Settings</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {owner?.profile_photo_url ? <img src={owner.profile_photo_url} alt="Profile" className="w-full h-full object-cover" /> : <Building2 className="w-16 h-16 text-gray-400" />}
                  </div>
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp,.bmp,.tiff" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{formData.company || user.full_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'} className={editing ? '' : 'bg-black text-white hover:bg-gray-800'}>
                      {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                      {editing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    <Button onClick={() => setShowBioModal(true)} variant="outline">
                      Edit Bio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              {editing ? (
                <div className="bg-gray-50 rounded-2xl p-8 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Company Name</label>
                      <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Your company name" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />Phone</label>
                      <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" />Website</label>
                      <Input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://yourcompany.com" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                      <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                      <CountrySelector value={formData.country} onChange={(val) => setFormData({ ...formData, country: val })} />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="bg-black text-white hover:bg-gray-800 rounded-lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{user.email}</div>
                      {formData.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{formData.phone}</div>}
                      {formData.website && <div className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" /><a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{formData.website}</a></div>}
                      {formData.city && formData.country && <p className="text-gray-600">{formData.city}, {formData.country}</p>}
                    </div>
                  </div>
                  {formData.bio && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                      <p className="text-gray-600">{formData.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Social Links */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="LinkedIn URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.linkedin || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="Instagram URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.instagram || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="Twitter URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.twitter || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} placeholder="YouTube URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.youtube || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" /> Notifications</h3>
                <ToggleRow title="Email Notifications" description="Get emailed about applications and messages" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                <ToggleRow title="Project Updates" description="Get notified about your project's progress" checked={projectUpdates} onChange={() => setProjectUpdates(!projectUpdates)} isLast />
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-2.5 mt-4">Save Notification Preferences</Button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> Privacy</h3>
                <ToggleRow title="Public Profile" description="Allow creators to view your company profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-2.5 mt-4">Save Privacy Settings</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Bio</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowBioModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Tell creators about your company..."
            />
          <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowBioModal(false)}>Cancel</Button>
              <Button onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save Bio</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
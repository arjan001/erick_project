import React, { useState, useEffect } from 'react';
import { Backer } from '@/lib/supabaseEntities';
import { base44 } from '@/api/base44Client';
import { Edit2, Save, X, Upload, Globe, Linkedin, Instagram, Twitter, Youtube, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/CountrySelector';
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-black' : 'bg-gray-200'}`}
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
  const [showBioModal, setShowBioModal] = useState(false);

  const [formData, setFormData] = useState({
    organization_name: '', bio: '', website: '', linkedin: '', instagram: '', twitter: '', youtube: '',
    city: '', country: '', investment_focus: []
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  const logoInputRef = React.useRef(null);

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
        const backers = await Backer.filter({ contact_email: parsedUser.email });
        if (backers.length > 0) {
          const b = backers[0];
          setBacker(b);
          setFormData({
            organization_name: b.organization_name || '', bio: b.bio || '', website: b.website || '',
            linkedin: b.linkedin || '', instagram: b.instagram || '', twitter: b.twitter || '', youtube: b.youtube || '',
            city: b.city || '', country: b.country || '',
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
        youtube: formData.youtube,
        city: formData.city,
        country: formData.country,
        backing_types: formData.investment_focus
      });
      setBacker(updated);
      setEditing(false);
      success('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toastError('Save Failed', `Failed to save profile: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSaveBio = async () => {
    if (!backer) return;
    try {
      const updated = await Backer.update(backer.id, { bio: formData.bio });
      setBacker(updated);
      success('Bio Updated', 'Your bio has been updated');
      setShowBioModal(false);
    } catch (error) {
      console.error('Error saving bio:', error);
      toastError('Save Failed', 'Failed to save bio');
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
    const file = e.target.files?.[0];
    if (!file || !backer) return;

    setUploadingLogo(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url || response.data?.url;
      if (!fileUrl) {
        throw new Error('No file URL returned from upload service');
      }
      const updated = await Backer.update(backer.id, { logo_url: fileUrl });
      setBacker(updated);
      success('Logo Updated', 'Your logo has been uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toastError('Upload Failed', `Failed to upload logo: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Backer Profile</h1>
            <p className="text-gray-500">Manage your investor profile and account preferences</p>
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
                    {backer?.logo_url ? (
                      <img src={backer.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-gray-300">22.</span>
                    )}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp,.bmp,.tiff" onChange={handleLogoUpload} className="hidden" />
                  <Button variant="outline" className="absolute bottom-2 right-2 rounded-lg" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{backer?.organization_name || user.full_name}</h2>
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
                      <label className="block text-sm font-medium text-gray-900 mb-2">Organization Name</label>
                      <Input className="rounded-lg" value={formData.organization_name} onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })} placeholder="Enter organization name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" /> Website
                      </label>
                      <Input className="rounded-lg" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                      <Input className="rounded-lg" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                      <CountrySelector value={formData.country} onChange={(val) => setFormData({ ...formData, country: val })} />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-900">{backer?.organization_name || 'Not set'}</p>
                      {backer?.website && <p className="text-gray-900 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /><a href={backer.website} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{backer.website}</a></p>}
                      {backer?.city && backer?.country && <p className="text-gray-600">{backer.city}, {backer.country}</p>}
                    </div>
                  </div>
                  {backer?.bio && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                      <p className="text-gray-600 leading-relaxed">{backer.bio}</p>
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
                      <p className="text-gray-900 flex-1">{backer?.linkedin || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="Instagram URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{backer?.instagram || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="Twitter URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{backer?.twitter || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} placeholder="YouTube URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{backer?.youtube || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-gray-400" /> Notifications</h3>
                <div className="space-y-4">
                  <ToggleRow title="Email Notifications" description="Get emailed about activity on your investments" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                  <ToggleRow title="Deal Alerts" description="Get notified about new investment opportunities" checked={dealAlerts} onChange={() => setDealAlerts(!dealAlerts)} isLast />
                </div>
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-3 mt-6">Save Notification Preferences</Button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-gray-400" /> Privacy</h3>
                <div className="space-y-4">
                  <ToggleRow title="Public Profile" description="Allow project owners to view your investor profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
                </div>
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-3 mt-6">Save Privacy Settings</Button>
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
              placeholder="Tell us about your organization..."
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
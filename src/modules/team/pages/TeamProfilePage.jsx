import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Team } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/CountrySelector';
import LanguageMultiSelect from '@/components/LanguageMultiSelect';
import { formatSocialMediaUrl } from '@/lib/socialMediaUtils';
import { Building2, MapPin, Globe, Phone, Mail, Edit2, Save, Upload, X, Users, Briefcase, Bell, Shield, Linkedin, Instagram, Twitter, Youtube } from 'lucide-react';
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

export default function TeamProfilePage() {
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showBioModal, setShowBioModal] = useState(false);

  const [formData, setFormData] = useState({
    team_name: '', contact_name: '', contact_email: '', contact_phone: '',
    city: '', country: '', website: '', linkedin: '', instagram: '', twitter: '', youtube: '',
    industry: '', company_size: '',
    specialties: [], equipment_owned: [], languages_spoken: [], description: '', availability: 'available'
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    const fetchTeam = async () => {
      try {
        const { email } = JSON.parse(storedUser);
        const teams = await Team.filter({ contact_email: email });
        if (teams.length > 0) {
          const t = teams[0];
          setTeam(t);
          setFormData({
            team_name: t.team_name || '', contact_name: t.contact_name || '', contact_email: t.contact_email || '',
            contact_phone: t.contact_phone || '', city: t.city || '', country: t.country || '', website: t.website || '',
            linkedin: t.linkedin || '', instagram: t.instagram || '', twitter: t.twitter || '', youtube: t.youtube || '',
            industry: t.industry || '', company_size: t.company_size || '', specialties: t.specialties || [],
            equipment_owned: t.equipment_owned || [], languages_spoken: t.languages_spoken || [],
            description: t.description || '', availability: t.availability || 'available'
          });
          setEmailNotifications(t.email_notifications ?? true);
          setTaskNotifications(t.task_notifications ?? true);
          setProfilePublic(t.profile_public ?? true);
        }
      } catch (err) {
        console.error('Error fetching team:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleSave = async () => {
    if (!team) return;
    try {
      const updated = await Team.update(team.id, {
        ...formData,
        location: `${formData.city}, ${formData.country}`,
      });
      setTeam(updated);
      success('Profile Updated', 'Team profile updated successfully');
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', err.message || 'Failed to save profile');
    }
  };

  const handleSaveBio = async () => {
    if (!team) return;
    try {
      const updated = await Team.update(team.id, { description: formData.description });
      setTeam(updated);
      success('Bio Updated', 'Your bio has been updated');
      setShowBioModal(false);
    } catch (err) {
      console.error('Error saving bio:', err);
      toastError('Save Failed', 'Failed to save bio');
    }
  };

  const handleSavePreferences = async () => {
    if (!team) return;
    try {
      const updated = await Team.update(team.id, {
        email_notifications: emailNotifications,
        task_notifications: taskNotifications,
        profile_public: profilePublic
      });
      setTeam(updated);
      success('Preferences Updated', 'Your settings have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !team) return;
    setUploadingLogo(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;
      const updated = await Team.update(team.id, { logo: fileUrl });
      setTeam(updated);
      success('Logo Updated', 'Team logo updated successfully');
    } catch (err) {
      console.error('Error uploading logo:', err);
      toastError('Upload Failed', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading || !team) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Team Profile</h1>
            <p className="text-gray-500">Manage your team's public profile, contact info and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8">
              <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Profile</button>
              <button onClick={() => setActiveTab('about')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'about' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>About</button>
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
                    {team.logo ? <img src={team.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-16 h-16 text-gray-400" />}
                  </div>
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp,.bmp,.tiff" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{team.team_name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{team.city && team.country ? `${team.city}, ${team.country}` : 'Location not set'}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{team.company_size || 'Size not set'}</span>
                  </div>
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
                      <label className="block text-sm font-medium text-gray-900 mb-2">Team Name</label>
                      <Input value={formData.team_name} onChange={(e) => setFormData({ ...formData, team_name: e.target.value })} className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Contact Person Name</label>
                      <Input value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Contact Phone</label>
                      <Input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                      <Input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="rounded-lg" />
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
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Specialties (comma-separated)</label>
                    <Input value={formData.specialties.join(', ')} onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Languages Spoken</label>
                    <LanguageMultiSelect
                      value={formData.languages_spoken}
                      onChange={(languages) => setFormData({ ...formData, languages_spoken: languages })}
                      placeholder="Search and select languages..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{team.contact_email || 'Email not set'}</div>
                      {team.contact_phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{team.contact_phone}</div>}
                      {team.website && <div className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" /><a href={team.website} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{team.website}</a></div>}
                    </div>
                  </div>
                  {team.specialties?.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {team.specialties.map((s, i) => <span key={i} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {team.description && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                      <p className="text-gray-600">{team.description}</p>
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
                      <Input className="rounded-lg flex-1" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: formatSocialMediaUrl('linkedin', e.target.value) })} placeholder="username" />
                    ) : (
                      <p className="text-gray-900 flex-1">{team.linkedin || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: formatSocialMediaUrl('instagram', e.target.value) })} placeholder="username" />
                    ) : (
                      <p className="text-gray-900 flex-1">{team.instagram || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: formatSocialMediaUrl('twitter', e.target.value) })} placeholder="username" />
                    ) : (
                      <p className="text-gray-900 flex-1">{team.twitter || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: formatSocialMediaUrl('youtube', e.target.value) })} placeholder="channel" />
                    ) : (
                      <p className="text-gray-900 flex-1">{team.youtube || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">About Team</h3>
                <p className="text-gray-600">{team.description || 'No description added yet.'}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {team.specialties?.length > 0 ? team.specialties.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border">{s}</span>
                  )) : <p className="text-gray-500 text-sm">No specialties added yet</p>}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {team.equipment_owned?.length > 0 ? team.equipment_owned.map((e, i) => (
                    <span key={i} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border">{e}</span>
                  )) : <p className="text-gray-500 text-sm">No equipment listed yet</p>}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {team.languages_spoken?.length > 0 ? team.languages_spoken.map((l, i) => (
                    <span key={i} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border">{l}</span>
                  )) : <p className="text-gray-500 text-sm">No languages listed yet</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" /> Notifications</h3>
                <ToggleRow title="Email Notifications" description="New project and application alerts" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                <ToggleRow title="Task Notifications" description="Get notified about task assignments" checked={taskNotifications} onChange={() => setTaskNotifications(!taskNotifications)} isLast />
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-2.5 mt-4">Save Notification Preferences</Button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> Privacy</h3>
                <ToggleRow title="Public Profile" description="Allow clients to view your team profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Tell us about your team..."
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
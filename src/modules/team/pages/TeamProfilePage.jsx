import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Globe, Phone, Mail, Edit2, Save, Upload, X, Users, Briefcase, Bell, Shield } from 'lucide-react';
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

export default function TeamProfilePage() {
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    team_name: '', contact_name: '', contact_email: '', contact_phone: '',
    city: '', country: '', website: '', industry: '', company_size: '',
    specialties: [], equipment_owned: [], languages_spoken: [], description: '', availability: 'available'
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/SignIn';
      return;
    }
    const fetchTeam = async () => {
      try {
        const { email } = JSON.parse(storedUser);
        const teams = await base44.entities.Team.filter({ contact_email: email });
        if (teams.length > 0) {
          const t = teams[0];
          setTeam(t);
          setFormData({
            team_name: t.team_name || '', contact_name: t.contact_name || '', contact_email: t.contact_email || '',
            contact_phone: t.contact_phone || '', city: t.city || '', country: t.country || '', website: t.website || '',
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
      const updated = await base44.entities.Team.update(team.id, {
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

  const handleSavePreferences = async () => {
    if (!team) return;
    try {
      const updated = await base44.entities.Team.update(team.id, {
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
      const updated = await base44.entities.Team.update(team.id, { logo: fileUrl });
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
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="w-full px-6 sm:px-10 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Team Profile & Settings</h1>
        <p className="text-gray-500 mb-8">Manage your team's public profile, contact info and preferences</p>

        <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm w-fit">
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Profile</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Account Settings</button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
              <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'} className={editing ? '' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}>
                {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-28 h-28 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {team.logo ? <img src={team.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-14 h-14 text-gray-400" />}
                </div>
                <label className="absolute bottom-1 right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{team.team_name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{team.city && team.country ? `${team.city}, ${team.country}` : 'Location not set'}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{team.company_size || 'Size not set'}</span>
                </div>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Team Name</label>
                  <Input value={formData.team_name} onChange={(e) => setFormData({ ...formData, team_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Contact Person Name</label>
                  <Input value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Contact Phone</label>
                    <Input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                    <Input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Specialties (comma-separated)</label>
                  <Input value={formData.specialties.join(', ')} onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <Button onClick={handleSave} className="bg-indigo-600 text-white hover:bg-indigo-700"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{team.contact_email || 'Email not set'}</div>
                {team.contact_phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{team.contact_phone}</div>}
                {team.website && <div className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" /><a href={team.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{team.website}</a></div>}
                {team.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {team.specialties.map((s, i) => <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{s}</span>)}
                  </div>
                )}
                {team.description && <p className="text-gray-600 bg-gray-50 rounded-lg p-4 mt-2">{team.description}</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-500" /> Notifications</h3>
              <ToggleRow title="Email Notifications" description="New project and application alerts" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
              <ToggleRow title="Task Notifications" description="Get notified about task assignments" checked={taskNotifications} onChange={() => setTaskNotifications(!taskNotifications)} isLast />
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">Save Notification Preferences</Button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> Privacy</h3>
              <ToggleRow title="Public Profile" description="Allow clients to view your team profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">Save Privacy Settings</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TeamSidebar from '@/components/TeamSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Globe, Phone, Mail, Edit2, Save, Upload, X, Users, Briefcase } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function TeamProfilePage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    team_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    city: '',
    country: '',
    website: '',
    industry: '',
    company_size: '',
    specialties: [],
    equipment_owned: [],
    languages_spoken: [],
    description: '',
    availability: 'available'
  });

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (!storedTeam) {
      window.location.href = '/signin';
      return;
    }
    setTeam(JSON.parse(storedTeam));
    setFormData(JSON.parse(storedTeam));
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!team) return;
    try {
      await base44.entities.Team.update(team.id, {
        ...formData,
        location: `${formData.city}, ${formData.country}`,
        updated_at: new Date().toISOString()
      });
      setTeam({ ...team, ...formData, location: `${formData.city}, ${formData.country}` });
      localStorage.setItem('studio22_team', JSON.stringify({ ...team, ...formData, location: `${formData.city}, ${formData.country}` }));
      success('Profile Updated', 'Team profile updated successfully');
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', err.message || 'Failed to save profile');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !team) return;
    setUploadingLogo(true);

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;
      
      await base44.entities.Team.update(team.id, { logo: fileUrl });
      setTeam({ ...team, logo: fileUrl });
      localStorage.setItem('studio22_team', JSON.stringify({ ...team, logo: fileUrl }));
      success('Logo Updated', 'Team logo updated successfully');
    } catch (err) {
      console.error('Error uploading logo:', err);
      toastError('Upload Failed', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Team Profile</h1>
            <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'}>
              {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {team.logo ? (
                    <img src={team.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    className="text-2xl font-bold"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{team.team_name}</h2>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {team.city && team.country ? `${team.city}, ${team.country}` : team.location || 'Location not set'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team.company_size || 'Size not set'}
                  </span>
                </div>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Team Name</label>
                  <Input
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Contact Person Name</label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Contact Email</label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Contact Phone</label>
                    <Input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                    <Input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select industry</option>
                      <option value="film_production">Film Production</option>
                      <option value="advertising">Advertising</option>
                      <option value="photography">Photography</option>
                      <option value="design">Design</option>
                      <option value="animation">Animation</option>
                      <option value="music">Music</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Company Size</label>
                    <select
                      value={formData.company_size}
                      onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 members</option>
                      <option value="11-50">11-50 members</option>
                      <option value="51-200">51-200 members</option>
                      <option value="200+">200+ members</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Specialties (comma-separated)</label>
                  <Input
                    type="text"
                    value={formData.specialties.join(', ')}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    placeholder="e.g. Film Production, Commercial, Music Video"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Equipment Owned (comma-separated)</label>
                  <Input
                    type="text"
                    value={formData.equipment_owned.join(', ')}
                    onChange={(e) => setFormData({ ...formData, equipment_owned: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    placeholder="e.g. ARRI Alexa, RED Camera, Steadicam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Languages Spoken (comma-separated)</label>
                  <Input
                    type="text"
                    value={formData.languages_spoken.join(', ')}
                    onChange={(e) => setFormData({ ...formData, languages_spoken: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    placeholder="e.g. English, Spanish, French"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{team.contact_email || 'Email not set'}</span>
                </div>
                {team.contact_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{team.contact_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{team.location || 'Location not set'}</span>
                </div>
                {team.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {team.website}
                    </a>
                  </div>
                )}
                {team.industry && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{team.industry}</span>
                  </div>
                )}
                {team.company_size && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{team.company_size}</span>
                  </div>
                )}
                {team.specialties && team.specialties.length > 0 && (
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Specialties</div>
                    <div className="flex flex-wrap gap-2">
                      {team.specialties.map((spec, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {team.equipment_owned && team.equipment_owned.length > 0 && (
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Equipment</div>
                    <div className="flex flex-wrap gap-2">
                      {team.equipment_owned.map((eq, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {team.languages_spoken && team.languages_spoken.length > 0 && (
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Languages</div>
                    <div className="flex flex-wrap gap-2">
                      {team.languages_spoken.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {team.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-2">Description</div>
                    <p className="text-gray-600">{team.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

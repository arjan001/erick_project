import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BackerSidebar from '@/components/BackerSidebar';
import { Edit2, Save, X, Upload, Globe, Linkedin, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast.jsx';

export default function BackerProfile() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    organization_name: '',
    bio: '',
    website: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    investment_focus: []
  });

  const logoInputRef = React.useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const backers = await base44.entities.Backer.filter({ email: parsedUser.email });
        if (backers.length > 0) {
          setBacker(backers[0]);
          setFormData({
            organization_name: backers[0].organization_name || '',
            bio: backers[0].bio || '',
            website: backers[0].website || '',
            linkedin: backers[0].linkedin || '',
            instagram: backers[0].instagram || '',
            twitter: backers[0].twitter || '',
            investment_focus: backers[0].investment_focus || []
          });
        }
      } catch (error) {
        console.error('Error fetching backer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSave = async () => {
    try {
      await base44.entities.Backer.update(backer.id, {
        organization_name: formData.organization_name,
        bio: formData.bio,
        website: formData.website,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        twitter: formData.twitter,
        investment_focus: formData.investment_focus
      });
      setBacker({ ...backer, ...formData });
      setEditing(false);
      success('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toastError('Save Failed', 'Failed to save profile. Please try again.');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;

      await base44.entities.Backer.update(backer.id, { logo_url: fileUrl });
      setBacker({ ...backer, logo_url: fileUrl });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = "rounded-xl border-gray-200 focus-visible:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <BackerSidebar />
      <main className="w-full pl-20">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Investor Profile</h1>
          <p className="text-gray-500 mb-8">Manage your public profile and investment preferences</p>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
              {/* Logo */}
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
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Organization Name</label>
                {editing ? (
                  <Input
                    className={inputClass}
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    placeholder="Enter organization name"
                  />
                ) : (
                  <p className="text-gray-900">{backer?.organization_name || 'Not set'}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your organization"
                    className="w-full min-h-[100px] px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{backer?.bio || 'Not set'}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> Website
                </label>
                {editing ? (
                  <Input
                    className={inputClass}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-gray-900">{backer?.website || 'Not set'}</p>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-900">Social Links</label>

                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {editing ? (
                    <Input
                      className={inputClass}
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn URL"
                    />
                  ) : (
                    <p className="text-gray-900">{backer?.linkedin || 'Not set'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {editing ? (
                    <Input
                      className={inputClass}
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="Instagram URL"
                    />
                  ) : (
                    <p className="text-gray-900">{backer?.instagram || 'Not set'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {editing ? (
                    <Input
                      className={inputClass}
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="Twitter URL"
                    />
                  ) : (
                    <p className="text-gray-900">{backer?.twitter || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
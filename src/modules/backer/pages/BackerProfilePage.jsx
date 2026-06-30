import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BackerSidebar from '@/components/BackerSidebar';
import { Edit2, Save, X, Upload, Globe, Linkedin, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/shared/utils/routing';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BackerSidebar />
      <div className="ml-20 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Profile</h1>
            <p className="text-gray-600">Manage your public profile and investment preferences</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!editing ? (
                  <Button onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Organization Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {backer?.logo_url ? (
                      <img src={backer.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-gray-300">22.</span>
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
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                ) : (
                  <p className="text-gray-900">{backer?.bio || 'Not set'}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                {editing ? (
                  <Input
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
                  <Linkedin className="w-5 h-5 text-gray-500" />
                  {editing ? (
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn URL"
                    />
                  ) : (
                    <p className="text-gray-900">{backer?.linkedin || 'Not set'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-gray-500" />
                  {editing ? (
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="Instagram URL"
                    />
                  ) : (
                    <p className="text-gray-900">{backer?.instagram || 'Not set'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-gray-500" />
                  {editing ? (
                    <Input
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="Twitter URL"
                    />
                  ) : (
                    <p className="text-gray-900">{backer?.twitter || 'Not set'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
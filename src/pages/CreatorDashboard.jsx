import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  CheckCircle, Clock, AlertCircle, Briefcase, MessageSquare, 
  Eye, TrendingUp, Upload, Edit, User, Mail, Phone, MapPin,
  Globe, Instagram, Film, Award, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function CreatorDashboard() {
  const [artist, setArtist] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await base44.auth.me();
      const artists = await base44.entities.Artist.filter({ email: user.email });
      
      if (artists.length > 0) {
        const artistData = artists[0];
        setArtist(artistData);

        // Load portfolio clips
        const clips = await base44.entities.PortfolioClip.filter({ 
          uploaded_by_type: 'artist',
          uploaded_by_id: artistData.id 
        });
        setPortfolioClips(clips);

        // Load applications (mock for now)
        setApplications([]);
        
        // Load messages (mock for now)
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Artist.update(artist.id, { profile_photo_url: file_url });
      setArtist({ ...artist, profile_photo_url: file_url });
    } catch (error) {
      alert('Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await base44.entities.Artist.update(artist.id, artist);
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
            <p className="text-gray-600 mb-6">You haven't submitted a creator application yet.</p>
            <Link to={createPageUrl('ApplyArtist')}>
              <Button className="bg-black hover:bg-gray-800">Apply Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    const config = statusConfig[artist.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-2 px-4 py-2 text-sm`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Creator Dashboard</h1>
          <p className="text-gray-600">Manage your profile, track applications, and showcase your work</p>
        </div>

        {/* Profile Status Card */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                    {artist.profile_photo_url ? (
                      <img src={artist.profile_photo_url} alt={artist.full_name} className="w-full h-full object-cover" />
                    ) : (
                      artist.full_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <input
                    type="file"
                    id="profile-photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <label 
                    htmlFor="profile-photo-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-gray-600" />
                    )}
                  </label>
                </div>

                {/* Profile Info */}
                <div>
                  <h2 className="text-2xl font-bold text-black mb-1">{artist.full_name}</h2>
                  <p className="text-gray-600 mb-2">{artist.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{artist.based_in_city}, {artist.based_in_country}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                {getStatusBadge()}
                <Button
                  onClick={() => setEditingProfile(!editingProfile)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {editingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Section */}
        {editingProfile && (
          <Card className="mb-8 border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Edit Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    value={artist.full_name || ''}
                    onChange={(e) => setArtist({ ...artist, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    value={artist.email || ''}
                    onChange={(e) => setArtist({ ...artist, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={artist.phone || ''}
                    onChange={(e) => setArtist({ ...artist, phone: e.target.value })}
                    placeholder="+31 6 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    value={artist.website || ''}
                    onChange={(e) => setArtist({ ...artist, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <Input
                    value={artist.instagram || ''}
                    onChange={(e) => setArtist({ ...artist, instagram: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn</label>
                  <Input
                    value={artist.linkedin || ''}
                    onChange={(e) => setArtist({ ...artist, linkedin: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveProfile} className="bg-black hover:bg-gray-800">
                  Save Changes
                </Button>
                <Button onClick={() => setEditingProfile(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                  <p className="text-3xl font-bold text-black">{portfolioClips.reduce((sum, clip) => sum + (clip.view_count || 0), 0)}</p>
                </div>
                <Eye className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Portfolio Clips</p>
                  <p className="text-3xl font-bold text-black">{portfolioClips.length}</p>
                </div>
                <Film className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Applications</p>
                  <p className="text-3xl font-bold text-black">{applications.length}</p>
                </div>
                <Briefcase className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Portfolio</span>
                <Link to={createPageUrl('ApplyArtist')}>
                  <Button size="sm" variant="outline">Manage</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioClips.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No portfolio clips yet</p>
                  <Link to={createPageUrl('ApplyArtist')}>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Add Clips</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolioClips.slice(0, 3).map((clip) => (
                    <div key={clip.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                        {clip.thumbnail_url && (
                          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{clip.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-500">{clip.view_count || 0} views</p>
                      </div>
                      <Badge className={
                        clip.status === 'approved' ? 'bg-green-100 text-green-800' :
                        clip.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {clip.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Messages</span>
                <Link to={createPageUrl('Messages')}>
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 5).map((msg, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{msg.from}</p>
                      <p className="text-xs text-gray-600 truncate">{msg.preview}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {artist.status === 'approved' && (
          <Card className="mt-8 bg-gradient-to-r from-amber-600 to-amber-700 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Start Browsing Projects</h3>
                  <p className="text-amber-100">Your profile is approved! Explore opportunities and apply to projects that match your skills.</p>
                </div>
                <Link to={createPageUrl('Projects')}>
                  <Button size="lg" className="bg-white text-amber-700 hover:bg-gray-100">
                    Browse Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
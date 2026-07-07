import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Artist, PortfolioClip, Endorsement, Testimonial, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/CountrySelector';
import RolesTagInput from '@/components/artist/RolesTagInput';
import { MapPin, Edit2, X, Upload, Globe, Instagram, Linkedin, Twitter, Youtube, Bell, Shield, Play, Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { confirmDialog } from '@/lib/sweetAlert';
import ShareProfileButton from '@/components/artist/ShareProfileButton';
import PortfolioModal from '@/components/artist/PortfolioModal';
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge';
import AboutSection from '@/components/AboutSection';

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

export default function ArtistProfile() {
  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [subscription, setSubscription] = useState(null);
  const [subPackage, setSubPackage] = useState(null);
  const [activeClip, setActiveClip] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '', roles: [], based_in_city: '', based_in_country: '', bio: '',
    website: '', instagram: '', linkedin: '', twitter: '', youtube: ''
  });
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectAlerts, setProjectAlerts] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', project_type: 'commercial', description: '', role: '', video_source: 'upload', original_video_url: ''
  });
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const MAX_VIDEO_SIZE_MB = 20;
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      navigate('/SignIn');
      return;
    }
    if (authUser) setUser(authUser);
  }, [authUser, isAuthenticated, isLoadingAuth, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const artistData = await Artist.filter({ email: user.email });
        if (artistData.length > 0) {
          const a = artistData[0];
          setArtist(a);
          setFormData({
            full_name: a.full_name || '', roles: a.roles || [], based_in_city: a.based_in_city || '',
            based_in_country: a.based_in_country || '', bio: a.bio || '',
            website: a.website || '', instagram: a.instagram || '', linkedin: a.linkedin || '',
            twitter: a.twitter || '', youtube: a.youtube || ''
          });
          setEmailNotifications(a.email_notifications ?? true);
          setProjectAlerts(a.project_alerts ?? true);
          setProfilePublic(a.profile_public ?? true);
          
          const clipsData = await PortfolioClip.filter({ 
            uploaded_by_type: 'artist', uploaded_by_id: a.id, status: 'approved'
          });
          setPortfolioClips(clipsData);
        }
        
        const endorsementsData = await Endorsement.filter({ recipient_email: user.email });
        setEndorsements(endorsementsData);
        
        const testimonialsData = await Testimonial.filter({ recipient_email: user.email });
        setTestimonials(testimonialsData);
        
        try {
          const subs = await Subscription.filter({ user_email: user.email, status: 'active' });
          if (subs?.[0]) {
            setSubscription(subs[0]);
            const pkgs = await SubscriptionPackage.filter({ id: subs[0].package_id });
            if (pkgs?.[0]) setSubPackage(pkgs[0]);
          }
        } catch (e) {}
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };
    fetchData();
  }, [user]);

  if (isLoadingAuth) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !artist) return;
    setUploadingImage(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;
      await Artist.update(artist.id, { profile_photo_url: fileUrl });
      setArtist(prev => ({ ...prev, profile_photo_url: fileUrl }));
      success('Photo Updated', 'Your profile photo has been updated');
    } catch (err) {
      console.error('Error uploading image:', err);
      toastError('Upload Failed', 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!artist) return;
    try {
      const updated = await Artist.update(artist.id, { 
        full_name: formData.full_name, roles: formData.roles, based_in_city: formData.based_in_city,
        based_in_country: formData.based_in_country, bio: formData.bio,
        website: formData.website, instagram: formData.instagram, linkedin: formData.linkedin,
        twitter: formData.twitter, youtube: formData.youtube
      });
      setArtist(updated);
      success('Profile Updated', 'Your profile has been saved');
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to save profile');
    }
  };

  const handleSaveBio = async () => {
    if (!artist) return;
    try {
      const updated = await Artist.update(artist.id, { bio: formData.bio });
      setArtist(updated);
      success('Bio Updated', 'Your bio has been updated');
      setShowBioModal(false);
    } catch (err) {
      console.error('Error saving bio:', err);
      toastError('Save Failed', 'Failed to save bio');
    }
  };

  const handleSavePreferences = async () => {
    if (!artist) return;
    try {
      const updated = await Artist.update(artist.id, {
        email_notifications: emailNotifications,
        project_alerts: projectAlerts,
        profile_public: profilePublic
      });
      setArtist(updated);
      success('Preferences Updated', 'Your settings have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  const handleAddPortfolioClip = async () => {
    if (!artist || !portfolioForm.title) {
      toastError('Validation Error', 'Please fill in the required fields');
      return;
    }
    try {
      let videoUrl = '';
      let videoEmbedUrl = '';
      let thumbnailUrl = '';
      
      // Function to get YouTube thumbnail
      const getYouTubeThumbnail = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
      };
      
      if (portfolioForm.video_source === 'upload' && selectedVideoFile) {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file: selectedVideoFile });
        videoUrl = uploadResponse.file_url || uploadResponse.url;
      } else if (portfolioForm.video_source !== 'upload' && portfolioForm.original_video_url) {
        videoUrl = portfolioForm.original_video_url;
        // Generate embed URL based on source
        const { getEmbedUrl } = await import('@/components/artist/PortfolioModal');
        videoEmbedUrl = getEmbedUrl(portfolioForm.original_video_url, portfolioForm.video_source);
        // Generate thumbnail for YouTube
        if (portfolioForm.video_source === 'youtube') {
          thumbnailUrl = getYouTubeThumbnail(portfolioForm.original_video_url);
        }
      }
      
      if (selectedCoverImage) {
        const uploadResponse = await base44.integrations.Core.UploadFile({ file: selectedCoverImage });
        thumbnailUrl = uploadResponse.file_url || uploadResponse.url;
      }
      
      const clipData = {
        uploaded_by_type: 'artist',
        uploaded_by_id: artist.id,
        title: portfolioForm.title,
        project_type: portfolioForm.project_type,
        description: portfolioForm.description,
        role: portfolioForm.role,
        original_video_url: videoUrl,
        video_embed_url: videoEmbedUrl,
        video_source: portfolioForm.video_source,
        thumbnail_url: thumbnailUrl,
        status: 'pending'
      };

      let newClip;
      if (editingPortfolio) {
        newClip = await PortfolioClip.update(editingPortfolio.id, clipData);
        setPortfolioClips(prev => prev.map(c => c.id === editingPortfolio.id ? newClip : c));
      } else {
        newClip = await PortfolioClip.create(clipData);
        setPortfolioClips([...portfolioClips, newClip]);
      }
      
      setShowPortfolioModal(false);
      setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '', video_source: 'upload', original_video_url: '' });
      setSelectedCoverImage(null);
      setSelectedVideoFile(null);
      setEditingPortfolio(null);
      success(editingPortfolio ? 'Portfolio Updated' : 'Portfolio Added', editingPortfolio ? 'Your portfolio clip has been updated' : 'Your portfolio clip has been submitted for approval');
    } catch (err) {
      console.error('Error adding portfolio clip:', err);
      toastError('Failed', 'Failed to save portfolio clip');
    }
  };

  const handleDeletePortfolioClip = async (clipId) => {
    const confirmed = await confirmDialog('Delete portfolio clip?', 'This action cannot be undone');
    if (!confirmed) return;
    try {
      await PortfolioClip.delete(clipId);
      setPortfolioClips(prev => prev.filter(clip => clip.id !== clipId));
    } catch (err) {
      console.error('Error deleting portfolio clip:', err);
      toastError('Delete Failed', 'Failed to delete portfolio clip');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Artist Profile</h1>
            <p className="text-gray-500">Manage your portfolio, skills and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8">
              <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Profile</button>
              <button onClick={() => setActiveTab('portfolio')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'portfolio' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Portfolio</button>
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
                    {artist?.profile_photo_url ? <img src={artist.profile_photo_url} alt="Profile" className="w-full h-full object-cover" /> : <Users className="w-16 h-16 text-gray-400" />}
                  </div>
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp,.bmp,.tiff" onChange={handleProfileImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{formData.full_name || user?.full_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  {formData.roles && formData.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.roles.map((role, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{role}</span>
                      ))}
                    </div>
                  )}
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
                      <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                      <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Your full name" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Roles/Title</label>
                      <RolesTagInput selected={formData.roles} onChange={(roles) => setFormData({ ...formData, roles })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />City</label>
                      <Input value={formData.based_in_city} onChange={(e) => setFormData({ ...formData, based_in_city: e.target.value })} className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                      <CountrySelector value={formData.based_in_country} onChange={(val) => setFormData({ ...formData, based_in_country: val })} />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} className="bg-black text-white hover:bg-gray-800 rounded-lg">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">{user?.email}</div>
                      {formData.role && <p className="text-gray-600">{formData.role}</p>}
                      {formData.based_in_city && formData.based_in_country && <p className="text-gray-600">{formData.based_in_city}, {formData.based_in_country}</p>}
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
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="Website URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{artist?.website || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="Instagram URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{artist?.instagram || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="LinkedIn URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{artist?.linkedin || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="Twitter URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{artist?.twitter || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} placeholder="YouTube URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{artist?.youtube || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
                <Button onClick={() => setShowPortfolioModal(true)} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" /> Add Work
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioClips.map(clip => (
                  <div key={clip.id} className="bg-gray-50 rounded-2xl overflow-hidden group">
                    <div className="aspect-video bg-gray-200 relative cursor-pointer" onClick={() => setActiveClip(clip)}>
                      {clip.thumbnail_url ? (
                        <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{clip.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{clip.description || clip.project_type}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">{clip.status}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingPortfolio(clip); setShowPortfolioModal(true); }} className="text-gray-600 hover:text-gray-900">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePortfolioClip(clip.id)} className="text-red-500 hover:text-red-700">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <AboutSection artist={artist} endorsements={endorsements} onUpdate={setArtist} />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-gray-400" /> Notifications</h3>
                <div className="space-y-4">
                  <ToggleRow title="Email Notifications" description="Get emailed about project opportunities" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                  <ToggleRow title="Project Alerts" description="Get notified about new projects matching your skills" checked={projectAlerts} isLast />
                </div>
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-3 mt-6">Save Notification Preferences</Button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-gray-400" /> Privacy</h3>
                <div className="space-y-4">
                  <ToggleRow title="Public Profile" description="Allow clients to view your profile" checked={profilePublic} isLast />
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
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowBioModal(false)}>Cancel</Button>
              <Button onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save Bio</Button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <PortfolioModal
          isOpen={showPortfolioModal}
          onClose={() => setShowPortfolioModal(false)}
          portfolioForm={portfolioForm}
          setPortfolioForm={setPortfolioForm}
          selectedCoverImage={selectedCoverImage}
          setSelectedCoverImage={setSelectedCoverImage}
          selectedVideoFile={selectedVideoFile}
          setSelectedVideoFile={setSelectedVideoFile}
          onSubmit={handleAddPortfolioClip}
          editingPortfolio={editingPortfolio}
          maxVideoSizeMB={MAX_VIDEO_SIZE_MB}
        />
      )}

      {/* Video Lightbox */}
      {activeClip && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setActiveClip(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" onClick={(e) => { e.stopPropagation(); setActiveClip(null); }}>
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {activeClip.video_embed_url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <iframe src={activeClip.video_embed_url} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={activeClip.title || 'Portfolio Video'} />
              </div>
            ) : (
              <video src={activeClip.original_video_url} controls autoPlay className="w-full max-h-[80vh] rounded-lg bg-black">
                <source src={activeClip.original_video_url} />
              </video>
            )}
            {activeClip.title && <h3 className="text-white text-lg font-medium mt-4 text-center">{activeClip.title}</h3>}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Artist, PortfolioClip, Endorsement, Testimonial, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/CountrySelector';
import MultiSelectAutocomplete from '@/components/MultiSelectAutocomplete';
import skillsAndRoles from '@/lib/skillsAndRoles.json';
import { ALL_FILM_ROLES } from '@/lib/filmRoles';
import { MapPin, Edit2, X, Upload, Globe, Instagram, Linkedin, Twitter, Youtube, Bell, Shield, Play, Plus, Users, HardDrive, Link as LinkIcon, Crown, CreditCard, Calendar, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
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
  const { user: authUser, isAuthenticated, isLoadingAuth, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    // Load saved tab from localStorage
    const savedTab = localStorage.getItem('ericrabar_active_tab');
    return savedTab || 'profile';
  });
  const [subscription, setSubscription] = useState(null);
  const [subPackage, setSubPackage] = useState(null);
  const [activeClip, setActiveClip] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '', roles: [], based_in_city: '', based_in_country: '', bio: '',
    website: '', instagram: '', linkedin: '', twitter: '', youtube: '',
    profession: '', gender: '',
    appearance: {
      height: '', weight: '', ageRange: '', ethnicity: '', build: '', hairColor: '', eyeColor: ''
    },
    skills: [],
    credits: {
      film: [], commercials: []
    },
    education: [],
    socialMedia: {
      instagram: '', linkedin: '', twitter: '', youtube: '', tiktok: ''
    },
    representation: {
      agent: '', email: ''
    },
    unionMembership: [],
    licensePassport: {
      driverLicense: false, passport: false
    }
  });

  // Flatten all skills from categories for multi-select
  const ALL_SKILLS = Object.values(skillsAndRoles.talent_skills_by_category || {}).flat();
  const ALL_ROLES = Object.values(skillsAndRoles.talent_roles_by_category || {}).flat();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectAlerts, setProjectAlerts] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState('');

  const [portfolioForm, setPortfolioForm] = useState(() => {
    // Load draft from localStorage if exists
    const savedDraft = localStorage.getItem('ericrabar_portfolio_draft');
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch {
        return { title: '', project_type: 'commercial', description: '', role: '', roles: [], video_source: 'upload', original_video_url: '' };
      }
    }
    return { title: '', project_type: 'commercial', description: '', role: '', roles: [], video_source: 'upload', original_video_url: '' };
  });
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const MAX_VIDEO_SIZE_MB = 20;
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  // Auto-save portfolio form draft to localStorage
  useEffect(() => {
    localStorage.setItem('ericrabar_portfolio_draft', JSON.stringify(portfolioForm));
  }, [portfolioForm]);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('ericrabar_active_tab', activeTab);
  }, [activeTab]);

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
        if (artistData && artistData.length > 0) {
          const a = artistData[0];
          setArtist(a);
          setFormData({
            full_name: a.full_name || '', roles: a.roles || [], based_in_city: a.based_in_city || '',
            based_in_country: a.based_in_country || '', bio: a.bio || '',
            website: a.website || '', instagram: a.instagram || '', linkedin: a.linkedin || '',
            twitter: a.twitter || '', youtube: a.youtube || '',
            profession: a.profession || '', gender: a.gender || '',
            appearance: a.appearance || { height: '', weight: '', ageRange: '', ethnicity: '', build: '', hairColor: '', eyeColor: '' },
            skills: a.skills || [],
            credits: a.credits || { film: [], commercials: [] },
            education: a.education || [],
            socialMedia: a.socialMedia || { instagram: '', linkedin: '', twitter: '', youtube: '', tiktok: '' },
            representation: a.representation || { agent: '', email: '' },
            unionMembership: a.unionMembership || [],
            licensePassport: a.licensePassport || { driverLicense: false, passport: false }
          });
          setEmailNotifications(a.email_notifications ?? true);
          setProjectAlerts(a.project_alerts ?? true);
          setProfilePublic(a.profile_public ?? true);
          setGoogleDriveFolderId(a.google_drive_folder_id || '');

          const clipsData = await PortfolioClip.filter({
            uploaded_by_type: 'artist', uploaded_by_id: a.id
          });
          setPortfolioClips(clipsData || []);
        } else {
          // Create artist record if it doesn't exist
          console.warn('No artist record found for email:', user.email, 'Creating one...');
          try {
            const newArtist = await Artist.create({
              email: user.email,
              full_name: user.full_name || user.email.split('@')[0],
              status: 'pending'
            });
            setArtist(newArtist);
            setFormData({
              full_name: newArtist.full_name || '', roles: newArtist.roles || [], based_in_city: newArtist.based_in_city || '',
              based_in_country: newArtist.based_in_country || '', bio: newArtist.bio || '',
              website: newArtist.website || '', instagram: newArtist.instagram || '', linkedin: newArtist.linkedin || '',
              twitter: newArtist.twitter || '', youtube: newArtist.youtube || '',
              profession: newArtist.profession || '', gender: newArtist.gender || '',
              appearance: newArtist.appearance || { height: '', weight: '', ageRange: '', ethnicity: '', build: '', hairColor: '', eyeColor: '' },
              skills: newArtist.skills || [],
              credits: newArtist.credits || { film: [], commercials: [] },
              education: newArtist.education || [],
              socialMedia: newArtist.socialMedia || { instagram: '', linkedin: '', twitter: '', youtube: '', tiktok: '' },
              representation: newArtist.representation || { agent: '', email: '' },
              unionMembership: newArtist.unionMembership || [],
              licensePassport: newArtist.licensePassport || { driverLicense: false, passport: false }
            });
            setEmailNotifications(newArtist.email_notifications ?? true);
            setProjectAlerts(newArtist.project_alerts ?? true);
            setProfilePublic(newArtist.profile_public ?? true);
            setPortfolioClips([]);
          } catch (createErr) {
            console.error('Error creating artist record:', createErr);
          }
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
        } catch (e) { }
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

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploadingImage(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url || response.data?.url;
      if (!fileUrl) {
        throw new Error('No file URL returned from upload service');
      }
      await Artist.update(artist.id, { profile_photo_url: fileUrl });
      setArtist(prev => ({ ...prev, profile_photo_url: fileUrl }));
      setPreviewUrl(null); // Clear preview after successful upload
      success('Photo Updated', 'Your profile photo has been updated');
    } catch (err) {
      console.error('Error uploading image:', err);
      toastError('Upload Failed', `Failed to upload photo: ${err.message || 'Unknown error'}`);
      setPreviewUrl(null); // Clear preview on error
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!artist) {
      toastError('Error', 'Artist profile not found. Please refresh the page.');
      return;
    }
    if (!formData.full_name) {
      toastError('Validation Error', 'Name is required');
      return;
    }
    try {
      const updated = await Artist.update(artist.id, {
        full_name: formData.full_name, roles: formData.roles, based_in_city: formData.based_in_city,
        based_in_country: formData.based_in_country, bio: formData.bio,
        website: formData.website, instagram: formData.instagram, linkedin: formData.linkedin,
        twitter: formData.twitter, youtube: formData.youtube,
        profession: formData.profession, gender: formData.gender,
        appearance: formData.appearance,
        skills: formData.skills,
        credits: formData.credits,
        education: formData.education,
        socialMedia: formData.socialMedia,
        representation: formData.representation,
        unionMembership: formData.unionMembership,
        licensePassport: formData.licensePassport
      });
      setArtist(updated);

      // Update the auth user name so it reflects in the dropdown
      await updateUser(formData.full_name);

      success('Profile Updated', 'Your profile has been saved');
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to save profile. Please try again.');
    }
  };

  const handleSaveBio = async () => {
    if (!artist) {
      toastError('Error', 'Artist profile not found. Please refresh the page.');
      return;
    }
    try {
      const updated = await Artist.update(artist.id, { bio: formData.bio });
      setArtist(updated);
      success('Bio Updated', 'Your bio has been updated');
      setShowBioModal(false);
    } catch (err) {
      console.error('Error saving bio:', err);
      toastError('Save Failed', 'Failed to save bio. Please try again.');
    }
  };

  const handleSavePreferences = async () => {
    if (!artist) {
      toastError('Error', 'Artist profile not found. Please refresh the page.');
      return;
    }
    try {
      const updated = await Artist.update(artist.id, {
        email_notifications: emailNotifications,
        project_alerts: projectAlerts,
        profile_public: profilePublic,
        google_drive_folder_id: googleDriveFolderId
      });
      setArtist(updated);
      success('Preferences Updated', 'Your settings have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  const extractFolderIdFromLink = (link) => {
    if (!link) return null;

    // Match various Google Drive folder link patterns
    const patterns = [
      /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/folder\/([a-zA-Z0-9_-]+)/,
      /\/([a-zA-Z0-9_-]{20,})/ // Fallback for long IDs
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If the input itself looks like a folder ID (long alphanumeric string), return it
    if (/^[a-zA-Z0-9_-]{10,}$/.test(link.trim())) {
      return link.trim();
    }

    return null;
  };

  const handleConnectGoogleDrive = async () => {
    const link = googleDriveFolderId.trim();

    if (!link) {
      toastError('Connection Failed', 'Please enter a Google Drive folder link');
      return;
    }

    const folderId = extractFolderIdFromLink(link);

    if (!folderId) {
      toastError('Invalid Link', 'Could not extract folder ID from the link. Please check the URL and try again.');
      return;
    }

    if (!artist) {
      toastError('Connection Failed', 'Artist profile not found. Please complete your profile first.');
      return;
    }

    try {
      // Update the artist profile with the extracted folder ID
      const updated = await Artist.update(artist.id, { google_drive_folder_id: folderId });
      setArtist(updated);
      setGoogleDriveFolderId(folderId);
      success('Google Drive Connected', 'Your Google Drive folder has been successfully connected');
    } catch (err) {
      console.error('Error connecting Google Drive:', err);
      toastError('Connection Failed', `Failed to connect Google Drive: ${err.message || 'Please try again.'}`);
    }
  };

  const handleCopyProfileLink = async () => {
    if (!artist) return;
    const url = `${window.location.origin}/artist/${artist.id}`;
    try {
      await navigator.clipboard.writeText(url);
      success('Link Copied', 'Your public profile link has been copied to clipboard');
    } catch (err) {
      console.error('Error copying link:', err);
      toastError('Copy Failed', 'Failed to copy profile link');
    }
  };

  const handleAddPortfolioClip = async () => {
    console.log('handleAddPortfolioClip called');
    console.log('portfolioForm:', portfolioForm);
    console.log('selectedCoverImage:', selectedCoverImage);
    console.log('selectedVideoFile:', selectedVideoFile);
    console.log('artist:', artist);

    if (!artist) {
      toastError('Error', 'Artist profile not found. Please complete your profile first.');
      return;
    }
    if (!portfolioForm.title || portfolioForm.title.trim() === '') {
      toastError('Validation Error', 'Please fill in the required fields (title)');
      return;
    }

    setUploading(true);

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
        console.log('Uploading video file...');
        const uploadResponse = await base44.integrations.Core.UploadFile({ file: selectedVideoFile });
        console.log('Video upload response:', uploadResponse);
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
        console.log('Uploading cover image...');
        const uploadResponse = await base44.integrations.Core.UploadFile({ file: selectedCoverImage });
        console.log('Image upload response:', uploadResponse);
        thumbnailUrl = uploadResponse.file_url || uploadResponse.url;
      }

      const clipData = {
        artist_id: artist.id,
        title: portfolioForm.title,
        project_name: portfolioForm.title, // Map title to project_name as per schema
        project_type: portfolioForm.project_type,
        description: portfolioForm.description,
        role: portfolioForm.role,
        video_url: videoUrl, // Map to video_url as per schema
        original_video_url: portfolioForm.original_video_url,
        video_embed_url: videoEmbedUrl,
        video_source: portfolioForm.video_source,
        thumbnail_url: thumbnailUrl,
        status: 'approved',
        uploaded_by_type: 'artist',
        uploaded_by_id: artist.id
      };

      console.log('Creating portfolio clip with data:', clipData);
      console.log('Final videoUrl:', videoUrl);
      console.log('Final videoEmbedUrl:', videoEmbedUrl);
      console.log('Final thumbnailUrl:', thumbnailUrl);

      let newClip;
      if (editingPortfolio) {
        newClip = await PortfolioClip.update(editingPortfolio.id, clipData);
        setPortfolioClips(prev => prev.map(c => c.id === editingPortfolio.id ? newClip : c));
      } else {
        newClip = await PortfolioClip.create(clipData);
        setPortfolioClips([...portfolioClips, newClip]);
      }

      console.log('Portfolio clip saved:', newClip);

      setShowPortfolioModal(false);
      setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '', roles: [], video_source: 'upload', original_video_url: '' });
      setSelectedCoverImage(null);
      setSelectedVideoFile(null);
      setEditingPortfolio(null);
      localStorage.removeItem('ericrabar_portfolio_draft'); // Clear draft after successful save
      success(editingPortfolio ? 'Portfolio Updated' : 'Portfolio Added', editingPortfolio ? 'Your portfolio clip has been updated' : 'Your portfolio clip has been submitted for approval');
    } catch (err) {
      console.error('Error adding portfolio clip:', err);
      toastError('Failed', `Failed to save portfolio clip: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
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
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-4 sm:gap-8 min-w-max">
              <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Profile</button>
              <button onClick={() => setActiveTab('portfolio')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'portfolio' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Portfolio</button>
              <button onClick={() => setActiveTab('about')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'about' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>About</button>
              <button onClick={() => setActiveTab('settings')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Account Settings</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : artist?.profile_photo_url ? (
                      <img src={artist.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-white" />
                    )}
                    <input type="file" accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp,.bmp,.tiff" onChange={handleProfileImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{formData.full_name || user?.full_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  {formData.roles && formData.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      {formData.roles.map((role, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{role}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                    <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'} className={editing ? '' : 'bg-black text-white hover:bg-gray-800'}>
                      {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                      {editing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    <Button onClick={() => setShowBioModal(true)} variant="outline">
                      Edit Bio
                    </Button>
                    <Button onClick={handleCopyProfileLink} variant="outline" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Profile
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
                      <label className="block text-sm font-medium text-gray-900 mb-2">Profession</label>
                      <Input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="e.g., Actor, Director" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Roles/Title</label>
                      <MultiSelectAutocomplete
                        options={ALL_ROLES}
                        selected={formData.roles}
                        onChange={(selected) => setFormData({ ...formData, roles: selected })}
                        placeholder="Search and select your roles..."
                        searchable={true}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                      </select>
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

                  {/* Appearance Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Appearance</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Height</label>
                        <Input value={formData.appearance.height} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, height: e.target.value } })} placeholder="e.g., 5ft 6in" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Weight</label>
                        <Input value={formData.appearance.weight} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, weight: e.target.value } })} placeholder="e.g., 130 lbs" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Age Range</label>
                        <Input value={formData.appearance.ageRange} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, ageRange: e.target.value } })} placeholder="e.g., 25-35" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Ethnicity</label>
                        <Input value={formData.appearance.ethnicity} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, ethnicity: e.target.value } })} placeholder="e.g., African American" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Build</label>
                        <Input value={formData.appearance.build} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, build: e.target.value } })} placeholder="e.g., Athletic" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Hair Color</label>
                        <Input value={formData.appearance.hairColor} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, hairColor: e.target.value } })} placeholder="e.g., Black" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Eye Color</label>
                        <Input value={formData.appearance.eyeColor} onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, eyeColor: e.target.value } })} placeholder="e.g., Brown" className="rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Skills</h4>
                    <div className="space-y-4">
                      <MultiSelectAutocomplete
                        options={ALL_SKILLS}
                        selected={formData.skills}
                        onChange={(selected) => setFormData({ ...formData, skills: selected })}
                        placeholder="Search and select your skills..."
                        label="Select Your Skills"
                        searchable={true}
                      />
                      <p className="text-xs text-gray-500">Choose from pre-defined film industry skills or type to search</p>
                    </div>
                  </div>

                  {/* Credits Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Credits</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Film Credits (comma-separated)</label>
                        <textarea value={formData.credits.film.join(', ')} onChange={(e) => setFormData({ ...formData, credits: { ...formData.credits, film: e.target.value.split(', ').filter(s => s) } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="e.g., Film A, Film B" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Commercial Credits (comma-separated)</label>
                        <textarea value={formData.credits.commercials.join(', ')} onChange={(e) => setFormData({ ...formData, credits: { ...formData.credits, commercials: e.target.value.split(', ').filter(s => s) } })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="e.g., Brand Commercial, TV Ad" />
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Education & Training</h4>
                    <div className="space-y-2">
                      {formData.education.map((edu, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input value={edu} onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[idx] = e.target.value;
                            setFormData({ ...formData, education: newEducation });
                          }} placeholder="Enter education" className="rounded-lg flex-1" />
                          <button onClick={() => {
                            const newEducation = formData.education.filter((_, i) => i !== idx);
                            setFormData({ ...formData, education: newEducation });
                          }} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Remove</button>
                        </div>
                      ))}
                      <button onClick={() => setFormData({ ...formData, education: [...formData.education, ''] })} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">+ Add Education</button>
                    </div>
                  </div>

                  {/* Representation Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Representation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Agency</label>
                        <Input value={formData.representation.agent} onChange={(e) => setFormData({ ...formData, representation: { ...formData.representation, agent: e.target.value } })} placeholder="Agency name" className="rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Agent Email</label>
                        <Input value={formData.representation.email} onChange={(e) => setFormData({ ...formData, representation: { ...formData.representation, email: e.target.value } })} placeholder="agent@email.com" className="rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Union Membership Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Union Membership</h4>
                    <div className="space-y-2">
                      {formData.unionMembership.map((union, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input value={union} onChange={(e) => {
                            const newUnions = [...formData.unionMembership];
                            newUnions[idx] = e.target.value;
                            setFormData({ ...formData, unionMembership: newUnions });
                          }} placeholder="Enter union" className="rounded-lg flex-1" />
                          <button onClick={() => {
                            const newUnions = formData.unionMembership.filter((_, i) => i !== idx);
                            setFormData({ ...formData, unionMembership: newUnions });
                          }} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Remove</button>
                        </div>
                      ))}
                      <button onClick={() => setFormData({ ...formData, unionMembership: [...formData.unionMembership, ''] })} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">+ Add Union</button>
                    </div>
                  </div>

                  {/* License & Passport Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">License & Passport</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.licensePassport.driverLicense} onChange={(e) => setFormData({ ...formData, licensePassport: { ...formData.licensePassport, driverLicense: e.target.checked } })} className="rounded" />
                        <span className="text-sm text-gray-700">Driver's License</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.licensePassport.passport} onChange={(e) => setFormData({ ...formData, licensePassport: { ...formData.licensePassport, passport: e.target.checked } })} className="rounded" />
                        <span className="text-sm text-gray-700">Passport</span>
                      </label>
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
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.socialMedia?.tiktok} onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, tiktok: e.target.value } })} placeholder="TikTok URL" />
                    ) : (
                      <p className="text-gray-900 flex-1">{artist?.socialMedia?.tiktok || 'Not set'}</p>
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
                  <div key={clip.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative cursor-pointer" onClick={() => setActiveClip(clip)}>
                      {clip.thumbnail_url ? (
                        <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Play className="w-8 h-8 text-gray-400 ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 text-black ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base truncate">{clip.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{clip.description}</p>
                        </div>
                        <span className="flex-shrink-0 text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium capitalize">
                          {clip.project_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingPortfolio(clip); setShowPortfolioModal(true); }} className="flex-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeletePortfolioClip(clip.id)} className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                          Delete
                        </Button>
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
            <div className="max-w-3xl space-y-6 w-full">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><HardDrive className="w-5 h-5 text-gray-400" /> Google Drive Integration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Google Drive Folder Link</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={googleDriveFolderId}
                        onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                        placeholder="Paste your Google Drive folder link (e.g., https://drive.google.com/drive/folders/...)"
                        className="rounded-lg flex-1 min-w-0"
                      />
                      <Button onClick={handleConnectGoogleDrive} variant="outline" className="rounded-lg whitespace-nowrap">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Paste the full Google Drive folder link. We'll automatically extract the folder ID and connect your portfolio.
                    </p>
                  </div>
                </div>
              </div>
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
          uploading={uploading}
          editingPortfolio={editingPortfolio}
          maxVideoSizeMB={MAX_VIDEO_SIZE_MB}
          googleDriveFolderId={artist?.google_drive_folder_id}
        />
      )}

      {/* Video Lightbox */}
      {activeClip && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setActiveClip(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10" onClick={(e) => { e.stopPropagation(); setActiveClip(null); }}>
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {console.log('Active clip data:', activeClip)}
            {console.log('video_url:', activeClip.video_url)}
            {console.log('original_video_url:', activeClip.original_video_url)}
            {console.log('video_embed_url:', activeClip.video_embed_url)}
            {activeClip.video_embed_url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <iframe src={activeClip.video_embed_url} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={activeClip.title || 'Portfolio Video'} />
              </div>
            ) : activeClip.video_url || activeClip.original_video_url ? (
              <video
                src={activeClip.video_url || activeClip.original_video_url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-lg bg-black"
                onError={(e) => console.error('Video error:', e)}
              >
                <source src={activeClip.video_url || activeClip.original_video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white">No video URL available</p>
              </div>
            )}
            {activeClip.title && <h3 className="text-white text-lg font-medium mt-4 text-center">{activeClip.title}</h3>}
          </div>
        </div>
      )}
    </div>
  );
}

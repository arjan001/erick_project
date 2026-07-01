import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { base44 } from '@/api/base44Client';

import { useAuth } from '@/lib/AuthContext';

import AboutSection from '@/components/AboutSection';

import { Button } from '@/components/ui/button';

import { createPageUrl } from '@/shared/utils/routing';

import { MapPin, MessageCircle, Briefcase, MoreHorizontal, ChevronDown, Copy, Globe, Instagram, Linkedin, Star, ThumbsUp, Play, Users, Plus, Edit2, X } from 'lucide-react';

import { useToast } from '@/hooks/useToast';
import { notifyError, confirmDialog } from '@/lib/sweetAlert';



export default function ArtistProfile() {

  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();

  const [user, setUser] = useState(null);

  const [artist, setArtist] = useState(null);

  const [portfolioClips, setPortfolioClips] = useState([]);

  const [endorsements, setEndorsements] = useState([]);

  const [testimonials, setTestimonials] = useState([]);

  const [activeTab, setActiveTab] = useState('work');

  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  const [selectedProjectTypeFilter, setSelectedProjectTypeFilter] = useState('all');

  const [showRolesDropdown, setShowRolesDropdown] = useState(false);

  const [showProjectTypesDropdown, setShowProjectTypesDropdown] = useState(false);

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const [editingPortfolio, setEditingPortfolio] = useState(null);

  const [editingName, setEditingName] = useState(false);

  const [editingRole, setEditingRole] = useState(false);

  const [editingLocation, setEditingLocation] = useState(false);

  const [editingBio, setEditingBio] = useState(false);

  const [editingSocial, setEditingSocial] = useState(false);

  const [profileName, setProfileName] = useState(user?.full_name || '');

  const [profileRole, setProfileRole] = useState('');

  const [profileLocation, setProfileLocation] = useState('');

  const [profileBio, setProfileBio] = useState('');

  const [profileWebsite, setProfileWebsite] = useState('');

  const [profileInstagram, setProfileInstagram] = useState('');

  const [profileLinkedin, setProfileLinkedin] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);

  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState({

    title: '',

    project_type: 'commercial',

    description: '',

    role: ''

  });

  const fileInputRef = React.useRef(null);

  const videoInputRef = React.useRef(null);

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

        // Fetch artist data

        const artistData = await base44.entities.Artist.filter({ email: user.email });

        if (artistData.length > 0) {

          setArtist(artistData[0]);

          

          // Fetch portfolio clips

          const clipsData = await base44.entities.PortfolioClip.filter({ 

            uploaded_by_type: 'artist', 

            uploaded_by_id: artistData[0].id,

            status: 'approved'

          });

          setPortfolioClips(clipsData);

        }



        // Fetch endorsements

        const endorsementsData = await base44.entities.Endorsement.filter({ 

          recipient_email: user.email 

        });

        setEndorsements(endorsementsData);



        // Fetch testimonials

        const testimonialsData = await base44.entities.Testimonial.filter({ 

          recipient_email: user.email 

        });

        setTestimonials(testimonialsData);

        setProfileRole(artistData[0]?.role || '');

        setProfileName(artistData[0]?.full_name || user?.full_name || '');

        setProfileLocation(artistData[0]?.based_in_city || '');

        setProfileBio(artistData[0]?.bio || '');

        setProfileWebsite(artistData[0]?.website || '');

        setProfileInstagram(artistData[0]?.instagram || '');

        setProfileLinkedin(artistData[0]?.linkedin || '');

      } catch (err) {

        console.error('Error fetching profile data:', err);

      }

    };



    fetchData();

  }, [user]);



  if (isLoadingAuth) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;



  // Get unique roles from portfolio clips

  const allRoles = [...new Set(portfolioClips.map(clip => {

    const projectType = clip.project_type || 'Other';

    return projectType.charAt(0).toUpperCase() + projectType.slice(1).replace(/_/g, ' ');

  }))];



  const allProjectTypes = [...new Set(portfolioClips.map(clip => 

    (clip.project_type || 'other').charAt(0).toUpperCase() + (clip.project_type || 'other').slice(1).replace(/_/g, ' ')

  ))];



  // Filter portfolio clips

  const filteredClips = portfolioClips.filter(clip => {

    if (selectedRoleFilter !== 'all') {

      const clipRole = (clip.project_type || 'other').charAt(0).toUpperCase() + (clip.project_type || 'other').slice(1).replace(/_/g, ' ');

      if (clipRole !== selectedRoleFilter) return false;

    }

    if (selectedProjectTypeFilter !== 'all') {

      const clipType = (clip.project_type || 'other').charAt(0).toUpperCase() + (clip.project_type || 'other').slice(1).replace(/_/g, ' ');

      if (clipType !== selectedProjectTypeFilter) return false;

    }

    return true;

  });



  // Group endorsements by skill

  const groupedEndorsements = endorsements.reduce((acc, e) => {

    if (!acc[e.skill]) acc[e.skill] = [];

    acc[e.skill].push(e);

    return acc;

  }, {});



  const handleProfileImageUpload = async (e) => {

    const file = e.target.files?.[0];

    if (!file || !artist) {

      console.error('No file or artist:', { file, artist });

      return;

    }



    console.log('Uploading file:', file.name, file.type, file.size);

    setUploadingImage(true);

    try {

      const response = await base44.integrations.Core.UploadFile({ file });

      console.log('Upload response:', response);

      

      const fileUrl = response.file_url || response.url;

      if (!fileUrl) {

        throw new Error('No file URL in response');

      }

      

      console.log('Saving to artist:', artist.id, fileUrl);

      await base44.entities.Artist.update(artist.id, { profile_photo_url: fileUrl });

      

      setArtist(prev => ({ ...prev, profile_photo_url: fileUrl }));

      console.log('Image saved successfully');

      

      if (fileInputRef.current) {

        fileInputRef.current.value = '';

      }

    } catch (err) {

      console.error('Error uploading image:', err);

      toastError('Upload Failed', 'Failed to upload image: ' + err.message);

    } finally {

      setUploadingImage(false);

    }

  };



  const handleSaveLocation = async () => {

    if (!artist) return;

    try {

      await base44.entities.Artist.update(artist.id, { based_in_city: profileLocation });

      setArtist(prev => ({ ...prev, based_in_city: profileLocation }));

      setEditingLocation(false);

    } catch (err) {

      console.error('Error saving location:', err);

      notifyError('Save Failed', 'Failed to save location');

    }

  };



  const handleSaveBio = async () => {

    if (!artist) return;

    try {

      await base44.entities.Artist.update(artist.id, { bio: profileBio });

      setArtist(prev => ({ ...prev, bio: profileBio }));

      setEditingBio(false);

    } catch (err) {

      console.error('Error saving bio:', err);

      toastError('Save Failed', 'Failed to save bio');

    }

  };



  const handleSaveSocial = async () => {

    if (!artist) return;

    try {

      await base44.entities.Artist.update(artist.id, {

        website: profileWebsite,

        instagram: profileInstagram,

        linkedin: profileLinkedin

      });

      setArtist(prev => ({

        ...prev,

        website: profileWebsite,

        instagram: profileInstagram,

        linkedin: profileLinkedin

      }));

      setEditingSocial(false);

    } catch (err) {

      console.error('Error saving social links:', err);

      toastError('Save Failed', 'Failed to save social links');

    }

  };



  const handleAddPortfolioClip = async () => {

    if (!artist || !portfolioForm.title) {

      toastError('Validation Error', 'Please fill in the required fields');

      return;

    }



    setUploadingVideo(true);

    try {

      let videoUrl = '';

      let thumbnailUrl = '';



      if (videoInputRef.current?.files?.[0]) {

        const videoFile = videoInputRef.current.files[0];

        const uploadResponse = await base44.integrations.Core.UploadFile({ file: videoFile });

        videoUrl = uploadResponse.file_url || uploadResponse.url;

      }



      const newClip = await base44.entities.PortfolioClip.create({

        uploaded_by_type: 'artist',

        uploaded_by_id: artist.id,

        title: portfolioForm.title,

        project_type: portfolioForm.project_type,

        description: portfolioForm.description,

        role: portfolioForm.role,

        video_url: videoUrl,

        thumbnail_url: thumbnailUrl,

        status: 'approved'

      });



      setPortfolioClips(prev => [...prev, newClip]);

      setShowPortfolioModal(false);

      setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '' });

      

      if (videoInputRef.current) {

        videoInputRef.current.value = '';

      }

    } catch (err) {

      console.error('Error adding portfolio clip:', err);

      toastError('Upload Failed', 'Failed to add portfolio clip: ' + err.message);

    } finally {

      setUploadingVideo(false);

    }

  };



  const handleDeletePortfolioClip = async (clipId) => {

    const confirmed = await confirmDialog('Delete portfolio clip?', 'This action cannot be undone');

    if (!confirmed) return;



    try {

      await base44.entities.PortfolioClip.delete(clipId);

      setPortfolioClips(prev => prev.filter(clip => clip.id !== clipId));

    } catch (err) {

      console.error('Error deleting portfolio clip:', err);

      toastError('Delete Failed', 'Failed to delete portfolio clip');

    }

  };



  const handleEditPortfolioClip = (clip) => {

    setEditingPortfolio(clip);

    setPortfolioForm({

      title: clip.title,

      project_type: clip.project_type || 'commercial',

      description: clip.description || '',

      role: clip.role || ''

    });

    setShowPortfolioModal(true);

  };



  const handleUpdatePortfolioClip = async () => {

    if (!editingPortfolio) return;



    try {

      let videoUrl = editingPortfolio.video_url;

      let thumbnailUrl = editingPortfolio.thumbnail_url;



      if (videoInputRef.current?.files?.[0]) {

        const videoFile = videoInputRef.current.files[0];

        const uploadResponse = await base44.integrations.Core.UploadFile({ file: videoFile });

        videoUrl = uploadResponse.file_url || uploadResponse.url;

      }



      const updatedClip = await base44.entities.PortfolioClip.update(editingPortfolio.id, {

        title: portfolioForm.title,

        project_type: portfolioForm.project_type,

        description: portfolioForm.description,

        role: portfolioForm.role,

        video_url: videoUrl,

        thumbnail_url: thumbnailUrl

      });



      setPortfolioClips(prev => prev.map(clip => 

        clip.id === editingPortfolio.id ? updatedClip : clip

      ));

      setShowPortfolioModal(false);

      setEditingPortfolio(null);

      setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '' });

      

      if (videoInputRef.current) {

        videoInputRef.current.value = '';

      }

    } catch (err) {

      console.error('Error updating portfolio clip:', err);

      toastError('Update Failed', 'Failed to update portfolio clip: ' + err.message);

    }

  };



  return (

    <div className="h-full bg-white">

      <main className="w-full h-full overflow-auto">

        <div className="bg-white h-32" />

        

        <div className="max-w-7xl mx-auto px-12 pb-12">

          {/* Profile Header */}

          <div className="flex items-start gap-6 -mt-16 relative z-10 mb-8">

            <div className="relative group">

              {artist?.profile_photo_url ? (

                <img

                  src={artist.profile_photo_url}

                  alt="Profile"

                  className="w-40 h-40 rounded-full border-4 border-white object-cover flex-shrink-0"

                />

              ) : (

                <div className="w-40 h-40 bg-black rounded-full border-4 border-white flex-shrink-0" />

              )}

              <input

                ref={fileInputRef}

                type="file"

                accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp"

                onChange={handleProfileImageUpload}

                disabled={uploadingImage}

                className="hidden"

              />

              <label onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">

                <span className="text-white text-sm font-medium">{uploadingImage ? 'Uploading...' : 'Change'}</span>

              </label>

            </div>

            <div className="flex-1 pt-8">

              {/* Name Section */}

              {editingName ? (

                <div className="flex gap-2 mb-2">

                  <input

                    type="text"

                    value={profileName}

                    onChange={(e) => setProfileName(e.target.value)}

                    className="text-3xl font-bold px-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-gray-400 flex-1"

                  />

                  <Button size="sm" onClick={async () => {

                    if (artist && profileName) {

                      await base44.entities.Artist.update(artist.id, { full_name: profileName });

                      setEditingName(false);

                    }

                  }} className="bg-black text-white hover:bg-gray-800">Save</Button>

                </div>

              ) : (

                <div className="flex items-center gap-3 mb-1">

                  <h1 className="text-3xl font-bold text-gray-900">{profileName || artist?.full_name}</h1>

                  <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-gray-600">

                    <Edit2 className="w-4 h-4" />

                  </button>

                </div>

              )}



              {/* Role Section */}

              {editingRole ? (

                <div className="flex gap-2 mb-3">

                  <input

                    type="text"

                    value={profileRole}

                    onChange={(e) => setProfileRole(e.target.value)}

                    placeholder="Your role/title"

                    className="text-base px-2 border border-gray-300 rounded text-gray-600 focus:outline-none focus:border-gray-400 flex-1"

                  />

                  <Button size="sm" onClick={async () => {

                    if (artist && profileRole) {

                      await base44.entities.Artist.update(artist.id, { role: profileRole });

                      setEditingRole(false);

                    }

                  }} className="bg-black text-white hover:bg-gray-800">Save</Button>

                </div>

              ) : (

                <div className="flex items-center gap-2 mb-3">

                  <p className="text-gray-600 text-base">

                    {profileRole || artist?.role || 'Add your role'}

                  </p>

                  <button onClick={() => setEditingRole(true)} className="text-gray-400 hover:text-gray-600">

                    <Edit2 className="w-4 h-4" />

                  </button>

                </div>

              )}



              {/* Location & Contact Info */}

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">

                {editingLocation ? (

                  <div className="flex gap-2 items-center">

                    <MapPin className="w-4 h-4" />

                    <input

                      type="text"

                      value={profileLocation}

                      onChange={(e) => setProfileLocation(e.target.value)}

                      placeholder="City, Country"

                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"

                    />

                    <Button size="sm" onClick={handleSaveLocation} className="bg-black text-white hover:bg-gray-800 px-3 py-1">Save</Button>

                    <Button size="sm" onClick={() => setEditingLocation(false)} variant="outline" className="px-3 py-1">Cancel</Button>

                  </div>

                ) : (

                  <div className="flex items-center gap-2">

                    {artist?.based_in_city && (

                      <div className="flex items-center gap-1">

                        <MapPin className="w-4 h-4" />

                        {artist.based_in_city}, {artist.based_in_country}

                      </div>

                    )}

                    <button onClick={() => setEditingLocation(true)} className="text-gray-400 hover:text-gray-600">

                      <Edit2 className="w-3 h-3" />

                    </button>

                  </div>

                )}

                {user?.email && (

                  <p>{user.email}</p>

                )}

              </div>



              {/* Social Links */}

              {editingSocial ? (

                <div className="flex flex-col gap-2 mb-3">

                  <div className="flex gap-2 items-center">

                    <Globe className="w-4 h-4 text-gray-400" />

                    <input

                      type="text"

                      value={profileWebsite}

                      onChange={(e) => setProfileWebsite(e.target.value)}

                      placeholder="Website URL"

                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                    />

                  </div>

                  <div className="flex gap-2 items-center">

                    <Instagram className="w-4 h-4 text-gray-400" />

                    <input

                      type="text"

                      value={profileInstagram}

                      onChange={(e) => setProfileInstagram(e.target.value)}

                      placeholder="Instagram URL"

                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                    />

                  </div>

                  <div className="flex gap-2 items-center">

                    <Linkedin className="w-4 h-4 text-gray-400" />

                    <input

                      type="text"

                      value={profileLinkedin}

                      onChange={(e) => setProfileLinkedin(e.target.value)}

                      placeholder="LinkedIn URL"

                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                    />

                  </div>

                  <div className="flex gap-2 mt-2">

                    <Button size="sm" onClick={handleSaveSocial} className="bg-black text-white hover:bg-gray-800">Save</Button>

                    <Button size="sm" onClick={() => setEditingSocial(false)} variant="outline">Cancel</Button>

                  </div>

                </div>

              ) : (

                <div className="flex items-center gap-3 mb-3">

                  {artist?.website && (

                    <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Website">

                      <Globe className="w-5 h-5" />

                    </a>

                  )}

                  {artist?.instagram && (

                    <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Instagram">

                      <Instagram className="w-5 h-5" />

                    </a>

                  )}

                  {artist?.linkedin && (

                    <a href={artist.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="LinkedIn">

                      <Linkedin className="w-5 h-5" />

                    </a>

                  )}

                  <button onClick={() => setEditingSocial(true)} className="text-gray-400 hover:text-gray-600">

                    <Edit2 className="w-4 h-4" />

                  </button>

                </div>

              )}



              {/* Bio Section */}

              {editingBio ? (

                <div className="mb-4">

                  <textarea

                    value={profileBio}

                    onChange={(e) => setProfileBio(e.target.value)}

                    placeholder="Tell us about yourself..."

                    rows={3}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"

                  />

                  <div className="flex gap-2 mt-2">

                    <Button size="sm" onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save</Button>

                    <Button size="sm" onClick={() => setEditingBio(false)} variant="outline">Cancel</Button>

                  </div>

                </div>

              ) : (

                <div className="mb-4">

                  {artist?.bio ? (

                    <p className="text-gray-700 text-sm leading-relaxed">{artist.bio}</p>

                  ) : (

                    <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 text-sm">Add bio</button>

                  )}

                  {artist?.bio && (

                    <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 ml-2">

                      <Edit2 className="w-3 h-3 inline" />

                    </button>

                  )}

                </div>

              )}

            </div>

            <div className="flex items-center gap-2 pt-8">

              <Button variant="ghost" className="p-2">

                <MoreHorizontal className="w-5 h-5" />

              </Button>

            </div>

          </div>



          {/* Tabs */}

          <div className="flex items-center justify-between border-b border-gray-200 mb-8">

            <div className="flex gap-8">

              <button

                onClick={() => setActiveTab('work')}

                className={`py-4 px-1 font-semibold transition-colors relative ${

                  activeTab === 'work'

                    ? 'text-gray-900'

                    : 'text-gray-500 hover:text-gray-900'

                }`}

              >

                Work

                {activeTab === 'work' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}

              </button>

              <button

                onClick={() => setActiveTab('about')}

                className={`py-4 px-1 font-semibold transition-colors relative ${

                  activeTab === 'about'

                    ? 'text-gray-900'

                    : 'text-gray-500 hover:text-gray-900'

                }`}

              >

                About

                {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}

              </button>

            </div>



            {/* Filters (only on Work tab) */}

            {activeTab === 'work' && (

              <div className="flex items-center gap-3">

                <div className="relative">

                  <button

                    onClick={() => {

                      setShowRolesDropdown(!showRolesDropdown);

                      setShowProjectTypesDropdown(false);

                    }}

                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                  >

                    Roles <ChevronDown className="w-4 h-4" />

                  </button>

                  {showRolesDropdown && (

                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">

                      <button

                        onClick={() => {

                          setSelectedRoleFilter('all');

                          setShowRolesDropdown(false);

                        }}

                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"

                      >

                        All Roles

                        {selectedRoleFilter === 'all' && <span className="text-xs">✓</span>}

                      </button>

                      {allRoles.map(role => (

                        <button

                          key={role}

                          onClick={() => {

                            setSelectedRoleFilter(role);

                            setShowRolesDropdown(false);

                          }}

                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"

                        >

                          {role}

                          {selectedRoleFilter === role && <span className="text-xs">✓</span>}

                        </button>

                      ))}

                    </div>

                  )}

                </div>



                <div className="relative">

                  <button

                    onClick={() => {

                      setShowProjectTypesDropdown(!showProjectTypesDropdown);

                      setShowRolesDropdown(false);

                    }}

                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                  >

                    Project types <ChevronDown className="w-4 h-4" />

                  </button>

                  {showProjectTypesDropdown && (

                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">

                      <button

                        onClick={() => {

                          setSelectedProjectTypeFilter('all');

                          setShowProjectTypesDropdown(false);

                        }}

                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"

                      >

                        All Types

                        {selectedProjectTypeFilter === 'all' && <span className="text-xs">✓</span>}

                      </button>

                      {allProjectTypes.map(type => (

                        <button

                          key={type}

                          onClick={() => {

                            setSelectedProjectTypeFilter(type);

                            setShowProjectTypesDropdown(false);

                          }}

                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"

                        >

                          {type}

                          {selectedProjectTypeFilter === type && <span className="text-xs">✓</span>}

                        </button>

                      ))}

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>



          {/* Work Tab */}

          {activeTab === 'work' && (

            <div>

              <div className="grid grid-cols-3 gap-6 mb-12">

                {/* Add Portfolio Button */}

                <button

                  onClick={() => setShowPortfolioModal(true)}

                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg aspect-video flex flex-col items-center justify-center hover:bg-gray-100 transition-colors group"

                >

                  <Plus className="w-8 h-8 mb-2 text-gray-400" />

                  <p className="text-sm font-medium text-gray-600">Add work</p>

                </button>



                {filteredClips.length > 0 ? (

                  filteredClips.map((clip) => (

                    <div key={clip.id} className="group cursor-pointer relative">

                      <div className="relative bg-gray-900 aspect-video rounded-lg mb-3 overflow-hidden">

                        {clip.thumbnail_url ? (

                          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />

                        ) : (

                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">

                            <Play className="w-12 h-12 text-white opacity-60" />

                          </div>

                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">

                            <Play className="w-8 h-8 text-gray-900 ml-1" />

                          </div>

                        </div>

                        {/* Edit/Delete Overlay */}

                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                          <button

                            onClick={(e) => { e.stopPropagation(); handleEditPortfolioClip(clip); }}

                            className="p-2 bg-white rounded-full hover:bg-gray-100"

                          >

                            <Edit2 className="w-4 h-4 text-gray-900" />

                          </button>

                          <button

                            onClick={(e) => { e.stopPropagation(); handleDeletePortfolioClip(clip.id); }}

                            className="p-2 bg-red-500 rounded-full hover:bg-red-600"

                          >

                            <X className="w-4 h-4 text-white" />

                          </button>

                        </div>

                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{clip.title || 'Untitled Project'}</h3>

                      <p className="text-xs text-gray-600">

                        {(clip.project_type || 'other').charAt(0).toUpperCase() + (clip.project_type || 'other').slice(1).replace(/_/g, ' ')}

                      </p>

                    </div>

                  ))

                ) : null}

              </div>



              {/* Testimonials Section */}

              <div className="mb-12">

                <h3 className="text-xl font-bold text-gray-900 mb-6">Testimonials</h3>

                <div className="space-y-4">

                  {testimonials.length > 0 ? (

                    testimonials.map((testimonial) => (

                      <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">

                        <div className="flex items-start gap-4">

                          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />

                          <div className="flex-1">

                            <div className="flex items-start justify-between mb-2">

                              <div>

                                <h4 className="font-semibold text-gray-900">{testimonial.author_name}</h4>

                                <p className="text-sm text-gray-600">{testimonial.author_title}</p>

                              </div>

                              {testimonial.rating && (

                                <div className="flex items-center gap-1">

                                  {[...Array(5)].map((_, i) => (

                                    <Star 

                                      key={i} 

                                      className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 

                                    />

                                  ))}

                                </div>

                              )}

                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed mb-2">{testimonial.content}</p>

                            {testimonial.project_name && (

                              <p className="text-xs text-gray-500">Project: {testimonial.project_name}</p>

                            )}

                          </div>

                        </div>

                      </div>

                    ))

                  ) : (

                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">

                      <p className="text-sm">No testimonials yet</p>

                    </div>

                  )}

                </div>

              </div>

            </div>

          )}



          {/* About Tab */}

          {activeTab === 'about' && (

            <AboutSection artist={artist} endorsements={endorsements} />

          )}

        </div>

      </main>



      {/* Add/Edit Portfolio Modal */}

      {showPortfolioModal && (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">

            <h3 className="text-lg font-bold text-gray-900 mb-4">

              {editingPortfolio ? 'Edit Portfolio Item' : 'Add Work to Portfolio'}

            </h3>

            <p className="text-sm text-gray-600 mb-4">

              {editingPortfolio ? 'Update your portfolio item' : 'Upload a video clip to showcase your work'}

            </p>

            

            <div className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>

                <input

                  type="text"

                  value={portfolioForm.title}

                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}

                  placeholder="Enter project title"

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>

                <select

                  value={portfolioForm.project_type}

                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, project_type: e.target.value }))}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"

                >

                  <option value="commercial">Commercial</option>

                  <option value="music_video">Music Video</option>

                  <option value="documentary">Documentary</option>

                  <option value="short_film">Short Film</option>

                  <option value="film">Film</option>

                  <option value="other">Other</option>

                </select>

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>

                <input

                  type="text"

                  value={portfolioForm.role}

                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, role: e.target.value }))}

                  placeholder="e.g., Director, Cinematographer"

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>

                <textarea

                  value={portfolioForm.description}

                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}

                  placeholder="Describe the project..."

                  rows={3}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>

                <div 

                  onClick={() => videoInputRef.current?.click()}

                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"

                >

                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />

                  <p className="text-sm text-gray-600">Click to upload video</p>

                  <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 100MB</p>

                  {videoInputRef.current?.files?.[0] && (

                    <p className="text-xs text-gray-700 mt-2">{videoInputRef.current.files[0].name}</p>

                  )}

                </div>

                <input

                  ref={videoInputRef}

                  type="file"

                  accept="video/*"

                  className="hidden"

                  onChange={() => {}}

                />

              </div>

            </div>



            <div className="flex gap-2 mt-6">

              <Button 

                onClick={() => {

                  setShowPortfolioModal(false);

                  setEditingPortfolio(null);

                  setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '' });

                }} 

                variant="outline" 

                className="flex-1"

              >

                Cancel

              </Button>

              <Button 

                onClick={editingPortfolio ? handleUpdatePortfolioClip : handleAddPortfolioClip}

                disabled={uploadingVideo}

                className="flex-1 bg-black text-white hover:bg-gray-800"

              >

                {uploadingVideo ? 'Uploading...' : (editingPortfolio ? 'Update' : 'Add')}

              </Button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}
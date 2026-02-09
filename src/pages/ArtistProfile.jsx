import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import AboutSection from '../components/AboutSection';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Briefcase, MoreHorizontal, ChevronDown, Copy, Globe, Instagram, Linkedin, Star, ThumbsUp, Play, Users, Plus, Edit2 } from 'lucide-react';

export default function ArtistProfile() {
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
  const [editingName, setEditingName] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profileRole, setProfileRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

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
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchData();
  }, [user]);

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

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full overflow-auto pl-20">
        <div className="bg-white h-32" />
        
        <div className="max-w-7xl mx-auto px-12 pb-12">
          {/* Profile Header */}
          <div className="flex items-start gap-6 -mt-16 relative z-10 mb-8">
            <div className="w-40 h-40 bg-black rounded-full border-4 border-white flex-shrink-0" />
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
                  <Button size="sm" onClick={() => setEditingName(false)} className="bg-black text-white hover:bg-gray-800">Save</Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{profileName}</h1>
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
                  <Button size="sm" onClick={() => setEditingRole(false)} className="bg-black text-white hover:bg-gray-800">Save</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-600 text-base">
                    {profileRole || 'Add your role'}
                  </p>
                  <button onClick={() => setEditingRole(true)} className="text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Location & Contact Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                {artist?.based_in_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {artist.based_in_city}, {artist.based_in_country}
                  </div>
                )}
                {user?.email && (
                  <p>{user.email}</p>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
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
              </div>
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

      {/* Add Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Work to Portfolio</h3>
            <p className="text-sm text-gray-600 mb-4">Upload a video clip to showcase your work</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 cursor-pointer hover:border-gray-400 transition-colors">
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload video</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 100MB</p>
            </div>

            <input type="text" placeholder="Project title" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-gray-400" />
            
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:border-gray-400">
              <option>Select project type</option>
              <option>Commercial</option>
              <option>Music Video</option>
              <option>Documentary</option>
              <option>Short Film</option>
              <option>Other</option>
            </select>

            <div className="flex gap-2">
              <Button onClick={() => setShowPortfolioModal(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={() => {
                setShowPortfolioModal(false);
                // TODO: Handle upload
              }} className="flex-1 bg-black text-white hover:bg-gray-800">Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { Edit2, MapPin, MessageCircle, Briefcase, MoreHorizontal, ChevronDown, Copy, Globe, Instagram, Linkedin, Star, ThumbsUp, Play } from 'lucide-react';

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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{artist?.full_name || user.full_name}</h1>
              <p className="text-gray-600 text-base mb-3">
                {artist?.role ? artist.role.charAt(0).toUpperCase() + artist.role.slice(1).replace(/_/g, ', ') : 'Creative Professional'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {artist?.based_in_city || 'Location'}, {artist?.based_in_country || 'Country'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {Math.floor(Math.random() * 200) + 50} Mutuals
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <Button className="bg-black text-white hover:bg-gray-800 px-6">
                <Copy className="w-4 h-4 mr-2" />
                Copy link
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 px-6">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 px-6">
                <Briefcase className="w-4 h-4 mr-2" />
                Invite to Job
              </Button>
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
                {filteredClips.length > 0 ? (
                  filteredClips.map((clip) => (
                    <div key={clip.id} className="group cursor-pointer">
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
                ) : (
                  <div className="col-span-3 text-center py-16 text-gray-500">
                    <p>No portfolio work yet. Upload your first project!</p>
                  </div>
                )}
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
            <div className="grid grid-cols-3 gap-12">
              {/* Left Column - Main Info */}
              <div className="col-span-2 space-y-8">
                {/* Past Clients */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Past clients</h3>
                  <div className="flex flex-wrap gap-4">
                    {['Travis Scott', 'Nike', 'Offset'].map((client) => (
                      <div key={client} className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {client.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills with Endorsements */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {artist?.skills_experience?.map((skillObj) => {
                      const endorsementCount = groupedEndorsements[skillObj.skill]?.length || 0;
                      return (
                        <button 
                          key={skillObj.skill} 
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800 hover:border-gray-300 transition-colors flex items-center gap-2"
                        >
                          {skillObj.skill}
                          {endorsementCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <ThumbsUp className="w-3 h-3" />
                              {endorsementCount}
                            </span>
                          )}
                        </button>
                      );
                    }) || ['After Effects', 'Adobe Premiere Pro', 'Concept Art', 'Creative Direction', 'Editing', 'Fashion Videography', 'Sound Design', 'Treatment Design', 'Visual Research'].map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Types */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Project types</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Branded Content', 'Branding', 'Campaigns', 'Commercials', 'Cover Artwork', 'Editorials', 'Music Videos'].map((type) => (
                      <span key={type} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Languages</h3>
                  <p className="text-gray-800">
                    {artist?.languages_spoken?.join(', ') || 'English'}
                  </p>
                </div>
              </div>

              {/* Right Column - Contact & Rep */}
              <div className="space-y-8">
                {/* Contact */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Contact</h3>
                  <div className="space-y-3">
                    {artist?.website && (
                      <a href={artist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                    {artist?.instagram && (
                      <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
                        <Instagram className="w-4 h-4" />
                        <span className="text-sm">Instagram</span>
                      </a>
                    )}
                    {artist?.linkedin && (
                      <a href={artist.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Representation */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Representation</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">Studio 22</div>
                      <div className="text-xs text-gray-600">Agency</div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
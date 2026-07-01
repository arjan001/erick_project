import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Artist, PortfolioClip, Endorsement, Testimonial, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Briefcase, MoreHorizontal, ChevronDown, Globe, Instagram, Linkedin, Star, ThumbsUp, Play, Users, Crown } from 'lucide-react';
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge';

export default function ArtistPublicProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [viewedArtist, setViewedArtist] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionPackage, setSubscriptionPackage] = useState(null);
  const [activeTab, setActiveTab] = useState('work');
  const [showRolesDropdown, setShowRolesDropdown] = useState(false);
  const [showProjectTypesDropdown, setShowProjectTypesDropdown] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedProjectTypeFilter, setSelectedProjectTypeFilter] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const artistId = searchParams.get('id');
    if (!artistId) return;

    const fetchData = async () => {
      try {
        const artistsData = await Artist.filter({ id: artistId });
        if (artistsData.length > 0) {
          setViewedArtist(artistsData[0]);

          const clipsData = await PortfolioClip.filter({ 
            uploaded_by_type: 'artist', 
            uploaded_by_id: artistId,
            status: 'approved'
          });
          setPortfolioClips(clipsData);
        }

        const endorsementsData = await Endorsement.filter({ 
          recipient_email: artistsData[0]?.email 
        });
        setEndorsements(endorsementsData);

        const testimonialsData = await Testimonial.filter({ 
          recipient_email: artistsData[0]?.email 
        });
        setTestimonials(testimonialsData);

        // Fetch subscription
        try {
          const subsData = await Subscription.filter({ 
            user_email: artistsData[0]?.email, 
            status: 'active' 
          });
          if (subsData.length > 0) {
            setSubscription(subsData[0]);
            const pkgData = await SubscriptionPackage.get(subsData[0].package_id);
            setSubscriptionPackage(pkgData);
          }
        } catch (subErr) {
          console.error('Error fetching subscription:', subErr);
        }
      } catch (err) {
        console.error('Error fetching artist data:', err);
      }
    };

    fetchData();
  }, [searchParams]);

  if (!viewedArtist) return null;

  const allRoles = [...new Set(portfolioClips.map(clip => 
    (clip.project_type || 'other').charAt(0).toUpperCase() + (clip.project_type || 'other').slice(1).replace(/_/g, ' ')
  ))];

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

  const groupedEndorsements = endorsements.reduce((acc, e) => {
    if (!acc[e.skill]) acc[e.skill] = [];
    acc[e.skill].push(e);
    return acc;
  }, {});

  return (
    <div className="h-screen bg-white">
      {user && <ArtistSidebar />}
      
      <main className={`w-full h-full overflow-auto ${user ? 'pl-20' : ''}`}>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 h-48" />
        
        <div className="max-w-7xl mx-auto px-12 pb-12">
          {/* Profile Header */}
          <div className="flex items-start gap-6 -mt-24 relative z-10 mb-8">
            <div className="w-40 h-40 bg-gray-300 rounded-full border-4 border-white flex-shrink-0" />
            <div className="flex-1 pt-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{viewedArtist.full_name}</h1>
                {subscriptionPackage && (
                  <SubscriptionBadge subscription={subscription} package={subscriptionPackage} />
                )}
              </div>
              <p className="text-gray-600 text-base mb-3">
                {viewedArtist.role ? viewedArtist.role.charAt(0).toUpperCase() + viewedArtist.role.slice(1).replace(/_/g, ', ') : 'Creative Professional'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {viewedArtist.based_in_city || 'Location'}, {viewedArtist.based_in_country || 'Country'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {Math.floor(Math.random() * 200) + 50} Mutuals
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-8">
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
                  activeTab === 'work' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Work
                {activeTab === 'work' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 font-semibold transition-colors relative ${
                  activeTab === 'about' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                About
                {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
              </button>
            </div>

            {activeTab === 'work' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowRolesDropdown(!showRolesDropdown)}
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
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        All Roles
                      </button>
                      {allRoles.map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            setSelectedRoleFilter(role);
                            setShowRolesDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {role}
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
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{clip.title || 'Untitled'}</h3>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-16 text-gray-500">
                    <p>No portfolio work</p>
                  </div>
                )}
              </div>

              {/* Testimonials */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Testimonials</h3>
                <div className="space-y-4">
                  {testimonials.length > 0 ? (
                    testimonials.map((t) => (
                      <div key={t.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{t.author_name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{t.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No testimonials yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2 space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewedArtist.skills_experience?.map((s) => (
                      <span key={s.skill} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800 flex items-center gap-2">
                        {s.skill}
                        {groupedEndorsements[s.skill]?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <ThumbsUp className="w-3 h-3" />
                            {groupedEndorsements[s.skill].length}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Languages</h3>
                  <p className="text-gray-800">{viewedArtist.languages_spoken?.join(', ') || 'English'}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Contact</h3>
                  <div className="space-y-3">
                    {viewedArtist.website && (
                      <a href={viewedArtist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                    {viewedArtist.instagram && (
                      <a href={viewedArtist.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
                        <Instagram className="w-4 h-4" /> Instagram
                      </a>
                    )}
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
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Artist, PortfolioClip, Endorsement, Testimonial, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';
import { createPageUrl } from '@/shared/utils/routing';
import ShareProfileButton from '@/components/artist/ShareProfileButton';
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge';
import {
  MapPin, MessageCircle, Globe, Instagram, Linkedin, Star, ThumbsUp,
  Play, BadgeCheck, Film, Quote, Sparkles
} from 'lucide-react';

export default function ArtistPublicProfile() {
  const [searchParams] = useSearchParams();
  const [viewer, setViewer] = useState(null);
  const [viewedArtist, setViewedArtist] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionPackage, setSubscriptionPackage] = useState(null);
  const [activeClip, setActiveClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (storedUser) setViewer(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const artistId = searchParams.get('id');
    if (!artistId) { setLoading(false); setNotFound(true); return; }

    const fetchData = async () => {
      try {
        const artistsData = await Artist.filter({ id: artistId });
        const artist = artistsData?.[0];
        if (!artist) { setNotFound(true); setLoading(false); return; }
        setViewedArtist(artist);

        const [clipsData, endorsementsData, testimonialsData] = await Promise.all([
          PortfolioClip.filter({ uploaded_by_type: 'artist', uploaded_by_id: artistId, status: 'approved' }),
          Endorsement.filter({ recipient_email: artist.email }),
          Testimonial.filter({ recipient_email: artist.email }),
        ]);
        setPortfolioClips(clipsData || []);
        setEndorsements(endorsementsData || []);
        setTestimonials(testimonialsData || []);

        try {
          const subsData = await Subscription.filter({ user_email: artist.email, status: 'active' });
          if (subsData?.length > 0) {
            setSubscription(subsData[0]);
            const pkgData = await SubscriptionPackage.get(subsData[0].package_id);
            setSubscriptionPackage(pkgData);
          }
        } catch (subErr) {
          console.error('Error fetching subscription:', subErr);
        }
      } catch (err) {
        console.error('Error fetching artist data:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !viewedArtist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h1>
        <p className="text-gray-500 mb-6">This artist profile doesn't exist or is no longer available.</p>
        <Link to="/" className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const groupedEndorsements = endorsements.reduce((acc, e) => {
    if (!acc[e.skill]) acc[e.skill] = [];
    acc[e.skill].push(e);
    return acc;
  }, {});

  const avgRating = testimonials.length
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length || 0).toFixed(1)
    : null;

  const memberSince = viewedArtist.created_at ? new Date(viewedArtist.created_at).getFullYear() : null;

  const formatLabel = (val) => (val || 'other').charAt(0).toUpperCase() + (val || 'other').slice(1).replace(/_/g, ' ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero cover */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Profile header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 -mt-20 relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 sm:-mt-20 mb-4">
            {viewedArtist.profile_photo_url ? (
              <img
                src={viewedArtist.profile_photo_url}
                alt={viewedArtist.full_name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white object-cover shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-gray-700 to-gray-900 shadow-md flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{viewedArtist.full_name?.[0]?.toUpperCase()}</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{viewedArtist.full_name}</h1>
                {subscriptionPackage && <SubscriptionBadge subscription={subscription} package={subscriptionPackage} />}
                <BadgeCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-gray-600 font-medium mb-2">
                {viewedArtist.role ? formatLabel(viewedArtist.role) : 'Creative Professional'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                {(viewedArtist.based_in_city || viewedArtist.based_in_country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {[viewedArtist.based_in_city, viewedArtist.based_in_country].filter(Boolean).join(', ')}
                  </span>
                )}
                {memberSince && <span>Member since {memberSince}</span>}
                {avgRating && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {avgRating}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {viewer ? (
                <Link
                  to={createPageUrl('Messages')}
                  className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              ) : (
                <Link
                  to={createPageUrl('SignIn')}
                  className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Sign in to Contact
                </Link>
              )}
              <ShareProfileButton artistId={viewedArtist.id} />
            </div>
          </div>

          {/* Bio */}
          {viewedArtist.bio && (
            <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mb-4">{viewedArtist.bio}</p>
          )}

          {/* Socials */}
          {(viewedArtist.website || viewedArtist.instagram || viewedArtist.linkedin) && (
            <div className="flex items-center gap-3 mb-2">
              {viewedArtist.website && (
                <a href={viewedArtist.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {viewedArtist.instagram && (
                <a href={viewedArtist.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {viewedArtist.linkedin && (
                <a href={viewedArtist.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          {/* Skills */}
          {viewedArtist.skills_experience?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {viewedArtist.skills_experience.map((s) => (
                <span key={s.skill} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  {s.skill}
                  {groupedEndorsements[s.skill]?.length > 0 && (
                    <span className="flex items-center gap-0.5 text-indigo-600">
                      <ThumbsUp className="w-3 h-3" /> {groupedEndorsements[s.skill].length}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{portfolioClips.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Projects</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{testimonials.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Testimonials</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{endorsements.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Endorsements</div>
          </div>
        </div>

        {/* Work gallery */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Film className="w-5 h-5 text-gray-700" /> Work
          </h2>
          {portfolioClips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {portfolioClips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => (clip.original_video_url || clip.video_embed_url) && setActiveClip(clip)}
                  className="group text-left bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative bg-gray-900 aspect-video overflow-hidden">
                    {clip.thumbnail_url ? (
                      <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white/50" />
                      </div>
                    )}
                    {(clip.original_video_url || clip.video_embed_url) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{clip.title || 'Untitled'}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatLabel(clip.project_type)}</span>
                      {clip.role && <><span>•</span><span>{clip.role}</span></>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
              No published work yet
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Quote className="w-5 h-5 text-gray-700" /> Testimonials
          </h2>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 font-semibold text-gray-600 text-sm">
                      {t.author_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{t.author_name}</h4>
                      {t.rating && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{t.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
              No testimonials yet
            </div>
          )}
        </div>
      </div>

      {/* Video lightbox */}
      {activeClip && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setActiveClip(null)}>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {activeClip.video_embed_url ? (
              <iframe src={activeClip.video_embed_url} className="w-full aspect-video rounded-lg bg-black" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={activeClip.title} />
            ) : (
              <video src={activeClip.original_video_url} controls autoPlay className="w-full rounded-lg" />
            )}
            <p className="text-white text-sm mt-3">{activeClip.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
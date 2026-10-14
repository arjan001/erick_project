import React, { useState, useEffect } from 'react'
import { Artist, PortfolioClip, ArtistMedia, Endorsement, Testimonial, Subscription, SubscriptionPackage, Application, Job } from '@/lib/supabaseEntities'
import { X, MapPin, Star, MessageCircle, BadgeCheck, Share2, Calendar, Globe, Instagram, Linkedin, Twitter, Youtube, Film, Sparkles, ChevronDown, ChevronUp, Play, Image as ImageIcon } from 'lucide-react'
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge'
import ShareProfileButton from '@/components/artist/ShareProfileButton'
import { createPageUrl } from '@/shared/utils/routing'
import { useAuth } from '@/lib/AuthContext'

export default function ArtistProfileDrawer({ artistId, isOpen, onClose }) {
  const { user: authUser } = useAuth()
  const [artist, setArtist] = useState(null)
  const [portfolioClips, setPortfolioClips] = useState([])
  const [artistMedia, setArtistMedia] = useState([])
  const [endorsements, setEndorsements] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [applications, setApplications] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subscriptionPackage, setSubscriptionPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeClip, setActiveClip] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    skills: false,
    credits: false,
    education: false,
    applications: false
  })

  useEffect(() => {
    if (!artistId || !isOpen) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const artistsData = await Artist.filter({ id: artistId })
        const artistData = artistsData?.[0]
        if (!artistData) return
        setArtist(artistData)

        const [clipsData, mediaData, endorsementsData, testimonialsData, applicationsData] = await Promise.all([
          PortfolioClip.filter({ uploaded_by_type: 'artist', uploaded_by_id: artistId, status: 'approved' }),
          ArtistMedia.filter({ artist_id: artistId, status: 'approved' }, 'order_index', 50),
          Endorsement.filter({ user_id: artistId }),
          Testimonial.filter({ user_id: artistId }),
          Application.filter({ user_id: artistId }, '-created_at', 10),
        ])
        setPortfolioClips(clipsData || [])
        setArtistMedia(mediaData || [])
        setEndorsements(endorsementsData || [])
        setTestimonials(testimonialsData || [])
        setApplications(applicationsData || [])

        // Fetch job details for applications
        const jobIds = applicationsData.map(app => app.job_id).filter(Boolean)
        if (jobIds.length > 0) {
          const jobsData = await Promise.all(
            jobIds.map(jobId => Job.get(jobId).catch(() => null))
          )
          const jobsMap = {}
          jobsData.forEach(job => {
            if (job) jobsMap[job.id] = job
          })
          setApplications(applicationsData.map(app => ({
            ...app,
            job: jobsMap[app.job_id] || null
          })))
        }

        try {
          const subsData = await Subscription.filter({ user_id: artistData.user_id, status: 'active' })
          if (subsData?.length > 0) {
            setSubscription(subsData[0])
            const pkgData = await SubscriptionPackage.get(subsData[0].package_id)
            setSubscriptionPackage(pkgData)
          }
        } catch (subErr) {
          //
        }
      } catch (err) {
        console.error('Error fetching artist profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [artistId, isOpen])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const avgRating = testimonials.length
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length || 0).toFixed(1)
    : null

  const memberSince = artist?.created_at ? new Date(artist.created_at).getFullYear() : null

  const formatLabel = (val) => (val || 'other').charAt(0).toUpperCase() + (val || 'other').slice(1).replace(/_/g, ' ')

  const appearance = artist?.appearance || {}
  const socialMedia = artist?.socialMedia || {}
  const credits = artist?.credits || { film: [], commercials: [] }
  const education = artist?.education || []
  const skills = artist?.skills || []

  if (!isOpen) return null

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Slide-over panel from right - 3/4 width */}
      <div
        className="fixed inset-y-0 right-0 w-3/4 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
      >
        <div className="h-full overflow-y-auto">
          {/* Panel header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">Artist Profile</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : !artist ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Profile not found
            </div>
          ) : (
            <div className="px-6 py-4 pb-20">
              {/* Hero cover */}
              <div className="relative h-56 sm:h-64 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 overflow-hidden rounded-xl mb-4">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              </div>

              {/* Profile header card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 -mt-20 relative z-10 p-6 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 sm:-mt-20 mb-4">
                  {artist.profile_photo_url ? (
                    <img
                      src={artist.profile_photo_url}
                      alt={artist.full_name}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white object-cover shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-gray-700 to-gray-900 shadow-md flex-shrink-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{artist.full_name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{artist.full_name}</h1>
                      {subscriptionPackage && <SubscriptionBadge subscription={subscription} package={subscriptionPackage} />}
                      <BadgeCheck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      {artist.profession || artist.role ? formatLabel(artist.profession || artist.role) : 'Creative Professional'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {(artist.based_in_city || artist.based_in_country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {[artist.based_in_city, artist.based_in_country].filter(Boolean).join(', ')}
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
                    {authUser ? (
                      <a
                        href={createPageUrl('Messages')}
                        className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Contact
                      </a>
                    ) : (
                      <a
                        href={createPageUrl('SignIn')}
                        className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Sign in to Contact
                      </a>
                    )}
                    <ShareProfileButton artistId={artist.id} />
                  </div>
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mb-4">{artist.bio}</p>
                )}

                {/* Socials */}
                {(artist.website || socialMedia.instagram || socialMedia.linkedin || socialMedia.twitter || socialMedia.youtube) && (
                  <div className="flex items-center gap-3 mb-2">
                    {artist.website && (
                      <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {socialMedia.instagram && (
                      <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {socialMedia.linkedin && (
                      <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {socialMedia.twitter && (
                      <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {socialMedia.youtube && (
                      <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Portfolio/Reels - All media images */}
              {(portfolioClips.length > 0 || artistMedia.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-600" />
                    Portfolio & Reels
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portfolioClips.map((clip) => (
                      <div
                        key={clip.id}
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setActiveClip(clip)}
                      >
                        {clip.thumbnail_url ? (
                          <img
                            src={clip.thumbnail_url}
                            alt={clip.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Film className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                    {artistMedia.map((media) => (
                      <div
                        key={media.id}
                        className={`relative ${media.media_type === 'video' ? 'aspect-video' : 'aspect-square'} bg-gray-100 rounded-lg overflow-hidden cursor-pointer group`}
                        onClick={() => setActiveClip(media)}
                      >
                        {media.thumbnail_url || media.media_url ? (
                          <img
                            src={media.thumbnail_url || media.media_url}
                            alt={media.title || 'Media'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            {media.media_type === 'video' ? (
                              <Film className="w-8 h-8 text-gray-400" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        )}
                        {media.media_type === 'video' && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <button
                    onClick={() => toggleSection('skills')}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Skills & Experience
                    </h3>
                    {expandedSections.skills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.skills && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Applications */}
              {applications.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <button
                    onClick={() => toggleSection('applications')}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Applications ({applications.length})
                    </h3>
                    {expandedSections.applications ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.applications && (
                    <div className="mt-4 space-y-3">
                      {applications.map((app) => (
                        <div key={app.id} className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{app.job?.title || 'Job'}</span>
                          <span className="ml-2 text-gray-500">- {app.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Video lightbox */}
          {activeClip && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setActiveClip(null)}>
              <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                {activeClip.video_embed_url ? (
                  <iframe src={activeClip.video_embed_url} className="w-full aspect-video rounded-lg bg-black" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={activeClip.title} />
                ) : (
                  <video src={activeClip.video_url} controls autoPlay className="w-full rounded-lg" />
                )}
                <p className="text-white text-sm mt-3">{activeClip.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

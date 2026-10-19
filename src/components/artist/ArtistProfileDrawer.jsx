import React, { useState, useEffect } from 'react'
import { Artist, PortfolioClip, ArtistMedia, Endorsement, Testimonial, Subscription, SubscriptionPackage, Application, Job } from '@/lib/supabaseEntities'
import { X, MapPin, Star, MessageCircle, BadgeCheck, Share2, Calendar, Globe, Instagram, Linkedin, Twitter, Youtube, Film, Sparkles, ChevronDown, ChevronUp, Play, Image as ImageIcon, Award, Briefcase, GraduationCap, FileText, ExternalLink, ThumbsUp, Mail, Phone, CreditCard, Shield } from 'lucide-react'
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
    applications: false,
    appearance: false,
    highlights: false
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
  const credits = artist?.credits || { film: [], commercials: [], television: [] }
  const education = artist?.education || []
  const skills = artist?.skills || []
  const unionMembership = artist?.unionMembership || []
  const licensePassport = artist?.licensePassport || {}

  // Combine portfolio clips and artist media for display
  const allMedia = [...portfolioClips, ...artistMedia]
  const displayMedia = allMedia.length > 0 ? allMedia : [
    { id: 1, title: 'Featured Project 1', thumbnail_url: null, video_url: null, media_type: 'video' },
    { id: 2, title: 'Featured Project 2', thumbnail_url: null, video_url: null, media_type: 'image' },
    { id: 3, title: 'Featured Project 3', thumbnail_url: null, video_url: null, media_type: 'image' },
    { id: 4, title: 'Featured Project 4', thumbnail_url: null, video_url: null, media_type: 'image' },
    { id: 5, title: 'Featured Project 5', thumbnail_url: null, video_url: null, media_type: 'image' },
  ]

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
              {/* Main Layout: Large image left, 4 small images right */}
              <div className="flex gap-4 mb-6">
                {/* Large main image */}
                <div className="flex-1">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden cursor-pointer group" onClick={() => displayMedia[0]?.video_url && setActiveClip(displayMedia[0])}>
                    {displayMedia[0]?.thumbnail_url ? (
                      <img src={displayMedia[0].thumbnail_url} alt={displayMedia[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : artist.profile_photo_url ? (
                      <img src={artist.profile_photo_url} alt={artist.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Play Intro Video
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 smaller images stacked vertically */}
                <div className="w-1/3 flex flex-col gap-2">
                  {displayMedia.slice(1, 5).map((item, idx) => (
                    <div key={item.id || idx} className="flex-1 relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden cursor-pointer group" onClick={() => item.video_url && setActiveClip(item)}>
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      {item.media_type === 'video' && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Name and Bio Section */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{artist.full_name || 'Artist Name'}</h1>
                  {subscriptionPackage && <SubscriptionBadge subscription={subscription} package={subscriptionPackage} />}
                  <BadgeCheck className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-lg text-gray-600 font-medium mb-3">
                  {artist.profession || artist.role ? formatLabel(artist.profession || artist.role) : 'Creative Professional'}
                </p>
                {artist.bio && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {artist.bio}
                  </p>
                )}
              </div>

              {/* Two-column layout for rest of content */}
              <div className="flex gap-6">
                {/* Left column - Main content */}
                <div className="flex-1 space-y-4">
                  {/* Acting & Performing Video Samples */}
                  {(portfolioClips.length > 0 || artistMedia.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Film className="w-4 h-4 text-gray-500" /> Acting & Performing Video Samples
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {displayMedia.slice(0, 6).map((item, idx) => (
                          <div key={item.id || idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group" onClick={() => item.video_url && setActiveClip(item)}>
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {item.media_type === 'video' && (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credits & Experience */}
                  {(credits.film?.length > 0 || credits.commercials?.length > 0 || credits.television?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" /> Credits & Experience
                      </h3>

                      {credits.film?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Film</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {credits.film.map((credit, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                {credit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {credits.television?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Television</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {credits.television.map((credit, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                {credit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {credits.commercials?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Commercials & Industrials</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {credits.commercials.map((credit, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                {credit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <button
                        onClick={() => toggleSection('skills')}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Award className="w-4 h-4 text-gray-500" /> Skills
                        </h3>
                        {expandedSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedSections.skills && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Education & Training */}
                  {education.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <button
                        onClick={() => toggleSection('education')}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-500" /> Education & Training
                        </h3>
                        {expandedSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedSections.education && (
                        <div className="mt-3 space-y-2">
                          {education.map((edu, idx) => (
                            <div key={idx} className="text-sm text-gray-700 p-2 bg-gray-50 rounded-lg">
                              <p className="font-medium text-gray-900">{edu.institution || 'Institution'}</p>
                              <p className="text-gray-600">{edu.degree || 'Degree'} {edu.year ? `(${edu.year})` : ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Self-Recording */}
                  {artist.self_recording_equipment && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" /> Self-Recording
                      </h3>
                      <p className="text-sm text-gray-700">{artist.self_recording_equipment}</p>
                    </div>
                  )}

                  {/* Highlights */}
                  {artist.highlights && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <button
                        onClick={() => toggleSection('highlights')}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gray-500" /> Highlights
                        </h3>
                        {expandedSections.highlights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedSections.highlights && (
                        <div className="mt-3 text-sm text-gray-700">
                          {artist.highlights}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right column - Actions and Info */}
                <div className="w-64 flex-shrink-0 space-y-4">
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {authUser ? (
                      <a
                        href={createPageUrl('Messages')}
                        className="w-full px-4 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Contact
                      </a>
                    ) : (
                      <a
                        href={createPageUrl('SignIn')}
                        className="w-full px-4 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Sign in to Contact
                      </a>
                    )}
                    <button className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add to a Role
                    </button>
                    <button className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Invite
                    </button>
                    <ShareProfileButton artistId={artist.id} />
                  </div>

                  {/* Website / Social Media */}
                  {(artist.website || socialMedia.instagram || socialMedia.linkedin || socialMedia.twitter || socialMedia.youtube) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" /> Website / Social Media
                      </h3>
                      <div className="space-y-2">
                        {artist.website && (
                          <a href={artist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Globe className="w-4 h-4" /> {artist.website}
                          </a>
                        )}
                        {socialMedia.instagram && (
                          <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Instagram className="w-4 h-4" /> Instagram
                          </a>
                        )}
                        {socialMedia.linkedin && (
                          <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                          </a>
                        )}
                        {socialMedia.twitter && (
                          <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Twitter className="w-4 h-4" /> Twitter
                          </a>
                        )}
                        {socialMedia.youtube && (
                          <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Youtube className="w-4 h-4" /> YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Union Membership */}
                  {unionMembership.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-500" /> Union Membership
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {unionMembership.map((union, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {union}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* License & Passport */}
                  {(licensePassport.driverLicense || licensePassport.passport) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" /> License & Passport
                      </h3>
                      <div className="space-y-2 text-sm">
                        {licensePassport.driverLicense && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard className="w-4 h-4 text-gray-500" /> Driver's License
                          </div>
                        )}
                        {licensePassport.passport && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Shield className="w-4 h-4 text-gray-500" /> Passport
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {(artist.based_in_city || artist.based_in_country) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" /> Location
                      </h3>
                      <p className="text-sm text-gray-700">
                        {[artist.based_in_city, artist.based_in_country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="space-y-3 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{skills.length}</p>
                        <p className="text-xs text-gray-500 uppercase">Skills</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{displayMedia.length}</p>
                        <p className="text-xs text-gray-500 uppercase">Projects</p>
                      </div>
                      {avgRating && (
                        <div>
                          <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {avgRating}
                          </p>
                          <p className="text-xs text-gray-500 uppercase">Rating</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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

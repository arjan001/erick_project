import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Artist, PortfolioClip, Endorsement, Testimonial, Subscription, SubscriptionPackage, Application, Job } from '@/lib/supabaseEntities'
import { createPageUrl } from '@/shared/utils/routing'
import ShareProfileButton from '@/components/artist/ShareProfileButton'
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge'
import {
  MapPin, MessageCircle, Globe, Instagram, Linkedin, Twitter, Youtube, Star, ThumbsUp,
  Play, BadgeCheck, Film, Quote, Sparkles, Plus, X, ChevronDown, ChevronUp, CreditCard, Shield, Briefcase
} from 'lucide-react'

export default function ArtistPublicProfile() {
  const [searchParams] = useSearchParams()
  const [viewer, setViewer] = useState(null)
  const [viewedArtist, setViewedArtist] = useState(null)
  const [portfolioClips, setPortfolioClips] = useState([])
  const [endorsements, setEndorsements] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [applications, setApplications] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subscriptionPackage, setSubscriptionPackage] = useState(null)
  const [activeClip, setActiveClip] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    skills: false,
    credits: false,
    education: false,
    applications: false
  })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('smartgigs_user')
    if (storedUser) setViewer(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    const artistId = searchParams.get('id')
    if (!artistId) { setLoading(false); setNotFound(true); return; }

    const fetchData = async () => {
      try {
        const artistsData = await Artist.filter({ id: artistId })
        const artist = artistsData?.[0]
        if (!artist) { setNotFound(true); setLoading(false); return; }
        setViewedArtist(artist)

        const [clipsData, endorsementsData, testimonialsData, applicationsData] = await Promise.all([
          PortfolioClip.filter({ uploaded_by_type: 'artist', uploaded_by_id: artistId, status: 'approved' }),
          Endorsement.filter({ recipient_email: artist.email }),
          Testimonial.filter({ recipient_email: artist.email }),
          Application.filter({ applicant_email: artist.email }, '-created_at', 10),
        ])
        setPortfolioClips(clipsData || [])
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
          const subsData = await Subscription.filter({ user_email: artist.email, status: 'active' })
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
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
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
    )
  }

  const groupedEndorsements = endorsements.reduce((acc, e) => {
    if (!acc[e.skill]) acc[e.skill] = []
    acc[e.skill].push(e)
    return acc
  }, {})

  const avgRating = testimonials.length
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length || 0).toFixed(1)
    : null

  const memberSince = viewedArtist.created_at ? new Date(viewedArtist.created_at).getFullYear() : null

  const formatLabel = (val) => (val || 'other').charAt(0).toUpperCase() + (val || 'other').slice(1).replace(/_/g, ' ')

  const appearance = viewedArtist.appearance || {}
  const socialMedia = viewedArtist.socialMedia || {}
  const representation = viewedArtist.representation || {}
  const credits = viewedArtist.credits || { film: [], commercials: [] }
  const education = viewedArtist.education || []
  const unionMembership = viewedArtist.unionMembership || []
  const licensePassport = viewedArtist.licensePassport || {}
  const skills = viewedArtist.skills || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero cover */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
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
                {viewedArtist.profession || viewedArtist.role ? formatLabel(viewedArtist.profession || viewedArtist.role) : 'Creative Professional'}
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
                  <MessageCircle className="w-4 h-4" /> Contact
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
          {(viewedArtist.website || socialMedia.instagram || socialMedia.linkedin || socialMedia.twitter || socialMedia.youtube) && (
            <div className="flex items-center gap-3 mb-2">
              {viewedArtist.website && (
                <a href={viewedArtist.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Contact
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add to a Role
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            Invite
          </button>
        </div>

        {/* Appearance Section */}
        {(appearance.height || appearance.weight || appearance.ageRange || appearance.ethnicity || appearance.build || appearance.hairColor || appearance.eyeColor) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Appearance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {appearance.height && (
                <div>
                  <span className="text-gray-500">Height</span>
                  <p className="font-medium text-gray-900">{appearance.height}</p>
                </div>
              )}
              {appearance.weight && (
                <div>
                  <span className="text-gray-500">Weight</span>
                  <p className="font-medium text-gray-900">{appearance.weight}</p>
                </div>
              )}
              {appearance.ageRange && (
                <div>
                  <span className="text-gray-500">Playing Age</span>
                  <p className="font-medium text-gray-900">{appearance.ageRange}</p>
                </div>
              )}
              {appearance.ethnicity && (
                <div>
                  <span className="text-gray-500">Ethnicities</span>
                  <p className="font-medium text-gray-900">{appearance.ethnicity}</p>
                </div>
              )}
              {appearance.build && (
                <div>
                  <span className="text-gray-500">Build</span>
                  <p className="font-medium text-gray-900">{appearance.build}</p>
                </div>
              )}
              {appearance.hairColor && (
                <div>
                  <span className="text-gray-500">Hair</span>
                  <p className="font-medium text-gray-900">{appearance.hairColor}</p>
                </div>
              )}
              {appearance.eyeColor && (
                <div>
                  <span className="text-gray-500">Eye Color</span>
                  <p className="font-medium text-gray-900">{appearance.eyeColor}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Websites/Social Media Section */}
        {(viewedArtist.website || socialMedia.instagram || socialMedia.linkedin || socialMedia.twitter || socialMedia.youtube) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Websites / Social Media</h3>
            <div className="space-y-2">
              {viewedArtist.website && (
                <a href={viewedArtist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Globe className="w-4 h-4" /> {viewedArtist.website}
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Instagram className="w-4 h-4" /> {socialMedia.instagram}
                </a>
              )}
              {socialMedia.linkedin && (
                <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Linkedin className="w-4 h-4" /> {socialMedia.linkedin}
                </a>
              )}
              {socialMedia.twitter && (
                <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Twitter className="w-4 h-4" /> {socialMedia.twitter}
                </a>
              )}
              {socialMedia.youtube && (
                <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Youtube className="w-4 h-4" /> {socialMedia.youtube}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Acting & Performing Video Samples - Large Left, 4 Small Right */}
        {portfolioClips.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Details & Media</h3>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Large image on left */}
              <div className="lg:w-1/2 flex-shrink-0">
                <button
                  onClick={() => (portfolioClips[0]?.original_video_url || portfolioClips[0]?.video_embed_url) && setActiveClip(portfolioClips[0])}
                  className="w-full group text-left"
                >
                  <div className="relative bg-gray-900 aspect-video rounded-lg overflow-hidden">
                    {portfolioClips[0]?.thumbnail_url ? (
                      <img src={portfolioClips[0].thumbnail_url} alt={portfolioClips[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    {(portfolioClips[0]?.original_video_url || portfolioClips[0]?.video_embed_url) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-7 h-7 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-2 truncate">{portfolioClips[0]?.title || 'Play Intro Video'}</p>
                </button>
              </div>
              {/* 4 smaller images on right */}
              <div className="lg:w-1/2 grid grid-cols-2 gap-3">
                {portfolioClips.slice(1, 5).map((clip) => (
                  <button
                    key={clip.id}
                    onClick={() => (clip.original_video_url || clip.video_embed_url) && setActiveClip(clip)}
                    className="group text-left"
                  >
                    <div className="relative bg-gray-900 aspect-video rounded-lg overflow-hidden">
                      {clip.thumbnail_url ? (
                        <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white/50" />
                        </div>
                      )}
                      {(clip.original_video_url || clip.video_embed_url) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-gray-900 ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-900 mt-1 truncate">{clip.title || 'Untitled'}</p>
                  </button>
                ))}
                {portfolioClips.length > 5 && (
                  <button className="text-sm text-blue-600 hover:underline col-span-2 mt-2">
                    View More Media ({portfolioClips.length - 5} more)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Representation */}
        {(representation.agent || representation.email) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Representation</h3>
            {representation.agent && <p className="text-sm text-gray-700">{representation.agent}</p>}
            {representation.email && <p className="text-sm text-gray-500">{representation.email}</p>}
          </div>
        )}

        {/* Union Membership */}
        {unionMembership.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Union Membership</h3>
            <div className="flex flex-wrap gap-2">
              {unionMembership.map((union, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {union}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* License & Passport */}
        {(licensePassport.driverLicense || licensePassport.passport) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">License & Passport</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {licensePassport.driverLicense && (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" /> Driver's License
                </span>
              )}
              {licensePassport.passport && (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" /> Passport
                </span>
              )}
            </div>
          </div>
        )}

        {/* Credits & Experience */}
        {(credits.film?.length > 0 || credits.commercials?.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Credits & Experience</h3>

            {credits.film?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Film</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {credits.film.map((credit, idx) => (
                    <li key={idx}>{credit}</li>
                  ))}
                </ul>
              </div>
            )}

            {credits.commercials?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Commercials & Industrials</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {credits.commercials.map((credit, idx) => (
                    <li key={idx}>{credit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className="font-bold text-gray-900">Skills</h3>
              {expandedSections.skills ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {expandedSections.skills ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                    {skill}
                  </span>
                ))}
                {skills.length > 5 && (
                  <button onClick={() => toggleSection('skills')} className="text-sm text-blue-600 hover:underline">
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Education & Training */}
        {education.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Education & Training</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {education.map((edu, idx) => (
                <li key={idx}>{edu}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Self-Recording */}
        {viewedArtist.self_recording_equipment && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Self-Recording</h3>
            <p className="text-sm text-gray-700">{viewedArtist.self_recording_equipment}</p>
          </div>
        )}

        {/* Highlights */}
        {viewedArtist.highlights && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Highlights</h3>
            <p className="text-sm text-gray-700">{viewedArtist.highlights}</p>
          </div>
        )}

        {/* Applications / Applied Jobs */}
        {applications.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <button
              onClick={() => toggleSection('applications')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                Applied Jobs ({applications.length})
              </h3>
              {expandedSections.applications ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {expandedSections.applications ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{app.job?.title || 'Unknown Job'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{app.job?.description?.substring(0, 100) || 'No description'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Status: <span className={`font-medium ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{app.status || 'Pending'}</span></span>
                          <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click to view applied jobs</p>
            )}
          </div>
        )}
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
  )
}
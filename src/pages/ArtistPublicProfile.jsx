import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Artist, PortfolioClip, Subscription, SubscriptionPackage, Application, Job } from '@/lib/supabaseEntities'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import ShareProfileButton from '@/components/artist/ShareProfileButton'
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge'
import { useAuth } from '@/lib/AuthContext'
import {
  MapPin, MessageCircle, Globe, Instagram, Linkedin, Twitter, Youtube, Star, ThumbsUp,
  Play, BadgeCheck, Film, Quote, Sparkles, Plus, X, ChevronDown, ChevronUp, CreditCard, Shield, Briefcase,
  Mail, Phone, Calendar, Award, ExternalLink, FileText, Image as ImageIcon, Video
} from 'lucide-react'

export default function ArtistPublicProfile() {
  const { id: artistId } = useParams()
  const { user: authUser } = useAuth()
  const [viewer, setViewer] = useState(null)
  const [viewedArtist, setViewedArtist] = useState(null)
  const [portfolioClips, setPortfolioClips] = useState([])
  const [applications, setApplications] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subscriptionPackage, setSubscriptionPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (authUser) setViewer(authUser)
  }, [authUser])

  useEffect(() => {
    if (!artistId) { setLoading(false); setNotFound(true); return; }

    const fetchData = async () => {
      try {
        // Try to find artist by ID first, then by user_id
        let artistsData = await Artist.filter({ id: artistId })
        let artist = artistsData?.[0]

        // If not found by ID, try by user_id
        if (!artist) {
          artistsData = await Artist.filter({ user_id: artistId })
          artist = artistsData?.[0]
        }

        if (!artist) { setNotFound(true); setLoading(false); return; }
        setViewedArtist(artist)

        // Fix: Use artist_id for portfolio_clips
        const [clipsData, applicationsData] = await Promise.all([
          PortfolioClip.filter({ artist_id: artist.id, status: 'approved' }),
          Application.filter({ artist_id: artist.id }, '-applied_at', 10),
        ])
        setPortfolioClips(clipsData || [])
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
          const subsData = await Subscription.filter({ user_id: artist.user_id, status: 'active' })
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
  }, [artistId])

  const artist = viewedArtist
  const skills = artist?.skills || []
  const socialMedia = artist?.socialMedia || {}
  const portfolioItems = portfolioClips.length > 0 ? portfolioClips : [
    { id: 1, title: 'Featured Project 1', project_type: 'film', thumbnail_url: null, video_url: null },
    { id: 2, title: 'Featured Project 2', project_type: 'commercial', thumbnail_url: null, video_url: null },
    { id: 3, title: 'Featured Project 3', project_type: 'music_video', thumbnail_url: null, video_url: null },
    { id: 4, title: 'Featured Project 4', project_type: 'documentary', thumbnail_url: null, video_url: null },
    { id: 5, title: 'Featured Project 5', project_type: 'short_film', thumbnail_url: null, video_url: null },
  ]

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-8">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                        {artist?.profile_photo_url ? (
                          <img src={artist.profile_photo_url} alt={artist.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-gray-500">{artist?.full_name?.[0]?.toUpperCase() || 'A'}</span>
                        )}
                      </div>
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{artist?.full_name || 'Artist Name'}</h1>
                        {subscriptionPackage && <SubscriptionBadge subscription={subscription} package={subscriptionPackage} />}
                        <BadgeCheck className="w-6 h-6 text-blue-600" />
                      </div>

                      <p className="text-lg text-gray-600 font-medium mb-3">
                        {artist?.profession || artist?.role || 'Creative Professional'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {(artist?.based_in_city || artist?.based_in_country) && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {[artist.based_in_city, artist.based_in_country].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {artist?.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            {artist.email}
                          </span>
                        )}
                        {artist?.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4" />
                            {artist.phone}
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      {artist?.bio && (
                        <p className="text-gray-700 text-sm leading-relaxed max-w-2xl mb-4">
                          {artist.bio}
                        </p>
                      )}

                      {/* Social Links */}
                      <div className="flex items-center gap-3">
                        {artist?.website && (
                          <a href={artist.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                        {socialMedia?.instagram && (
                          <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {socialMedia?.linkedin && (
                          <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {socialMedia?.twitter && (
                          <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {socialMedia?.youtube && (
                          <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                            <Youtube className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      {viewer ? (
                        <Link
                          to="/Messages"
                          className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" /> Contact
                        </Link>
                      ) : (
                        <Link
                          to="/SignIn"
                          className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                        >
                          Sign in to Contact
                        </Link>
                      )}
                      <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add to Role
                      </button>
                      {!notFound && artist && <ShareProfileButton artistId={artist.id} />}
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                  <div className="flex flex-wrap justify-around gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{skills.length}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Skills</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{portfolioItems.length}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Projects</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Reviews</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Applications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gray-500" /> Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio / Media Section - AFTER ABOUT/HEADER, BEFORE CREDITS */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-gray-500" /> Portfolio & Media
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Large featured item */}
                  <div className="col-span-2 row-span-2">
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden group cursor-pointer">
                      {portfolioItems[0]?.thumbnail_url ? (
                        <img src={portfolioItems[0].thumbnail_url} alt={portfolioItems[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-gray-900 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white font-semibold">{portfolioItems[0]?.title || 'Featured Project'}</p>
                        <p className="text-white/80 text-sm">{portfolioItems[0]?.project_type || 'Film'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Smaller items */}
                  {portfolioItems.slice(1, 5).map((item, idx) => (
                    <div key={item.id || idx} className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden group cursor-pointer">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-sm font-medium truncate">{item.title || 'Project'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {portfolioItems.length > 5 && (
                  <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All {portfolioItems.length} Projects →
                  </button>
                )}
              </div>

              {/* Credits Section */}
              {artist?.credits && (artist.credits.film?.length > 0 || artist.credits.commercials?.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" /> Credits & Experience
                  </h2>

                  {artist.credits.film?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Film</h3>
                      <ul className="space-y-2">
                        {artist.credits.film.map((credit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                            {credit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {artist.credits.commercials?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Commercials & Industrials</h3>
                      <ul className="space-y-2">
                        {artist.credits.commercials.map((credit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                            {credit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-500" /> Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artist?.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{artist.email}</p>
                      </div>
                    </div>
                  )}
                  {artist?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{artist.phone}</p>
                      </div>
                    </div>
                  )}
                  {artist?.website && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Website</p>
                        <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                          {artist.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {notFound && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> This artist profile doesn't exist in the database. Please provide a valid artist ID to see real data.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

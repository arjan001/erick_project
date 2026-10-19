import React from 'react'
import { X } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Artist, ArtistMedia, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import ShareProfileButton from '@/components/artist/ShareProfileButton'
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge'
import { useAuth } from '@/lib/AuthContext'
import {
  MapPin, MessageCircle, Globe, Instagram, Linkedin, Twitter, Youtube, BadgeCheck, Film,
  Play, Plus, Award, ExternalLink, Mail, Phone, Video, Image as ImageIcon, CreditCard, Shield, Briefcase
} from 'lucide-react'

export default function ArtistProfileModal({ artistId, onClose }) {
  const { user: authUser } = useAuth()
  const [viewer, setViewer] = useState(null)
  const [viewedArtist, setViewedArtist] = useState(null)
  const [mediaItems, setMediaItems] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subscriptionPackage, setSubscriptionPackage] = useState(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    if (authUser) setViewer(authUser)
  }, [authUser])

  React.useEffect(() => {
    if (!artistId) { setLoading(false); return; }

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

        if (!artist) { setLoading(false); return; }
        setViewedArtist(artist)

        // Use ArtistMedia with user_id
        const mediaData = await ArtistMedia.filter({ user_id: artist.user_id, status: 'approved' })
        setMediaItems(mediaData || [])

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
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [artistId])

  const artist = viewedArtist
  const appearance = artist?.appearance || {}
  const licensePassport = artist?.licensePassport || {}
  const socialMedia = artist?.socialMedia || {}
  const representation = artist?.representation || {}
  const credits = artist?.credits || { film: [], commercials: [] }
  const skills = artist?.skills || []
  const education = artist?.education || []
  const unionMembership = artist?.unionMembership || []

  const portfolioItems = mediaItems.length > 0 ? mediaItems : [
    { id: 1, title: 'Featured Project 1', media_type: 'photo', media_url: null, thumbnail_url: null },
    { id: 2, title: 'Featured Project 2', media_type: 'photo', media_url: null, thumbnail_url: null },
    { id: 3, title: 'Featured Project 3', media_type: 'video', media_url: null, thumbnail_url: null },
    { id: 4, title: 'Featured Project 4', media_type: 'photo', media_url: null, thumbnail_url: null },
    { id: 5, title: 'Featured Project 5', media_type: 'photo', media_url: null, thumbnail_url: null },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content - 3/4 width */}
      <div className="relative w-[85%] h-full bg-[#F5F3EF] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Profile Content - same as ArtistPublicProfile */}
        <div className="pt-8 pb-16">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : artist ? (
              <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
                {/* Images Section */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-shrink-0 lg:w-1/2">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden">
                        {artist?.profile_photo_url ? (
                          <img src={artist.profile_photo_url} alt={artist.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {portfolioItems.slice(0, 4).map((item, idx) => (
                        <div key={item.id || idx} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden relative group cursor-pointer">
                          {item.thumbnail_url || item.media_url ? (
                            <img src={item.thumbnail_url || item.media_url} alt={item.title || 'Media'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {item.media_type === 'video' && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {portfolioItems.length > 4 && (
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                          <span className="text-sm font-medium text-gray-600">View {portfolioItems.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6">
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
                      {appearance.height && (
                        <span className="flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          {appearance.height}
                        </span>
                      )}
                      {appearance.weight && (
                        <span className="flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          {appearance.weight}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {viewer ? (
                        <div className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold">
                          <MessageCircle className="w-4 h-4 inline mr-2" /> Contact
                        </div>
                      ) : (
                        <div className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold">
                          Sign in to Contact
                        </div>
                      )}
                      <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add to Role
                      </button>
                      <ShareProfileButton artistId={artist.id} />
                    </div>
                  </div>
                </div>

                {/* About Me */}
                {artist?.bio && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">About Me</h2>
                    <p className="text-gray-700 text-sm leading-relaxed">{artist.bio}</p>
                  </div>
                )}

                {/* Appearance */}
                {(appearance.hairColor || appearance.eyeColor || appearance.ethnicity || appearance.build || appearance.ageRange) && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Appearance</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {appearance.hairColor && <div><p className="text-xs text-gray-500 mb-1">Hair Color</p><p className="text-sm font-medium text-gray-900">{appearance.hairColor}</p></div>}
                      {appearance.eyeColor && <div><p className="text-xs text-gray-500 mb-1">Eye Color</p><p className="text-sm font-medium text-gray-900">{appearance.eyeColor}</p></div>}
                      {appearance.ethnicity && <div><p className="text-xs text-gray-500 mb-1">Ethnicity</p><p className="text-sm font-medium text-gray-900">{appearance.ethnicity}</p></div>}
                      {appearance.build && <div><p className="text-xs text-gray-500 mb-1">Build</p><p className="text-sm font-medium text-gray-900">{appearance.build}</p></div>}
                      {appearance.ageRange && <div><p className="text-xs text-gray-500 mb-1">Age Range</p><p className="text-sm font-medium text-gray-900">{appearance.ageRange}</p></div>}
                    </div>
                  </div>
                )}

                {/* Acting & Performing Video Samples */}
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
                    <Video className="w-5 h-5 text-gray-500" /> Acting & Performing Video Samples
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioItems.slice(0, 6).map((item, idx) => (
                      <div key={item.id || idx} className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden group cursor-pointer">
                        {item.thumbnail_url || item.media_url ? (
                          <img src={item.thumbnail_url || item.media_url} alt={item.title || 'Media'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {item.media_type === 'video' && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-6 h-6 text-gray-900 ml-1" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="text-white text-sm font-medium truncate">{item.title || 'Project'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credits */}
                {(credits.film?.length > 0 || credits.commercials?.length > 0) && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-500" /> Credits & Experience
                    </h2>
                    {credits.film?.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Film</h3>
                        <ul className="space-y-2">
                          {credits.film.map((credit, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                              {credit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {credits.commercials?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Commercials & Industrials</h3>
                        <ul className="space-y-2">
                          {credits.commercials.map((credit, idx) => (
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

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
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

                {/* Education */}
                {education.length > 0 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400 flex items-center gap-2">
                      <Award className="w-5 h-5 text-gray-500" /> Education & Training
                    </h2>
                    <ul className="space-y-2">
                      {education.map((edu, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Self Recording */}
                {artist?.self_recording_equipment && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
                      <Video className="w-5 h-5 text-gray-500" /> Self Recording
                    </h2>
                    <p className="text-sm text-gray-700">{artist.self_recording_equipment}</p>
                  </div>
                )}

                {/* Social Media */}
                {(artist?.website || socialMedia.instagram || socialMedia.linkedin || socialMedia.twitter || socialMedia.youtube) && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-500" /> Websites/Social Media
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {artist?.website && <a href={artist.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><Globe className="w-5 h-5" /></a>}
                      {socialMedia.instagram && <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><Instagram className="w-5 h-5" /></a>}
                      {socialMedia.linkedin && <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><Linkedin className="w-5 h-5" /></a>}
                      {socialMedia.twitter && <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><Twitter className="w-5 h-5" /></a>}
                      {socialMedia.youtube && <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><Youtube className="w-5 h-5" /></a>}
                    </div>
                  </div>
                )}

                {/* Union Membership */}
                {unionMembership.length > 0 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-500" /> Union Membership
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {unionMembership.map((union, idx) => (
                        <span key={idx} className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                          {union}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* License & Passport */}
                {(licensePassport.driverLicense || licensePassport.passport) && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-500" /> License & Passport
                    </h2>
                    <div className="flex flex-wrap gap-4">
                      {licensePassport.driverLicense && <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-700">Driver's License</span></div>}
                      {licensePassport.passport && <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-700">Passport</span></div>}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" /> Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {artist?.email && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Mail className="w-5 h-5 text-gray-500" /><div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{artist.email}</p></div></div>}
                    {artist?.phone && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Phone className="w-5 h-5 text-gray-500" /><div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{artist.phone}</p></div></div>}
                    {representation.agent && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Briefcase className="w-5 h-5 text-gray-500" /><div><p className="text-xs text-gray-500">Agent</p><p className="text-sm font-medium text-gray-900">{representation.agent}</p></div></div>}
                    {representation.email && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Mail className="w-5 h-5 text-gray-500" /><div><p className="text-xs text-gray-500">Agent Email</p><p className="text-sm font-medium text-gray-900">{representation.email}</p></div></div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-500">Profile not found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

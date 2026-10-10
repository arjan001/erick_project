import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, MapPin, Clock, DollarSign, Share2, Heart, Building2, BadgeCheck, Briefcase, ChevronDown, ChevronUp, ChevronRight, Crown, ExternalLink, Play, Youtube, Video, Calendar, Users } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { canApplyForJobs, canContactJobPoster } from '@/services/subscriptionService'

export default function GigDetailSlideOut({ job, onClose, onApply }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [expandedRoles, setExpandedRoles] = useState(new Set())
  const [requiresSubscription, setRequiresSubscription] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  if (!job) return null

  const getEmbedUrl = (url) => {
    if (!url) return null

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    return url
  }

  const hasVideo = job.video_url || job.video_embed_url || job.showreel_url
  const embedUrl = hasVideo ? getEmbedUrl(job.video_url || job.video_embed_url || job.showreel_url) : null
  const isExternalVideo = embedUrl && (embedUrl.includes('youtube') || embedUrl.includes('vimeo'))

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description || job.body || '', url: window.location.href })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  const handleApply = async (role) => {
    if (!isAuthenticated) {
      navigate('/SignIn', { state: { returnTo: window.location.pathname, job: job.title } })
      return
    }

    // Check if user has active subscription
    const canApply = await canApplyForJobs(user?.id)
    if (!canApply) {
      setRequiresSubscription(true)
      return
    }

    // Call parent onApply with role info
    if (onApply) {
      onApply(job, role)
    }
  }

  const handleContactPoster = async () => {
    if (!isAuthenticated) {
      navigate('/SignIn', { state: { returnTo: window.location.pathname, job: job.title } })
      return
    }

    // Check if user has active subscription
    const canContact = await canContactJobPoster(user?.id)
    if (!canContact) {
      setRequiresSubscription(true)
      return
    }

    // Handle contact logic here

  }

  const toggleRole = (roleId) => {
    const newExpanded = new Set(expandedRoles)
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId)
    } else {
      newExpanded.add(roleId)
    }
    setExpandedRoles(newExpanded)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 transition-opacity"
        onClick={onClose}
      />
      {/* Panel — slides in from right */}
      <div className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl md:max-w-5xl">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            {job.featured && (
              <span className="flex items-center gap-1 rounded-full bg-[#e11d48] px-3 py-1 text-xs font-bold text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="rounded-full p-2 hover:bg-gray-100" aria-label="Share">
              <Share2 className="h-4 w-4 text-black/60" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100" aria-label="Save">
              <Heart className="h-4 w-4 text-black/60" />
            </button>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 md:px-6">
          {/* Video Section */}
          {hasVideo && (
            <div className="mb-6">
              {!showVideo ? (
                <div
                  onClick={() => setShowVideo(true)}
                  className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden cursor-pointer group"
                >
                  {embedUrl && isExternalVideo ? (
                    <img
                      src={`https://img.youtube.com/vi/${embedUrl.match(/\/embed\/([\w-]+)/)?.[1] || ''}/maxresdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 group-hover:bg-white transition-colors">
                      <Play className="h-8 w-8 text-black ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium">
                    Watch Video
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  {isExternalVideo ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video
                      src={job.video_url || job.showreel_url}
                      controls
                      className="w-full h-full"
                    />
                  )}
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-xl font-bold text-black md:text-2xl">{job.title}</h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-black/60">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> {job.pay || 'Pay not specified'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Posted {job.posted || 'Recently'}
            </span>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black/70">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-black/50">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-black/80">{job.description || job.body || 'No description available.'}</p>
          </div>

          {/* Roles */}
          {job.roles && job.roles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-black/50">
                Roles on this Project ({job.roles.length})
              </h3>
              <div className="mt-3 space-y-3">
                {job.roles.map((r, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                    {/* Role header - always visible */}
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">{r.title}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-black/50">
                          {r.compensation && <span>{r.compensation}</span>}
                          {r.gender && <span>• {r.gender}</span>}
                          {r.age && <span>• {r.age}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRole(i)}
                          className="rounded-full p-1.5 hover:bg-gray-100"
                        >
                          {expandedRoles.has(i) ? (
                            <ChevronUp className="h-4 w-4 text-black/60" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-black/60" />
                          )}
                        </button>
                        <button
                          onClick={() => handleApply(r)}
                          className="shrink-0 rounded-full bg-[#4f46e5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338CA]"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Expanded role details */}
                    {expandedRoles.has(i) && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        {r.description && (
                          <p className="text-sm text-black/70 mb-3">{r.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {r.gender_requirement && (
                            <div>
                              <span className="font-medium text-black/50">Gender:</span>{' '}
                              <span className="text-black">{r.gender_requirement}</span>
                            </div>
                          )}
                          {r.age_min && r.age_max && (
                            <div>
                              <span className="font-medium text-black/50">Age:</span>{' '}
                              <span className="text-black">{r.age_min}-{r.age_max}</span>
                            </div>
                          )}
                          {r.ethnicity_requirement && (
                            <div>
                              <span className="font-medium text-black/50">Ethnicity:</span>{' '}
                              <span className="text-black">{r.ethnicity_requirement}</span>
                            </div>
                          )}
                          {r.union_requirement && (
                            <div>
                              <span className="font-medium text-black/50">Union:</span>{' '}
                              <span className="text-black">{r.union_requirement}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleApply(r)}
                          className="mt-3 w-full rounded-full bg-[#4f46e5] py-2 text-xs font-semibold text-white hover:bg-[#4338CA]"
                        >
                          Apply to {r.title}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company info with link to producer profile */}
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F46E5]/10">
                <Building2 className="h-5 w-5 text-[#4F46E5]" />
              </div>
              <div className="flex-1">
                <Link
                  to={`/ClientPublicProfile/${job.posted_by || job.company_id || 'default'}`}
                  className="text-sm font-bold text-black hover:text-[#4F46E5] flex items-center gap-1"
                >
                  {job.project || job.company || 'Production Company'}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <p className="text-xs text-black/50">View producer profile</p>
              </div>
              <button
                onClick={handleContactPoster}
                className="shrink-0 rounded-full bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338CA]"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Subscription required banner */}
        {requiresSubscription && (
          <div className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-4 md:mx-6">
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 h-5 w-5 text-white" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Subscription Required</p>
                <p className="mt-1 text-xs text-white/90">
                  Contacting job posters and applying for roles requires an active subscription.
                </p>
                <button
                  onClick={() => navigate('/Pricing')}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#8B5CF6] hover:bg-gray-100"
                >
                  View Subscription Plans
                </button>
              </div>
              <button
                onClick={() => setRequiresSubscription(false)}
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Footer CTA — sticky at bottom */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-4 md:px-6">
          {job.is_production && job.roles && job.roles.length > 0 ? (
            <div className="space-y-3">
              <p className="text-center text-xs text-black/50">Select a role above to apply, or apply to the production</p>
              <button
                onClick={() => handleApply({ title: job.title })}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4f46e5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA]"
              >
                <Briefcase className="h-4 w-4" />
                Apply to This Production
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleApply({ title: job.title })}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4f46e5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA]"
            >
              <Briefcase className="h-4 w-4" />
              Apply Now
            </button>
          )}
        </div>
      </div>
    </>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, MapPin, Clock, Euro, Share2, Heart, Building2, BadgeCheck, Briefcase, Play, FileText, Download, Upload, Mic, Globe, Award, CheckCircle, AlertCircle, Star, Calendar, Users, ExternalLink, Video, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function GigDetailSlideOut({ job, onClose, onApply }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  if (!job) return null

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description || '', url: window.location.href })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleApply = async (role = null) => {
    if (!isAuthenticated) {
      navigate('/SignIn', { state: { returnTo: window.location.pathname, job: job.title } })
      return
    }

    if (onApply) {
      onApply(job, role)
    }
  }

  const rolePills = job.roles_needed || ['Voice Over', 'Animation']
  const productionPills = job.production_types || ['Work from Home', 'Remote', 'On Location']

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 transition-opacity"
        onClick={onClose}
      />
      {/* Panel — slides in from right */}
      <div className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-6xl flex-col overflow-y-auto bg-white shadow-2xl">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 flex-1">{job.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={handleSave} className="p-2 hover:bg-gray-100 rounded-lg">
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 p-6 space-y-6">
              {/* About Project */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">About Project</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{job.about_project || job.description || 'No project description available.'}</p>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Job Description</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{job.job_description || job.description || 'No job description available.'}</p>
              </div>

              {/* Roles in the Project */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Roles in the Project</h2>
                <div className="flex flex-wrap gap-2">
                  {rolePills.map((role, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Production Type */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Production Type</h2>
                <div className="flex flex-wrap gap-2">
                  {productionPills.map((type, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dates and Location */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Dates and Location</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Application Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{job.posted || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{job.duration || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{job.location || 'Remote'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation/Pay Terms */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Compensation / Pay Terms</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Budget Range</p>
                      <p className="text-sm font-medium text-gray-900">
                        {job.budget_min && job.budget_max
                          ? `${job.budget_type}: ${job.budget_min} - ${job.budget_max}`
                          : job.compensation || 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Payment Type</p>
                      <p className="text-sm font-medium text-gray-900">{job.payment_terms || 'As per industry standard'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Additional Info</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{job.additional_info || 'Additional requirements and information about this opportunity will be provided during the application process.'}</p>
              </div>

              {/* Key Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Key Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Posted</p>
                    <p className="text-sm font-medium text-gray-900">{job.posted || 'Recently'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Views</p>
                    <p className="text-sm font-medium text-gray-900">{job.views || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Applications</p>
                    <p className="text-sm font-medium text-gray-900">{job.application_count || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-sm font-medium text-green-600">Open</p>
                  </div>
                </div>
              </div>

              {/* Additional Material */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Additional Material</h2>
                <div className="space-y-3">
                  {job.attachments && job.attachments.length > 0 ? (
                    job.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {file.type?.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        ) : file.type?.startsWith('video/') ? (
                          <Video className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No additional materials attached</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="p-6 space-y-6">
              {/* Ready to Apply Card */}
              <div className="bg-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Ready to Apply?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Submit your application and get noticed by the client.
                </p>
                {hasApplied ? (
                  <div className="flex items-center gap-2 bg-blue-700 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Application Submitted</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleApply()}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50"
                    disabled={!isAuthenticated}
                  >
                    {isAuthenticated ? 'Apply Now' : 'Sign In to Apply'}
                  </Button>
                )}
              </div>

              {/* Audition Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Audition Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Format</p>
                      <p className="text-sm font-medium text-gray-900">{job.audition_format || 'Video Audition'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{job.audition_duration || '2-3 minutes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Language</p>
                      <p className="text-sm font-medium text-gray-900">{job.audition_language || 'English'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Calls */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Similar Calls</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-900">Voice Over Artist Needed</p>
                    <p className="text-xs text-gray-500 mt-1">Remote • KES 50,000</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-900">Animation Voice Actor</p>
                    <p className="text-xs text-gray-500 mt-1">Remote • KES 75,000</p>
                  </div>
                </div>
              </div>

              {/* Featured Calls */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Featured Calls</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <p className="text-sm font-medium text-gray-900">Feature Film Lead Role</p>
                    </div>
                    <p className="text-xs text-gray-500">Nairobi • KES 50,000/day</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:from-green-100 hover:to-blue-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <p className="text-sm font-medium text-gray-900">Commercial Voice Over</p>
                    </div>
                    <p className="text-xs text-gray-500">Remote • KES 20,000</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Client</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.company || 'Client'}</p>
                    <p className="text-xs text-gray-500">Verified Client</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, MapPin, Clock, Euro, Share2, Heart, Building2, BadgeCheck, Briefcase, Play, FileText, Download, Upload, Mic, Globe, Award, CheckCircle, AlertCircle, Star, Calendar, Users, ExternalLink, Video, Image as ImageIcon, ChevronDown, ChevronUp, User, Shield, MessageCircle, DollarSign, Phone, Mail } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function GigDetailSlideOut({ job, onClose, onApply }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [expandedRoles, setExpandedRoles] = useState(new Set())
  const [selectedRole, setSelectedRole] = useState('')

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

  const toggleRole = (roleIndex) => {
    const newExpanded = new Set(expandedRoles)
    if (newExpanded.has(roleIndex)) {
      newExpanded.delete(roleIndex)
    } else {
      newExpanded.add(roleIndex)
    }
    setExpandedRoles(newExpanded)
  }

  const rolePills = job.roles_needed || ['Voice Over', 'Animation']
  const productionPills = job.production_types || ['Work from Home', 'Remote', 'On Location']

  // Simulated client info from screenshot
  const clientInfo = {
    memberSince: 'Jan 9, 2023',
    jobsPosted: 55,
    backgroundChecked: true
  }

  // Simulated expiry date
  const expiryDate = job.expiry || 'November 15, 2026 3:00 AM'

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
              {/* Job Expiry Section */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">EXPIRES:</span>
                  <span>{expiryDate}</span>
                </div>
              </div>

              {/* About the Project Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">About the Project</h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{job.about_project || job.description || 'No project description available.'}</p>
                {/* Client Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Member since {clientInfo.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{clientInfo.jobsPosted} Jobs posted</span>
                  </div>
                  {clientInfo.backgroundChecked && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Background Checked</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Description (renamed from Job Description) */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Project Description</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{job.job_description || job.description || 'No project description available.'}</p>
              </div>

              {/* Roles in the Project - with dropdowns if more than 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Roles in this Project</h2>
                <div className="space-y-4">
                  {rolePills.map((role, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Role Header */}
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                WORK-FROM-HOME
                              </span>
                              <span className="text-sm font-medium text-gray-500">Voiceover. Male. 18+</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{role}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRole(idx)}
                              className="p-2 hover:bg-gray-200 rounded"
                            >
                              {expandedRoles.has(idx) ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleApply(role)}
                              className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded hover:bg-purple-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedRoles.has(idx) && (
                          <div className="space-y-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                              Character description for this role will be provided upon application.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">Languages:</span>
                                <span className="text-gray-600 ml-2">English</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Accents:</span>
                                <span className="text-gray-600 ml-2">Southern American</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Voice Styles:</span>
                                <span className="text-gray-600 ml-2">Mysterious, Blue Collar, Authentic, Warm, Endearing</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Required Media:</span>
                                <span className="text-gray-600 ml-2">Voice Reel</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {rolePills.length > 1 && (
                    <button
                      onClick={() => setExpandedRoles(new Set())}
                      className="text-sm text-purple-600 font-medium hover:text-purple-700"
                    >
                      Collapse All Roles
                    </button>
                  )}
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

              {/* Compensation and Contact Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Compensation & Contact</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
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
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Euro className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Payment Type</p>
                      <p className="text-sm font-medium text-gray-900">{job.payment_terms || 'As per industry standard'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-gray-900">{job.company || 'Client Contact'}</p>
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
              {/* Ready to Apply Card - White background with purple button */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Ready to Apply?</h3>
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select a role...</option>
                      {rolePills.map((role, idx) => (
                        <option key={idx} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  {hasApplied ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Application Submitted</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleApply(selectedRole)}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                      disabled={!isAuthenticated || !selectedRole}
                    >
                      {isAuthenticated ? 'Apply' : 'Sign In to Apply'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Audition Details Card - Grey join button */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Audition Details</h3>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Become a Backstage member or log in to view additional details, including key audition and/or submission instructions.
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-gray-800 text-white hover:bg-gray-900 border-gray-800"
                >
                  Join Now
                </Button>
              </div>

              {/* Similar Calls */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Similar Calls</h3>
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-900">TV / Series: Scripted Show</p>
                    <p className="text-xs text-gray-500 mt-1">Remote • KES 50,000</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-900">Character-Driven Audiodrama Series</p>
                    <p className="text-xs text-gray-500 mt-1">Remote • KES 75,000</p>
                  </div>
                </div>
              </div>

              {/* Featured Calls */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Featured Calls</h3>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:from-purple-100 hover:to-blue-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <p className="text-sm font-medium text-gray-900">The Lives Which Follow</p>
                    </div>
                    <p className="text-xs text-gray-500">Feature Film • Nairobi</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:from-green-100 hover:to-blue-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <p className="text-sm font-medium text-gray-900">Santa by The Bay Photo Sessions</p>
                    </div>
                    <p className="text-xs text-gray-500">Photo Shoot • Remote</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <p className="text-sm font-medium text-gray-900">Tech Company Onboarding Training Video</p>
                    </div>
                    <p className="text-xs text-gray-500">Corporate Video • Remote</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Client</h3>
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

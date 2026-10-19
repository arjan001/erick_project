import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Job, Application, Artist, Project } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { 
  MapPin, Clock, Euro, Calendar, Building2, Users, Star, ExternalLink, 
  FileText, Mail, Share2, Bookmark, CheckCircle, AlertCircle, Play, 
  Download, Upload, X, ChevronRight, Heart, Briefcase, Video, Mic, Globe
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/lib/AuthContext'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [artistId, setArtistId] = useState(null)

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchArtistAndCheckStatus()
    }
  }, [isAuthenticated, authUser, id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      // Try to fetch as Job first
      let jobData = await Job.get(id)
      
      if (!jobData) {
        // Try as Project
        const projectData = await Project.get(id)
        if (projectData) {
          jobData = {
            ...projectData,
            title: projectData.title || projectData.project_type?.replace(/_/g, ' ') || 'Project',
            description: projectData.notes || projectData.description || 'No description available',
            location: [projectData.location_city, projectData.location_country].filter(Boolean).join(', ') || 'Remote',
            client_name: projectData.project_owner_name || 'Client',
            budget_min: projectData.budget_min || 0,
            budget_max: projectData.budget_max || 0,
            budget_type: projectData.budget_range?.includes('hourly') ? 'Hourly' : projectData.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
            payment_type: projectData.budget_range?.includes('hourly') ? 'per hour' : projectData.budget_range?.includes('daily') ? 'per day' : 'fixed price',
            isProject: true,
            application_deadline: projectData.timeline_start,
            duration: projectData.duration,
            roles_needed: projectData.departments_needed || [],
            posted_at: projectData.created_at
          }
        }
      }
      
      setJob(jobData)
    } catch (err) {
      console.error('Error fetching job details:', err)
      toastError('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const fetchArtistAndCheckStatus = async () => {
    try {
      const artists = await Artist.filter({ email: authUser.email })
      const artist = artists?.[0]
      if (artist) {
        setArtistId(artist.id)
        
        // Check if already applied
        const applications = await Application.filter({ 
          artist_id: artist.id,
          job_id: id 
        })
        setHasApplied(applications.length > 0)
      }
    } catch (err) {
      console.error('Error checking application status:', err)
    }
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
    
    if (!artistId) {
      toastError('Artist profile not found')
      return
    }

    try {
      await Application.create({
        artist_id: artistId,
        job_id: id,
        status: 'pending',
        applied_at: new Date().toISOString()
      })
      setHasApplied(true)
      success('Application submitted successfully!')
    } catch (err) {
      console.error('Error applying:', err)
      toastError('Failed to submit application')
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    success(isSaved ? 'Job removed from saved' : 'Job saved successfully')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: job?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      success('Link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
          <Button onClick={() => navigate('/Jobs')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  const rolePills = job?.roles_needed || ['Voice Over', 'Animation', 'Film', 'Commercial']
  const productionPills = ['Work from Home', 'Remote', 'On Location', 'Studio']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 flex-1">{job?.title}</h1>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={handleSave} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600 text-blue-600' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Project */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">About Project</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{job?.description || 'No project description available.'}</p>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Job Description</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {job?.short_description || job?.description || 'No job description available.'}
              </p>
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
                    <p className="text-sm font-medium text-gray-900">
                      {job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900">{job?.duration || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{job?.location || 'Remote'}</p>
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
                      {job?.budget_min && job?.budget_max 
                        ? `${job.budget_type}: $${job.budget_min} - $${job.budget_max} ${job.payment_type}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Payment Type</p>
                    <p className="text-sm font-medium text-gray-900">{job?.payment_type || 'Fixed price'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Additional Info</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                Additional requirements and information about this opportunity will be provided during the application process.
              </p>
            </div>

            {/* Key Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Key Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Posted</p>
                  <p className="text-sm font-medium text-gray-900">
                    {job?.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Views</p>
                  <p className="text-sm font-medium text-gray-900">{job?.view_count || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Applications</p>
                  <p className="text-sm font-medium text-gray-900">5</p>
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
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Project Brief.pdf</p>
                    <p className="text-xs text-gray-500">2.4 MB</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Video className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Audition Reel.mp4</p>
                    <p className="text-xs text-gray-500">15.2 MB</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
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
                  onClick={handleApply}
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
                    <p className="text-sm font-medium text-gray-900">Video Audition</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900">2-3 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="text-sm font-medium text-gray-900">English</p>
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
                  <p className="text-xs text-gray-500 mt-1">Remote • $50-100/hour</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="text-sm font-medium text-gray-900">Animation Voice Actor</p>
                  <p className="text-xs text-gray-500 mt-1">Remote • $75-150/hour</p>
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
                  <p className="text-xs text-gray-500">Nairobi • $500-800/day</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:from-green-100 hover:to-blue-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <p className="text-sm font-medium text-gray-900">Commercial Voice Over</p>
                  </div>
                  <p className="text-xs text-gray-500">Remote • $200-400/hour</p>
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
                  <p className="text-sm font-medium text-gray-900">{job?.client_name || 'Client'}</p>
                  <p className="text-xs text-gray-500">Verified Client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

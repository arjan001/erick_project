import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Project, Job } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin, Clock, Euro, Calendar, Building2, Upload, X,
  FileText, Video, Image as ImageIcon, Plus, Trash2, CheckCircle,
  AlertCircle, Briefcase, Users, Globe, Mic, Award, Save, ArrowLeft,
  ChevronRight, ChevronLeft, Sparkles, DollarSign, Phone, Film, Radio
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Briefcase },
  { id: 2, title: 'Project Details', icon: FileText },
  { id: 3, title: 'Roles & Requirements', icon: Users },
  { id: 4, title: 'Dates & Location', icon: MapPin },
  { id: 5, title: 'Compensation', icon: DollarSign },
  { id: 6, title: 'Audition Details', icon: Mic },
  { id: 7, title: 'Review & Post', icon: CheckCircle },
]

export default function ClientPostProject() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [postedJobs, setPostedJobs] = useState([])

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    projectType: 'film',
    jobType: 'role',

    // Project Details
    aboutProject: '',
    projectDescription: '',
    additionalInfo: '',

    // Roles
    rolesNeeded: [],
    newRole: '',

    // Production Type
    productionTypes: [],

    // Dates and Location
    applicationDeadline: '',
    duration: '',
    location: '',
    isRemote: false,
    isWorkFromHome: false,

    // Compensation
    budgetMin: '',
    budgetMax: '',
    budgetType: 'fixed',
    paymentTerms: '',

    // Audition Details
    auditionFormat: 'video',
    auditionDuration: '',
    auditionLanguage: 'english',

    // Client Info
    companyName: '',
    companyWebsite: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
    fetchPostedJobs()
  }, [isAuthenticated, navigate])

  const fetchPostedJobs = async () => {
    try {
      const jobs = await Job.filter({ client_id: authUser?.id })
      setPostedJobs(jobs || [])
    } catch (err) {
      console.error('Error fetching posted jobs:', err)
    }
  }

  const handleAddRole = () => {
    if (formData.newRole.trim()) {
      setFormData({
        ...formData,
        rolesNeeded: [...formData.rolesNeeded, formData.newRole.trim()],
        newRole: ''
      })
    }
  }

  const handleRemoveRole = (index) => {
    setFormData({
      ...formData,
      rolesNeeded: formData.rolesNeeded.filter((_, i) => i !== index)
    })
  }

  const handleToggleProductionType = (type) => {
    setFormData({
      ...formData,
      productionTypes: formData.productionTypes.includes(type)
        ? formData.productionTypes.filter(t => t !== type)
        : [...formData.productionTypes, type]
    })
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('job-attachments')
          .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('job-attachments')
          .getPublicUrl(fileName)

        return {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      setAttachments([...attachments, ...uploadedFiles])
      success('Files uploaded successfully')
    } catch (err) {
      console.error('Upload error:', err)
      toastError('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        title: formData.title,
        description: formData.projectDescription,
        job_type: formData.jobType,
        location: formData.location,
        city: formData.location?.split(',')[0] || '',
        country: 'Kenya',
        remote: formData.isRemote,
        salary_range: formData.budgetType,
        rate: formData.compensation,
        submission_deadline: formData.applicationDeadline,
        status: 'open',
        created_at: new Date().toISOString(),
        metadata: {
          project_type: formData.projectType,
          about_project: formData.aboutProject,
          production_types: formData.productionTypes,
          is_work_from_home: formData.isWorkFromHome,
          payment_terms: formData.paymentTerms,
          additional_info: formData.additionalInfo,
          audition_format: formData.auditionFormat,
          audition_duration: formData.auditionDuration,
          audition_language: formData.auditionLanguage,
          company_name: formData.companyName,
          company_website: formData.companyWebsite,
          attachments: attachments,
          roles_needed: formData.rolesNeeded,
          duration: formData.duration,
          budget_min: formData.budgetMin,
          budget_max: formData.budgetMax,
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }
      }

      await Job.create(jobData)
      success('Job posted successfully!')
      await fetchPostedJobs()
      setCurrentStep(1)
      setFormData({
        title: '',
        projectType: 'film',
        jobType: 'role',
        aboutProject: '',
        projectDescription: '',
        additionalInfo: '',
        rolesNeeded: [],
        newRole: '',
        productionTypes: [],
        applicationDeadline: '',
        duration: '',
        location: '',
        isRemote: false,
        isWorkFromHome: false,
        budgetMin: '',
        budgetMax: '',
        budgetType: 'fixed',
        paymentTerms: '',
        auditionFormat: 'video',
        auditionDuration: '',
        auditionLanguage: 'english',
        companyName: '',
        companyWebsite: ''
      })
      setAttachments([])
    } catch (err) {
      console.error('Error posting job:', err)
      toastError('Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const productionTypeOptions = [
    'Work from Home',
    'Remote',
    'On Location',
    'Studio',
    'Hybrid',
    'Voice Over',
    'Animation',
    'Film',
    'Commercial',
    'Industrial'
  ]

  const StepIcon = STEPS[currentStep - 1]?.icon || Briefcase

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Post a Job</h1>
                <p className="text-sm text-gray-500">Create a new job posting</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/FindGigs')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === step.id
                    ? 'bg-purple-600 text-white'
                    : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${currentStep === step.id ? 'text-purple-600' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                      <p className="text-sm text-gray-500">Tell us about the job you're posting</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Lead Actor for Feature Film"
                        required
                        className="text-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Project Type</label>
                        <select
                          value={formData.projectType}
                          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="film">Film</option>
                          <option value="commercial">Commercial</option>
                          <option value="voice_over">Voice Over</option>
                          <option value="animation">Animation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                        <select
                          value={formData.jobType}
                          onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="role">Role</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Project Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
                      <p className="text-sm text-gray-500">Describe your project in detail</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">About Project</label>
                      <textarea
                        value={formData.aboutProject}
                        onChange={(e) => setFormData({ ...formData, aboutProject: e.target.value })}
                        placeholder="Describe your project in detail..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Project Description</label>
                      <textarea
                        value={formData.projectDescription}
                        onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                        placeholder="Provide detailed project description..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Info</label>
                      <textarea
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        placeholder="Any additional requirements or information..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Roles & Requirements */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Roles & Requirements</h2>
                      <p className="text-sm text-gray-500">Define the roles you need</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Roles in the Project</label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.newRole}
                          onChange={(e) => setFormData({ ...formData, newRole: e.target.value })}
                          placeholder="Add a role (e.g., Lead Actor)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                        />
                        <Button type="button" onClick={handleAddRole} className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.rolesNeeded.map((role, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2">
                            {role}
                            <button type="button" onClick={() => handleRemoveRole(idx)} className="hover:text-purple-900">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Production Type</label>
                      <div className="flex flex-wrap gap-2">
                        {productionTypeOptions.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleToggleProductionType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.productionTypes.includes(type)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Dates & Location */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Dates & Location</h2>
                      <p className="text-sm text-gray-500">When and where the project takes place</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                      <Input
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 2 weeks, 1 month"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Nairobi, Kenya"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isRemote}
                          onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm text-gray-700">Remote</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isWorkFromHome}
                          onChange={(e) => setFormData({ ...formData, isWorkFromHome: e.target.checked })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm text-gray-700">Work from Home</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Compensation */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Compensation</h2>
                      <p className="text-sm text-gray-500">Set the payment terms</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Type</label>
                        <select
                          value={formData.budgetType}
                          onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Min Budget (KES)</label>
                        <Input
                          type="number"
                          value={formData.budgetMin}
                          onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget (KES)</label>
                        <Input
                          type="number"
                          value={formData.budgetMax}
                          onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
                      <textarea
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        placeholder="e.g., Payment upon completion, 50% upfront..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Audition Details */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Mic className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Audition Details</h2>
                      <p className="text-sm text-gray-500">Audition requirements</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
                      <select
                        value={formData.auditionFormat}
                        onChange={(e) => setFormData({ ...formData, auditionFormat: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="in_person">In Person</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                      <Input
                        value={formData.auditionDuration}
                        onChange={(e) => setFormData({ ...formData, auditionDuration: e.target.value })}
                        placeholder="e.g., 2-3 minutes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                      <select
                        value={formData.auditionLanguage}
                        onChange={(e) => setFormData({ ...formData, auditionLanguage: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="english">English</option>
                        <option value="swahili">Swahili</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Review & Post */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Review & Post</h2>
                      <p className="text-sm text-gray-500">Review your job posting before submitting</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-2">{formData.title}</h3>
                      <p className="text-sm text-gray-600">{formData.projectDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Location:</span>
                        <span className="ml-2 font-medium">{formData.location || 'Not specified'}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Budget:</span>
                        <span className="ml-2 font-medium">
                          {formData.budgetMin && formData.budgetMax
                            ? `${formData.budgetMin} - ${formData.budgetMax} KES`
                            : 'Not specified'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentStep === STEPS.length ? (
                  <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    {loading ? 'Posting...' : 'Post Job'}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Client Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company Website</label>
                  <Input
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Additional Material */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Additional Material</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload images, PDFs, or other files
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Choose Files'}
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Posted Jobs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Your Posted Jobs</h3>
              <div className="space-y-3">
                {postedJobs.length > 0 ? (
                  postedJobs.map((job) => (
                    <div key={job.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{job.status || 'Open'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No jobs posted yet</p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Tips for a Great Job Post
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Be specific about roles and requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Include clear compensation details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Upload relevant materials (briefs, scripts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Set realistic deadlines</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

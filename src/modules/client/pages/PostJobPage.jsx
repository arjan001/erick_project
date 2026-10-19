import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Job, Project } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MapPin, Clock, Euro, Calendar, Building2, Upload, X, 
  FileText, Video, Image as ImageIcon, Plus, Trash2, CheckCircle,
  AlertCircle, Briefcase, Users, Globe, Mic, Award
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

export default function PostJobPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [attachments, setAttachments] = useState([])
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    projectType: 'film', // film, commercial, voice_over, animation, other
    jobType: 'role', // role or production
    
    // About Project
    aboutProject: '',
    
    // Job Description
    jobDescription: '',
    
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
    budgetType: 'fixed', // fixed, hourly, daily
    paymentTerms: '',
    
    // Additional Info
    additionalInfo: '',
    
    // Key Details
    urgency: 'normal', // normal, urgent, flexible
    contractType: 'freelance', // freelance, contract, full_time
    
    // Audition Details
    auditionFormat: 'video', // video, audio, in_person
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
  }, [isAuthenticated, navigate])

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
        description: formData.jobDescription,
        short_description: formData.aboutProject,
        location: formData.location,
        budget_min: parseFloat(formData.budgetMin) || 0,
        budget_max: parseFloat(formData.budgetMax) || 0,
        budget_type: formData.budgetType,
        payment_type: formData.budgetType === 'hourly' ? 'per hour' : formData.budgetType === 'daily' ? 'per day' : 'fixed price',
        application_deadline: formData.applicationDeadline,
        duration: formData.duration,
        roles_needed: formData.rolesNeeded,
        status: 'open',
        posted_at: new Date().toISOString(),
        client_name: formData.companyName || authUser?.full_name || 'Client',
        // Store additional fields in metadata
        metadata: {
          project_type: formData.projectType,
          job_type: formData.jobType,
          about_project: formData.aboutProject,
          production_types: formData.productionTypes,
          is_remote: formData.isRemote,
          is_work_from_home: formData.isWorkFromHome,
          payment_terms: formData.paymentTerms,
          additional_info: formData.additionalInfo,
          urgency: formData.urgency,
          contract_type: formData.contractType,
          audition_format: formData.auditionFormat,
          audition_duration: formData.auditionDuration,
          audition_language: formData.auditionLanguage,
          company_website: formData.companyWebsite,
          attachments: attachments
        }
      }

      await Job.create(jobData)
      success('Job posted successfully!')
      navigate('/Jobs')
    } catch (err) {
      console.error('Error posting job:', err)
      toastError('Failed to post job')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Post a Job</h1>
            </div>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Lead Actor for Feature Film"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="film">Film</option>
                      <option value="commercial">Commercial</option>
                      <option value="voice_over">Voice Over</option>
                      <option value="animation">Animation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="role">Role</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* About Project */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">About Project</h2>
              <textarea
                value={formData.aboutProject}
                onChange={(e) => setFormData({ ...formData, aboutProject: e.target.value })}
                placeholder="Describe your project in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Job Description</h2>
              <textarea
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder="Provide detailed job description..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Roles Needed */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Roles in the Project</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={formData.newRole}
                    onChange={(e) => setFormData({ ...formData, newRole: e.target.value })}
                    placeholder="Add a role (e.g., Lead Actor)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                  />
                  <Button type="button" onClick={handleAddRole}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.rolesNeeded.map((role, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                      {role}
                      <button type="button" onClick={() => handleRemoveRole(idx)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Production Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Production Type</h2>
              <div className="flex flex-wrap gap-2">
                {productionTypeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleProductionType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.productionTypes.includes(type)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates and Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Dates and Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                  <Input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 weeks, 1 month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
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
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Remote</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isWorkFromHome}
                      onChange={(e) => setFormData({ ...formData, isWorkFromHome: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Work from Home</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Compensation / Pay Terms</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Type</label>
                    <select
                      value={formData.budgetType}
                      onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget</label>
                    <Input
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget</label>
                    <Input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                  <textarea
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="e.g., Payment upon completion, 50% upfront..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Additional Info</h2>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Any additional requirements or information..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Additional Material */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Additional Material</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
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
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Key Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contract</option>
                    <option value="full_time">Full Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Audition Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black">Audition Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={formData.auditionFormat}
                    onChange={(e) => setFormData({ ...formData, auditionFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <Input
                    value={formData.auditionDuration}
                    onChange={(e) => setFormData({ ...formData, auditionDuration: e.target.value })}
                    placeholder="e.g., 2-3 minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={formData.auditionLanguage}
                    onChange={(e) => setFormData({ ...formData, auditionLanguage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="english">English</option>
                    <option value="swahili">Swahili</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-400">Client Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                  <Input
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Tips for a Great Job Post
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
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
        </form>
      </div>
    </div>
  )
}

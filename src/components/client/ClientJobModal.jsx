import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader, X, Paperclip, Upload, CheckCircle2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import filmIndustryRoles from '@/data/filmIndustryRoles.json'
import { analyzeWebsiteUrl, saveAnalyzedProjectToStorage } from '@/lib/urlAnalysisService'
import { supabase } from '@/lib/supabase'
import AISubmissionModal from './AISubmissionModal'

// Flatten roles from JSON for display
const ROLES_OPTIONS = Object.values(filmIndustryRoles)
  .filter(Array.isArray)
  .flat()

const EMPLOYMENT_TYPES = [
  { value: 'fulltime', label: 'Full-time' },
  { value: 'day_payment', label: 'Day Payment' },
  { value: 'gig', label: 'Gig' }
]

const projectCategories = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'short_film', label: 'Short Film' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'branded_content', label: 'Branded Content' },
  { value: 'corporate_video', label: 'Corporate Video' },
  { value: 'event_coverage', label: 'Event Coverage' },
  { value: 'product_demo', label: 'Product Demo' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'animation', label: 'Animation' }
]

const progressSteps = [
  'Fetching site content',
  'Analyzing brand and tone',
  'Identifying visual language',
  'Translating into a film concept'
]

export default function ClientJobModal({ open, editing, form, setForm, onClose, onSubmit }) {
  const [projectUrl, setProjectUrl] = useState('')
  const [projectCategory, setProjectCategory] = useState('commercial')
  const [extracting, setExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [jobType, setJobType] = useState('single') // 'single' or 'production'
  const [productionRoles, setProductionRoles] = useState([])
  const [expandedRoles, setExpandedRoles] = useState(new Set())
  const fileInputRef = useRef(null)
  const previousCategoryRef = useRef(projectCategory)

  const handleExtract = async () => {
    if (!projectUrl) return

    setExtracting(true)
    setExtractProgress(0)

    const progressInterval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev === null) return 0
        if (prev < progressSteps.length - 1) return prev + 1
        return prev
      })
    }, 800)

    try {
      const analysisResult = await analyzeWebsiteUrl(projectUrl, projectCategory)
      clearInterval(progressInterval)

      if (analysisResult.success && analysisResult.rawAnalysis) {
        setForm({ ...form, description: analysisResult.rawAnalysis })
        setExtractProgress(progressSteps.length - 1)

        saveAnalyzedProjectToStorage({
          url: analysisResult.url,
          analysis: analysisResult,
          brief: null,
          projectType: projectCategory,
          additionalNotes: analysisResult.rawAnalysis,
          attachments: attachments
        })

        setTimeout(() => {
          setExtractProgress(null)
          setShowAIModal(true)
        }, 600)
      } else {

        setExtractProgress(null)
      }
    } catch (error) {

      setExtractProgress(null)
      clearInterval(progressInterval)
    } finally {
      setExtracting(false)
    }
  }

  const handleAIComplete = (aiData) => {
    // Process AI-generated data and populate form
    setShowAIModal(false)
    onSubmit()
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedFiles = []

    for (const file of files) {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'audio/mpeg',
        'audio/mp3',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo'
      ]

      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.mp4', '.mov', '.avi', '.hvec']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {

        continue
      }

      if (file.size > 50 * 1024 * 1024) {

        continue
      }

      try {
        const fileName = `client-job-${Date.now()}-${file.name}`
        const { data: uploadData, error } = await supabase.storage
          .from('job-attachments')
          .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('job-attachments')
          .getPublicUrl(fileName)

        uploadedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl
        })
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    setAttachments(prev => [...prev, ...uploadedFiles])
    setUploading(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  if (!open) return null

  // Show AI Modal when active
  if (showAIModal) {
    return <AISubmissionModal
      open={showAIModal}
      onClose={() => setShowAIModal(false)}
      onSubmit={handleAIComplete}
      projectData={{
        url: projectUrl,
        category: projectCategory,
        description: form.description,
        budget: form.budget,
        title: form.title
      }}
    />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            {editing ? 'Edit Job' : 'Post with AI'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Generate a job brief using AI from a URL or describe it manually</p>
        </div>
        <div className="p-6 space-y-4">
          {/* AI URL Analysis Section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project URL (Optional)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://your-brand.com or paste a project link"
                  className="flex-1"
                />
                <Button
                  onClick={handleExtract}
                  disabled={!projectUrl || extracting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {extracting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            {extractProgress !== null && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-amber-600" />
                  <span className="text-sm text-gray-700">{progressSteps[extractProgress]}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${((extractProgress + 1) / progressSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Category</label>
              <select
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {projectCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Attachments (Optional)</label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp3,.mp4,.mov,.avi,.hvec"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Attach Files'}
                </Button>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {/* Job Type Selection: Single Role vs Production */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Job Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setJobType('single')}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${jobType === 'single'
                    ? 'border-[#4f46e5] bg-[#4f46e5] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Single Role
                </button>
                <button
                  type="button"
                  onClick={() => setJobType('production')}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${jobType === 'production'
                    ? 'border-[#4f46e5] bg-[#4f46e5] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Production (Multiple Roles)
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {jobType === 'single'
                  ? 'Post a single role opening. Applicants will apply directly to this role.'
                  : 'Post a production with multiple roles. Applicants can apply to specific roles within the production.'}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Job Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter job title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the job (AI will generate this if you analyze a URL above)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
            <select
              value={form.job_type}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              {ROLES_OPTIONS.map((role) => (
                <option key={role} value={role.toLowerCase().replace(/\s+/g, '_')}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Employment Type</label>
            <select
              value={form.employment_type || ''}
              onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select employment type</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Budget</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="Enter budget"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Duration</label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select duration</option>
              <option value="short_term">Short-term</option>
              <option value="long_term">Long-term</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Required Skills (comma separated)</label>
            <input
              type="text"
              value={form.required_skills}
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
              placeholder="e.g., editing, color grading, vfx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Production Roles Section - Only shown when jobType is 'production' */}
          {jobType === 'production' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">Production Roles</label>
                <button
                  type="button"
                  onClick={() => {
                    setProductionRoles([
                      ...productionRoles,
                      {
                        id: Date.now(),
                        title: '',
                        compensation: '',
                        gender_requirement: 'Any',
                        age_min: '',
                        age_max: '',
                        ethnicity_requirement: 'Any',
                        union_requirement: 'Any',
                        description: '',
                      }
                    ])
                  }}
                  className="flex items-center gap-1 rounded-full bg-[#4f46e5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4338CA]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Role
                </button>
              </div>

              {productionRoles.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">No roles added yet. Click "Add Role" to create roles for this production.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productionRoles.map((role, index) => (
                    <div key={role.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900">Role {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newExpanded = new Set(expandedRoles)
                              if (newExpanded.has(role.id)) {
                                newExpanded.delete(role.id)
                              } else {
                                newExpanded.add(role.id)
                              }
                              setExpandedRoles(newExpanded)
                            }}
                            className="rounded-full p-1 hover:bg-gray-100"
                          >
                            {expandedRoles.has(role.id) ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductionRoles(productionRoles.filter(r => r.id !== role.id))}
                            className="rounded-full p-1 hover:bg-red-50 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {expandedRoles.has(role.id) && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Role Title</label>
                            <input
                              type="text"
                              value={role.title}
                              onChange={(e) => {
                                const updated = [...productionRoles]
                                updated[index].title = e.target.value
                                setProductionRoles(updated)
                              }}
                              placeholder="e.g., Lead Actor, Supporting Role"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Compensation</label>
                              <input
                                type="text"
                                value={role.compensation}
                                onChange={(e) => {
                                  const updated = [...productionRoles]
                                  updated[index].compensation = e.target.value
                                  setProductionRoles(updated)
                                }}
                                placeholder="e.g., $800/day"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Gender Requirement</label>
                              <select
                                value={role.gender_requirement}
                                onChange={(e) => {
                                  const updated = [...productionRoles]
                                  updated[index].gender_requirement = e.target.value
                                  setProductionRoles(updated)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              >
                                <option value="Any">Any</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-Binary">Non-Binary</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Age Min</label>
                              <input
                                type="number"
                                value={role.age_min}
                                onChange={(e) => {
                                  const updated = [...productionRoles]
                                  updated[index].age_min = e.target.value
                                  setProductionRoles(updated)
                                }}
                                placeholder="e.g., 18"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Age Max</label>
                              <input
                                type="number"
                                value={role.age_max}
                                onChange={(e) => {
                                  const updated = [...productionRoles]
                                  updated[index].age_max = e.target.value
                                  setProductionRoles(updated)
                                }}
                                placeholder="e.g., 35"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Ethnicity</label>
                              <select
                                value={role.ethnicity_requirement}
                                onChange={(e) => {
                                  const updated = [...productionRoles]
                                  updated[index].ethnicity_requirement = e.target.value
                                  setProductionRoles(updated)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              >
                                <option value="Any">Any</option>
                                <option value="Caucasian">Caucasian</option>
                                <option value="African American">African American</option>
                                <option value="Asian">Asian</option>
                                <option value="Hispanic/Latino">Hispanic/Latino</option>
                                <option value="Middle Eastern">Middle Eastern</option>
                                <option value="Indigenous">Indigenous</option>
                                <option value="Mixed">Mixed</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Union Requirement</label>
                              <select
                                value={role.union_requirement}
                                onChange={(e) => {
                                  const updated = [...productionRoles]
                                  updated[index].union_requirement = e.target.value
                                  setProductionRoles(updated)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              >
                                <option value="Any">Any</option>
                                <option value="SAG-AFTRA">SAG-AFTRA</option>
                                <option value="Equity">Equity</option>
                                <option value="Non-Union">Non-Union</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Role Description</label>
                            <textarea
                              value={role.description}
                              onChange={(e) => {
                                const updated = [...productionRoles]
                                updated[index].description = e.target.value
                                setProductionRoles(updated)
                              }}
                              placeholder="Describe this specific role..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              // Add production-related fields to form before submitting
              const updatedForm = {
                ...form,
                is_production: jobType === 'production',
                production_roles: jobType === 'production' ? productionRoles : [],
              }
              setForm(updatedForm)
              onSubmit()
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {editing ? 'Update Job' : `Create ${jobType === 'production' ? 'Production' : 'Job'}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
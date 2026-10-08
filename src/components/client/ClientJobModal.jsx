import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader, X, Paperclip, Upload, CheckCircle2 } from 'lucide-react'
import filmIndustryRoles from '@/data/filmIndustryRoles.json'
import { analyzeWebsiteUrl, saveAnalyzedProjectToStorage } from '@/lib/urlAnalysisService'
import { base44 } from '@/api/base44Client'
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
        const uploadResult = await base44.integrations.Core.UploadFile({ file })

        if (uploadResult.data?.file_url) {
          uploadedFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: uploadResult.data.file_url
          })
        }
      } catch (error) {
        
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
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} className="bg-amber-600 hover:bg-amber-700 text-white">
            {editing ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </div>
    </div>
  )
}
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Video, Link2, Film } from 'lucide-react'
import RolesTagInput from './RolesTagInput'

const PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'short_film', label: 'Short Film' },
  { value: 'film', label: 'Film' },
  { value: 'other', label: 'Other' },
]

const VIDEO_SOURCES = [
  { value: 'upload', label: 'Upload Video File' },
  { value: 'vimeo', label: 'Vimeo Link' },
  { value: 'youtube', label: 'YouTube Link' },
  { value: 'tiktok', label: 'TikTok Link' },
  { value: 'google_drive', label: 'Google Drive Link' },
]

// Convert a raw video URL into an embeddable URL based on the source
export function getEmbedUrl(url, source) {
  if (!url) return ''
  try {
    if (source === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
      return match ? `https://www.youtube.com/embed/${match[1]}` : url
    }
    if (source === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : url
    }
    if (source === 'tiktok') {
      const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/)
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : url
    }
    if (source === 'google_drive') {
      const match = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url
    }
    return url
  } catch {
    return url
  }
}

// Add/Edit portfolio work modal — supports cover image, video upload, or external video links
export default function PortfolioModal({
  editingPortfolio,
  portfolioForm,
  setPortfolioForm,
  onClose,
  onSubmit,
  uploading,
  selectedCoverImage,
  setSelectedCoverImage,
  selectedVideoFile,
  setSelectedVideoFile,
  maxVideoSizeMB = 20,
  googleDriveFolderId = null,
}) {
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [videoError, setVideoError] = useState('')
  const [videoSource, setVideoSource] = useState(portfolioForm?.video_source || 'upload')
  const [videoLink, setVideoLink] = useState(portfolioForm?.original_video_url || '')
  const [imagePreview, setImagePreview] = useState(null)

  // Generate image preview when file is selected
  React.useEffect(() => {
    if (selectedCoverImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(selectedCoverImage)
    } else {
      setImagePreview(null)
    }
  }, [selectedCoverImage])

  // Populate form when editing
  React.useEffect(() => {
    if (editingPortfolio) {
      setVideoSource(editingPortfolio.video_source || 'upload')
      setVideoLink(editingPortfolio.original_video_url || '')
      setPortfolioForm({
        title: editingPortfolio.title || '',
        project_type: editingPortfolio.project_type || 'commercial',
        description: editingPortfolio.description || '',
        role: editingPortfolio.role || '',
        video_source: editingPortfolio.video_source || 'upload',
        original_video_url: editingPortfolio.original_video_url || ''
      })
    }
  }, [editingPortfolio, setPortfolioForm])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setSelectedCoverImage(file)
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > maxVideoSizeMB * 1024 * 1024) {
      setVideoError(`Video must be under ${maxVideoSizeMB}MB. This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      setSelectedVideoFile(null)
      e.target.value = ''
      return
    }
    setVideoError('')
    setSelectedVideoFile(file)
  }

  const handleVideoSourceChange = (src) => {
    setVideoSource(src)
    setVideoError('')
    if (src !== 'upload') {
      setSelectedVideoFile(null)
    } else {
      setVideoLink('')
    }
  }

  const handleVideoLinkChange = (e) => {
    const val = e.target.value
    setVideoLink(val)
    setPortfolioForm(prev => ({
      ...prev,
      original_video_url: val,
      video_source: videoSource,
      video_embed_url: getEmbedUrl(val, videoSource),
    }))
  }

  const handleSubmit = () => {
    // Ensure video_source and link data are in the form
    if (videoSource !== 'upload' && videoLink) {
      setPortfolioForm(prev => ({
        ...prev,
        video_source: videoSource,
        original_video_url: videoLink,
        video_embed_url: getEmbedUrl(videoLink, videoSource),
      }))
    }
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {editingPortfolio ? 'Edit Portfolio Item' : 'Add Work to Portfolio'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Showcase your best work with photos, videos, or external links
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Project Title *</label>
                <input
                  type="text"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Project Type</label>
                <select
                  value={portfolioForm.project_type}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, project_type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Your Role(s)</label>
                <RolesTagInput
                  selected={portfolioForm.roles || []}
                  onChange={(roles) => setPortfolioForm(prev => ({
                    ...prev,
                    roles,
                    role: roles[0] || prev.role || '',
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project, your contribution, and any notable details..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-all"
                />
              </div>
            </div>

            {/* Right Column - Media */}
            <div className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Cover Image</label>
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCoverImage(null)
                        setImagePreview(null)
                        if (imageInputRef.current) imageInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 font-medium">Click to upload a photo</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {/* Video Source */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Film className="w-5 h-5 text-gray-700" /> Video Source
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {VIDEO_SOURCES.map(src => (
                    <button
                      key={src.value}
                      type="button"
                      onClick={() => handleVideoSourceChange(src.value)}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        videoSource === src.value
                          ? 'bg-black text-white font-medium shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>

                {/* Upload video file */}
                {videoSource === 'upload' && (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 font-medium">{selectedVideoFile ? selectedVideoFile.name : 'Click to upload a video'}</p>
                    <p className="text-xs text-gray-500 mt-1">MP4, MOV up to {maxVideoSizeMB}MB</p>
                  </div>
                )}

                {/* External video link */}
                {videoSource !== 'upload' && (
                  <div>
                    {videoSource === 'google_drive' && googleDriveFolderId && (
                      <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800 font-semibold mb-2">📁 Google Drive Connected</p>
                        <p className="text-xs text-blue-700 mb-2">
                          Your portfolio folder is connected. To add a video:
                        </p>
                        <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                          <li>Open your Google Drive folder</li>
                          <li>Right-click on a video file</li>
                          <li>Select "Share" → "Copy link"</li>
                          <li>Paste the link below</li>
                        </ol>
                      </div>
                    )}
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={videoLink}
                        onChange={handleVideoLinkChange}
                        placeholder={
                          videoSource === 'vimeo' ? 'https://vimeo.com/123456789' :
                          videoSource === 'youtube' ? 'https://youtube.com/watch?v=...' :
                          videoSource === 'tiktok' ? 'https://tiktok.com/@user/video/...' :
                          'https://drive.google.com/file/d/...'
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                    {videoLink && videoSource !== 'tiktok' && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <iframe
                          src={getEmbedUrl(videoLink, videoSource)}
                          className="w-full aspect-video"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title="Video preview"
                        />
                      </div>
                    )}
                    {videoLink && videoSource === 'tiktok' && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">✓ TikTok link saved — video will be embedded on your profile.</p>
                      </div>
                    )}
                  </div>
                )}

                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                {videoError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{videoError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex gap-4">
          <Button onClick={onClose} variant="outline" className="flex-1 py-3 text-base font-medium">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 bg-black text-white hover:bg-gray-800 py-3 text-base font-medium"
          >
            {uploading ? 'Uploading...' : (editingPortfolio ? 'Update Portfolio' : 'Add to Portfolio')}
          </Button>
        </div>
      </div>
    </div>
  )
}
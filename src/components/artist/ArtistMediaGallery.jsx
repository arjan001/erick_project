import React, { useState, useEffect } from 'react'
import { Upload, X, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video, Trash2 } from 'lucide-react'
import { ArtistMedia } from '@/lib/supabaseEntities'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast.jsx'

export default function ArtistMediaGallery({ artistId, isEditable = false }) {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [artistId])

  const fetchMedia = async () => {
    try {
      // If editable, show all media (including pending). If not editable, only show approved.
      const statusFilter = isEditable ? undefined : 'approved'
      const mediaData = await ArtistMedia.filter(
        { user_id: artistId, ...(statusFilter && { status: statusFilter }) },
        'order_index',
        50
      )
      setMedia(mediaData || [])
    } catch (err) {
      console.error('Error fetching media:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    // Get artistId from user if not provided
    const effectiveArtistId = artistId || user?.id
    if (!effectiveArtistId) {
      toastError('Error', 'Artist profile not found. Please save your profile first.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentFile(file.name)
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))

        const fileExt = file.name.split('.').pop()
        const isVideo = file.type.startsWith('video/')
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${effectiveArtistId}/${fileName}`

        console.log('Uploading to:', filePath, 'Type:', file.type, 'Bucket: artist-profiles')

        // Upload to Supabase Storage - use artist-profiles bucket
        const { error: uploadError } = await supabase.storage
          .from('artist-profiles')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type // Set content type for MP4 and other formats
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('artist-profiles')
          .getPublicUrl(filePath)

        // Create thumbnail for videos
        let thumbnailUrl = null
        if (isVideo) {
          // For now, use a placeholder - in production, generate real thumbnail
          thumbnailUrl = publicUrl
        }

        // Save to database
        await ArtistMedia.create({
          artist_id: effectiveArtistId,
          media_type: isVideo ? 'video' : 'photo',
          media_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          order_index: media.length,
          status: 'pending' // Pending approval
        })
      }

      success('Success', 'Media uploaded successfully')
      setUploadProgress(100)
      setTimeout(() => {
        setUploadProgress(0)
        setCurrentFile('')
      }, 1000)
      fetchMedia()
    } catch (err) {
      console.error('Upload error:', err)
      toastError('Error', `Failed to upload media: ${err.message || 'Unknown error'}`)
      setUploadProgress(0)
      setCurrentFile('')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (mediaId) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      await ArtistMedia.delete(mediaId)
      success('Deleted', 'Media deleted successfully')
      fetchMedia()
    } catch (err) {
      console.error('Delete error:', err)
      toastError('Error', 'Failed to delete media')
    }
  }

  const handleSetPrimary = async (mediaId) => {
    try {
      // Reset all to false
      for (const item of media) {
        if (item.id !== mediaId && item.is_primary) {
          await ArtistMedia.update(item.id, { is_primary: false })
        }
      }
      // Set new primary
      await ArtistMedia.update(mediaId, { is_primary: true })
      success('Success', 'Primary media updated')
      fetchMedia()
    } catch (err) {
      console.error('Error setting primary:', err)
      toastError('Error', 'Failed to set primary media')
    }
  }

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  if (loading) return <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />

  if (!media.length) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No media uploaded yet</p>
        {isEditable && (
          <label className="mt-4 inline-flex items-center px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Media'}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
        {uploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentFile} - {uploadProgress}%</p>
          </div>
        )}
        {uploading && (
          <p className="text-sm text-gray-400 mt-2">Please wait while media uploads...</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Gallery View */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video group">
        {media[currentIndex]?.media_type === 'video' ? (
          <video
            src={media[currentIndex]?.media_url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media[currentIndex]?.media_url}
            alt={media[currentIndex]?.caption || 'Artist media'}
            className="w-full h-full object-cover"
          />
        )}

        {/* Navigation Controls */}
        {media.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Media Type Badge */}
        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          {media[currentIndex]?.media_type === 'video' ? (
            <Video className="w-3 h-3" />
          ) : (
            <ImageIcon className="w-3 h-3" />
          )}
          {media[currentIndex]?.media_type}
        </div>

        {/* Index Indicator */}
        {media.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
            {currentIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex ? 'border-black' : 'border-transparent hover:border-gray-300'
                }`}
            >
              {item.media_type === 'video' ? (
                <video src={item.media_url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.media_url} alt="" className="w-full h-full object-cover" />
              )}
              {item.is_primary && (
                <div className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded">Primary</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Edit Controls */}
      {isEditable && (
        <div className="flex gap-2 pt-4 border-t">
          <label className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Media'}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {media[currentIndex] && (
            <>
              {!media[currentIndex]?.is_primary && (
                <button
                  onClick={() => handleSetPrimary(media[currentIndex].id)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Set Primary
                </button>
              )}
              <button
                onClick={() => handleDelete(media[currentIndex].id)}
                className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

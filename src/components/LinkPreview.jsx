import React, { useState, useEffect } from 'react'
import { ExternalLink, Image as ImageIcon, Globe, Loader2 } from 'lucide-react'
import { fetchLinkPreview, generateInternalPreview, isInternalUrl } from '@/services/linkPreviewService'

export default function LinkPreview({ url, type, id, data, compact = false }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true)
      setError(false)

      try {
        let previewData

        if (isInternalUrl(url)) {
          // Generate internal preview
          previewData = generateInternalPreview(type, id, data)
        } else {
          // Fetch external preview
          previewData = await fetchLinkPreview(url)
        }

        setPreview(previewData)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (url || (type && id)) {
      loadPreview()
    }
  }, [url, type, id, data])

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${compact ? 'text-sm' : 'p-4 bg-gray-50 rounded-lg'}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-gray-500">Loading preview...</span>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'p-4 bg-gray-50 rounded-lg'}`}>
        <Globe className="w-4 h-4 text-gray-400" />
        <a 
          href={url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate"
        >
          {url || 'Link'}
        </a>
        <ExternalLink className="w-3 h-3 text-gray-400" />
      </div>
    )
  }

  if (compact) {
    return (
      <a 
        href={preview.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm hover:underline"
      >
        {preview.image && (
          <img 
            src={preview.image} 
            alt="" 
            className="w-8 h-8 rounded object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <span className="truncate max-w-[200px]">{preview.title}</span>
        <ExternalLink className="w-3 h-3 text-gray-400" />
      </a>
    )
  }

  return (
    <a 
      href={preview.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {preview.image ? (
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <img 
              src={preview.image} 
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
            <div className="hidden w-full h-full items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate mb-1">{preview.title}</h3>
          {preview.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{preview.description}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Globe className="w-3 h-3" />
            <span className="truncate">{new URL(preview.url).hostname}</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </a>
  )
}

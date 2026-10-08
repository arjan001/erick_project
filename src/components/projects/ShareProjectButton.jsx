import React, { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareProjectButton({ projectId, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/ProjectPublic?id=${projectId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Copy shareable link"
      className={`p-2 bg-black/80 text-white rounded-full hover:bg-black transition-colors ${className}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
    </button>
  )
}
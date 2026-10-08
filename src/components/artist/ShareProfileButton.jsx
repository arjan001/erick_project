import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'

export default function ShareProfileButton({ artistId }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}${createPageUrl('ArtistPublicProfile')}?id=${artistId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      
    }
  }

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2">
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Link Copied' : 'Share Profile'}
    </Button>
  )
}
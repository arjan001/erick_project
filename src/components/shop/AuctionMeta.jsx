import React, { useState, useEffect } from 'react'
import { Clock, Users } from 'lucide-react'
import { getAuctionInfo } from '@/services/shopService'

/** Re-renders every `ms` so countdowns stay live. */
export const useNow = (ms = 1000) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export const formatCountdown = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`
}

/** One-line auction status used on product cards. */
export function AuctionMeta({ product }) {
  const now = useNow()
  const info = getAuctionInfo(product, now)

  if (info.settled || info.due) {
    return <span className="text-xs font-semibold text-black/50">Auction closed</span>
  }
  if (info.type === 'count') {
    return (
      <div>
        <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
          <Users className="h-3 w-3" /> {info.participants.toLocaleString()} / {info.target.toLocaleString()} joined
        </span>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-red-100">
          <div className="h-full rounded-full bg-red-500" style={{ width: `${info.progress}%` }} />
        </div>
      </div>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
      <Clock className="h-3 w-3" /> {formatCountdown(info.timeLeft ?? 0)}
    </span>
  )
}

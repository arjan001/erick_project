import React from 'react'
import { Crown, Star } from 'lucide-react'

export default function SubscriptionBadge({ subscription, package: pkg }) {
  if (!subscription || !pkg) return null

  const isPro = pkg.name.toLowerCase().includes('pro')
  const isBasic = pkg.name.toLowerCase().includes('basic')

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
      isPro ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
      isBasic ? 'bg-blue-100 text-blue-800 border border-blue-300' :
      'bg-purple-100 text-purple-800 border border-purple-300'
    }`}>
      {isPro ? (
        <Crown className="w-3 h-3" />
      ) : (
        <Star className="w-3 h-3" />
      )}
      <span>{pkg.name}</span>
    </div>
  )
}

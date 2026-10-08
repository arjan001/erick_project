import React from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { Zap } from 'lucide-react'

export default function ConnectsTrackerCard({ connects }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#E9C46A]/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#E9C46A]" />
        </div>
        <h2 className="text-sm sm:text-base font-semibold">Connects Balance</h2>
      </div>

      {/* Number Display */}
      <div className="text-center py-4 sm:py-5">
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#E9C46A]">
          {connects ?? '—'}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 mt-2">
          connects available
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={createPageUrl('ArtistSubscriptionCheckout')}
        className="block w-full bg-[#E9C46A] hover:bg-[#ddb94f] text-gray-900 text-xs sm:text-sm font-semibold rounded-xl py-3 sm:py-3.5 transition-all hover:shadow-lg text-center mt-4"
      >
        Get More Connects
      </Link>
    </div>
  )
}
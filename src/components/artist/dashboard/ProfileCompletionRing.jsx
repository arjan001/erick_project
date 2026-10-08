import React from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { Check } from 'lucide-react'

export default function ProfileCompletionRing({ artist, portfolioCount = 0 }) {
  const checks = [
    { label: 'Profile details', done: !!(artist?.full_name && artist?.role) },
    { label: 'Location set', done: !!artist?.based_in_country },
    { label: 'Portfolio clips', done: portfolioCount > 0 },
    { label: 'Profile photo', done: !!artist?.profile_photo_url },
  ]

  const filled = checks.filter(c => c.done).length
  const percent = Math.round((filled / checks.length) * 100)

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Profile Strength</h2>
        <span className="text-xs font-semibold text-[#2A9D8F] bg-[#2A9D8F]/10 px-2 py-0.5 rounded-full">Live</span>
      </div>

      <div className="relative w-28 h-28 mx-auto my-4">
        <svg className="w-28 h-28 -rotate-90">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A9D8F" />
              <stop offset="100%" stopColor="#E9C46A" />
            </linearGradient>
          </defs>
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="56" cy="56" r={radius} fill="none" stroke="url(#ringGrad)" strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{percent}%</span>
          <span className="text-xs text-gray-400 font-medium mt-0.5">complete</span>
        </div>
      </div>

      <div className="space-y-2 mt-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                c.done ? 'bg-[#2A9D8F] text-white' : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
            </span>
            <span className={`text-xs ${c.done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>

      {percent < 100 && (
        <Link
          to={createPageUrl('ArtistProfile')}
          className="mt-4 text-center w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
        >
          Complete your profile
        </Link>
      )}
    </div>
  )
}
import React from 'react'

export function ScoreBadge({ score, maxScore = 10, label = "SOTD" }) {
  return (
    <div className="inline-flex flex-col items-center px-4 py-3 bg-white border-2 border-black rounded-lg">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
        {label}
      </div>
      <div className="text-3xl font-black leading-none">
        {score}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        /{maxScore}
      </div>
    </div>
  )
}

export default ScoreBadge
import React from 'react'

export default function RoleToggle({ active = 'talent', onChange, dark = false }) {
  return (
    <div
      className={`inline-flex items-center rounded-full p-1 ${
        dark ? 'bg-white/15' : 'bg-black/[0.06]'
      }`}
    >
      <button
        onClick={() => onChange?.('talent')}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
          active === 'talent'
            ? 'bg-black text-white'
            : dark
            ? 'text-white/80 hover:text-white'
            : 'text-black/70 hover:text-black'
        }`}
      >
        I'm Talent
      </button>
      <button
        onClick={() => onChange?.('hiring')}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
          active === 'hiring'
            ? 'bg-black text-white'
            : dark
            ? 'text-white/80 hover:text-white'
            : 'text-black/70 hover:text-black'
        }`}
      >
        I'm Hiring Talent
      </button>
    </div>
  )
}

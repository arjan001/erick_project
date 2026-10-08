import React from 'react'

export default function Logo({ className = '', dark = false }) {
  return (
    <span className={`text-lg font-extrabold uppercase tracking-tight ${dark ? 'text-white' : 'text-black'} ${className}`}>
      SmartGigs Kenya
    </span>
  )
}

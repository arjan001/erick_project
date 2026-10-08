import React from 'react'

export default function StatCard({ icon: Icon, label, value, accent = '#2A9D8F' }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 h-full flex flex-col justify-between min-h-[120px] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</div>
    </div>
  )
}
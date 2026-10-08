import React from 'react'

// Shared TailAdmin-style stat card: soft icon square, big value, label, optional trend badge.
export default function DashboardStatCard({ icon: Icon, label, value, trend, iconBg = 'bg-indigo-50', iconColor = 'text-indigo-600' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
          <div className="text-sm text-gray-500 mt-1.5">{label}</div>
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
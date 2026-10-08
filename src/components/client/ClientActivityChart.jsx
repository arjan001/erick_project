import React from 'react'
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

export default function ClientActivityChart({ data }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          <Bar dataKey="projects" radius={[4, 4, 4, 4]} fill="#1f2937" barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
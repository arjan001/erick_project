import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export default function ClientActivityChart({ data }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-gray-900 mb-1">Project Activity</h3>
      <p className="text-xs text-gray-400 mb-4">Projects posted in the last 6 months</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
          <Bar dataKey="projects" radius={[6, 6, 6, 6]} fill="#111827" barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
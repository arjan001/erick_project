import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function ActivityChart({ applications = [] }) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const count = applications.filter(a => {
      const ad = new Date(a.created_date);
      return ad.toDateString() === d.toDateString();
    }).length;
    return { day: days[d.getDay()], count, isToday: i === 6 };
  });

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-6 bg-white h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Activity</h2>
      <p className="text-sm text-gray-500 mb-4">Applications sent this week</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="count" radius={[6, 6, 6, 6]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.isToday ? '#374151' : '#e5e7eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
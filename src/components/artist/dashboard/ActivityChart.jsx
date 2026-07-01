import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

// Weekly activity graph — counts applications sent per day over the last 7 days
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
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Your Activity</h2>
      <p className="text-sm text-gray-500 mb-4">Applications sent this week</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="count" radius={[6, 6, 6, 6]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.isToday ? '#4f46e5' : '#e0e7ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
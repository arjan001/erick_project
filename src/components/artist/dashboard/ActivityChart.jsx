import React from 'react';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

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
    return { day: days[d.getDay()], count };
  });

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7 h-full">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">Your Activity</h2>
          <p className="text-sm text-gray-400">Applications sent this week</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{total}</div>
          <div className="text-xs text-gray-400 font-medium">this week</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A9D8F" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2A9D8F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip cursor={{ stroke: '#2A9D8F', strokeDasharray: 3 }} contentStyle={{ borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }} />
          <Area type="monotone" dataKey="count" stroke="#2A9D8F" strokeWidth={3} fill="url(#actFill)" dot={{ r: 3, fill: '#2A9D8F' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
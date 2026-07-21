import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'];

export default function ClientStatusDonut({ data }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No projects yet</div>
      )}
    </div>
  );
}
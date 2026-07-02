import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ClientOverviewCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const isPrimary = idx === 0;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl p-5 border ${isPrimary ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
          >
            <div className="flex items-center justify-between mb-5">
              <span className={`text-sm font-medium ${isPrimary ? 'text-gray-300' : 'text-gray-500'}`}>{stat.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPrimary ? 'bg-white/10' : 'bg-gray-50'}`}>
                <Icon className={`w-4 h-4 ${isPrimary ? 'text-white' : 'text-gray-700'}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">{stat.value}</span>
              {stat.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${isPrimary ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  <ArrowUpRight className="w-3 h-3" /> {stat.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
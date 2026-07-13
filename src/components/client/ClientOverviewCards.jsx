import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ClientOverviewCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              {stat.trend && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
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
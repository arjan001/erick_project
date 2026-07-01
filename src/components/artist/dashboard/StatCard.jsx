import React from 'react';

// Stat card styled after the reference dashboard: icon in a top-right pill, big number, trend line
export default function StatCard({ icon: Icon, label, value, sublabel, accent = false }) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
      <div className="flex items-start justify-between mb-6">
        <span className={`text-sm font-medium ${accent ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400'}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {sublabel && (
        <div className={`text-xs ${accent ? 'text-emerald-400' : 'text-emerald-600'}`}>{sublabel}</div>
      )}
    </div>
  );
}
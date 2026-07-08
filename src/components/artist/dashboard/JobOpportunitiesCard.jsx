import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Plus, Briefcase } from 'lucide-react';

const ICON_COLORS = [
  { bg: '#2A9D8F', text: '#ffffff' },
  { bg: '#F4A261', text: '#ffffff' },
  { bg: '#E9C46A', text: '#5a4a1a' },
  { bg: '#264653', text: '#ffffff' },
  { bg: '#2A9D8F', text: '#ffffff' },
];

export default function JobOpportunitiesCard({ jobs = [] }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">Latest Jobs</h2>
        <Link
          to={createPageUrl('Jobs')}
          className="flex items-center gap-1 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-full px-3 py-1.5 transition-colors"
        >
          <Plus className="w-3 h-3" /> View All
        </Link>
      </div>
      {jobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <span className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5 text-gray-300" />
          </span>
          <p className="text-sm text-gray-400">No jobs available right now</p>
        </div>
      ) : (
        <div className="space-y-1 flex-1">
          {jobs.slice(0, 5).map((job, idx) => {
            const c = ICON_COLORS[idx % ICON_COLORS.length];
            return (
              <Link key={job.id} to={createPageUrl('Jobs')} className="flex items-center gap-3 hover:bg-gray-50 px-2.5 py-2.5 rounded-2xl transition-colors group">
                <span className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg, color: c.text }}>
                  <Briefcase className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.location || 'Remote'}</p>
                </div>
                <span className="text-xs font-semibold text-[#2A9D8F] opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
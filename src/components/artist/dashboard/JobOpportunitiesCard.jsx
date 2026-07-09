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
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Latest Jobs</h2>
        <Link
          to={createPageUrl('Jobs')}
          className="flex items-center gap-1 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-full px-2.5 py-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> View All
        </Link>
      </div>
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-4">
          <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
            <Briefcase className="w-4 h-4 text-gray-300" />
          </span>
          <p className="text-xs text-gray-400">No jobs available right now</p>
        </div>
      ) : (
        <div className="space-y-1">
          {jobs.slice(0, 5).map((job, idx) => {
            const c = ICON_COLORS[idx % ICON_COLORS.length];
            return (
              <Link key={job.id} to={createPageUrl('Jobs')} className="flex items-center gap-2.5 hover:bg-gray-50 px-2 py-2 rounded-xl transition-colors group">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg, color: c.text }}>
                  <Briefcase className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">{job.title}</p>
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
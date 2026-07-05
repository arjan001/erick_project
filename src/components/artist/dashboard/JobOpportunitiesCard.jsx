import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Plus, Briefcase } from 'lucide-react';

const DOT_COLORS = ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'];

export default function JobOpportunitiesCard({ jobs = [] }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-6 bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Latest Jobs</h2>
        <Link
          to={createPageUrl('Jobs')}
          className="flex items-center gap-1 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          <Plus className="w-3 h-3" /> View All
        </Link>
      </div>
      {jobs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400 text-center">No jobs available right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job, idx) => (
            <Link key={job.id} to={createPageUrl('Jobs')} className="flex items-start gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
              <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${DOT_COLORS[idx % DOT_COLORS.length]}`}>
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                <p className="text-xs text-gray-400">{job.location || 'Remote'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
import React from 'react'
import { Heart, Briefcase, MapPin, DollarSign, Clock, ChevronRight } from 'lucide-react'

export default function SavedJobsCard({ savedJobs }) {
  if (!savedJobs || savedJobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Saved Jobs</h3>
            <p className="text-xs text-gray-500">Your saved roles and productions</p>
          </div>
        </div>
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No saved jobs yet</p>
          <p className="text-xs text-gray-400 mt-1">Save jobs you're interested in to view them here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Saved Jobs</h3>
            <p className="text-xs text-gray-500">{savedJobs.length} saved</p>
          </div>
        </div>
        <button className="text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA]">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {savedJobs.slice(0, 5).map((saved) => (
          <div
            key={saved.id}
            className="group border border-gray-200 rounded-xl p-4 hover:border-[#4F46E5] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {saved.job?.title || 'Untitled Job'}
                </h4>
                {saved.job_role && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Role: {saved.job_role.title}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {saved.job?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {saved.job.location}
                    </span>
                  )}
                  {saved.job?.compensation_display && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {saved.job.compensation_display}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4F46E5] flex-shrink-0 ml-2" />
            </div>
          </div>
        ))}
      </div>

      {savedJobs.length > 5 && (
        <button className="mt-4 w-full text-center text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA]">
          View all {savedJobs.length} saved jobs
        </button>
      )}
    </div>
  )
}

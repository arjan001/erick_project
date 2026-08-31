import React from 'react';
import { X, MapPin, Clock, DollarSign, Share2, Heart, Building2, BadgeCheck, Briefcase } from 'lucide-react';

export default function JobDetailSlideOut({ job, onClose }) {
  if (!job) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description || job.body || '', url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 transition-opacity"
        onClick={onClose}
      />
      {/* Panel — slides in from right */}
      <div className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl md:max-w-lg">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            {job.featured && (
              <span className="flex items-center gap-1 rounded-full bg-[#e11d48] px-3 py-1 text-xs font-bold text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="rounded-full p-2 hover:bg-gray-100" aria-label="Share">
              <Share2 className="h-4 w-4 text-black/60" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100" aria-label="Save">
              <Heart className="h-4 w-4 text-black/60" />
            </button>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 md:px-6">
          {/* Title */}
          <h1 className="text-xl font-bold text-black md:text-2xl">{job.title}</h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-black/60">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> {job.pay || 'Pay not specified'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Posted {job.posted || 'Recently'}
            </span>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black/70">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-black/50">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-black/80">{job.description || job.body || 'No description available.'}</p>
          </div>

          {/* Roles */}
          {job.roles && job.roles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-black/50">Available Roles</h3>
              <div className="mt-3 space-y-3">
                {job.roles.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                    <div>
                      <p className="text-sm font-bold text-black">{r.title}</p>
                      {r.pay && <p className="mt-0.5 text-xs text-black/50">{r.pay}</p>}
                    </div>
                    <button className="rounded-full bg-[#4F46E5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#4338CA]">
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company info */}
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F46E5]/10">
                <Building2 className="h-5 w-5 text-[#4F46E5]" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">{job.project || job.company || 'Production Company'}</p>
                <p className="text-xs text-black/50">View all jobs by this company</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA — sticky at bottom */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-4 md:px-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4F46E5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA]">
            <Briefcase className="h-4 w-4" />
            View Details & Apply
          </button>
        </div>
      </div>
    </>
  );
}

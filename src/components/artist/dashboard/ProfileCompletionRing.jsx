import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';

export default function ProfileCompletionRing({ artist, portfolioCount = 0 }) {
  const fields = [
    artist?.full_name,
    artist?.role,
    artist?.based_in_country,
    artist?.bio,
    artist?.profile_photo_url,
    portfolioCount > 0,
  ];
  const filled = fields.filter(Boolean).length;
  const percent = Math.round((filled / fields.length) * 100);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-6 bg-white flex flex-col items-center text-center h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 self-start">Profile Strength</h2>
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90">
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="56" cy="56" r={radius} fill="none" stroke="#374151" strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percent}%</span>
        </div>
      </div>
      {percent < 100 && (
        <Link to={createPageUrl('ArtistProfile')} className="text-sm text-gray-600 font-medium hover:text-gray-900 mt-4">
          Complete your profile
        </Link>
      )}
    </div>
  );
}
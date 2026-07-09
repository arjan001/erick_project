import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Bell, CalendarClock } from 'lucide-react';

export default function RemindersCard({ invitations = [] }) {
  const next = invitations[0];

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Reminders</h2>
        <span className="w-8 h-8 rounded-xl bg-[#F4A261]/15 flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 text-[#F4A261]" />
        </span>
      </div>
      {!next ? (
        <div className="flex flex-col items-center justify-center text-center py-4">
          <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
            <CalendarClock className="w-4 h-4 text-gray-300" />
          </span>
          <p className="text-xs text-gray-400">No pending invitations</p>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="rounded-xl bg-[#F4A261]/8 p-3 mb-3">
            <p className="font-semibold text-gray-900 text-xs leading-snug">{next.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(next.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <Link
            to={createPageUrl('JobInvitations')}
            className="mt-auto inline-block text-center w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
          >
            View Invitations
          </Link>
        </div>
      )}
    </div>
  );
}
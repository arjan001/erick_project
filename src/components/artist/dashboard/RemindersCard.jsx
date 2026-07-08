import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Bell, CalendarClock } from 'lucide-react';

export default function RemindersCard({ invitations = [] }) {
  const next = invitations[0];

  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Reminders</h2>
        <span className="w-9 h-9 rounded-2xl bg-[#F4A261]/15 flex items-center justify-center">
          <Bell className="w-4 h-4 text-[#F4A261]" />
        </span>
      </div>
      {!next ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <span className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <CalendarClock className="w-5 h-5 text-gray-300" />
          </span>
          <p className="text-sm text-gray-400">No pending invitations</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="rounded-2xl bg-[#F4A261]/8 p-4 mb-4">
            <p className="font-semibold text-gray-900 text-sm leading-snug">{next.message}</p>
            <p className="text-xs text-gray-400 mt-1.5">{new Date(next.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <Link
            to={createPageUrl('JobInvitations')}
            className="mt-auto inline-block text-center w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-2xl py-3 transition-colors"
          >
            View Invitations
          </Link>
        </div>
      )}
    </div>
  );
}
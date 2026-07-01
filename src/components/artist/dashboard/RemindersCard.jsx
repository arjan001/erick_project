import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Bell } from 'lucide-react';

// "Reminders" style card — surfaces the most recent pending job invitation
export default function RemindersCard({ invitations = [] }) {
  const next = invitations[0];

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Reminders</h2>
      {!next ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400 text-center">No pending invitations</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="font-semibold text-gray-900 text-sm">{next.message}</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">{new Date(next.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <Link
            to={createPageUrl('JobInvitations')}
            className="mt-auto inline-block text-center w-full bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full py-2.5 transition-colors"
          >
            View Invitations
          </Link>
        </div>
      )}
    </div>
  );
}
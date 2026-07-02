import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Send } from 'lucide-react';

export default function ClientRecentApplications({ applications }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Recent Applications</h3>
        <Link to={createPageUrl('ClientApplications')} className="text-xs font-medium text-gray-500 hover:text-gray-900">
          View all
        </Link>
      </div>
      {applications.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No applications yet</div>
      ) : (
        <div className="space-y-1">
          {applications.slice(0, 5).map((app) => (
            <div key={app.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{app.artist_email}</p>
                  <p className="text-xs text-gray-400">{app.created_date ? new Date(app.created_date).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize flex-shrink-0">
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
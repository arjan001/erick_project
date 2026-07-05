import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Zap } from 'lucide-react';

export default function ConnectsTrackerCard({ connects }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-6 bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Connects</h2>
        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Zap className="w-4 h-4 text-gray-600" />
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-gray-900 mb-1">{connects ?? '—'}</div>
        <div className="text-xs text-gray-500">Connects left</div>
      </div>
      <Link
        to={createPageUrl('ArtistSubscriptionCheckout')}
        className="mt-4 text-center w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
      >
        Get More Connects
      </Link>
    </div>
  );
}
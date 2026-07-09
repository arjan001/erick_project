import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Zap } from 'lucide-react';

export default function ConnectsTrackerCard({ connects }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Connects</h2>
        <span className="w-8 h-8 rounded-xl bg-[#E9C46A]/20 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-[#E9C46A]" />
        </span>
      </div>
      <div className="flex items-center justify-center py-2">
        <div className="text-5xl font-extrabold tracking-tight">{connects ?? '—'}</div>
      </div>
      <div className="text-center text-xs text-gray-400 font-medium mb-4">Connects available</div>
      <Link
        to={createPageUrl('ArtistSubscriptionCheckout')}
        className="block w-full bg-[#E9C46A] hover:bg-[#ddb94f] text-gray-900 text-xs font-semibold rounded-xl py-3 transition-all hover:shadow-lg text-center"
      >
        Get Connects
      </Link>
    </div>
  );
}
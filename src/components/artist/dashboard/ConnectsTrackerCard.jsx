import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Zap } from 'lucide-react';

export default function ConnectsTrackerCard({ connects }) {
  return (
    <div className="rounded-3xl bg-gray-900 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-7 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold">Connects</h2>
        <span className="w-9 h-9 rounded-2xl bg-[#E9C46A]/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-[#E9C46A]" />
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-5xl font-extrabold tracking-tight mb-1">{connects ?? '—'}</div>
        <div className="text-xs text-gray-400 font-medium">Connects available</div>
      </div>
      <Link
        to={createPageUrl('ArtistSubscriptionCheckout')}
        className="mt-6 text-center w-full bg-[#E9C46A] hover:bg-[#ddb94f] text-gray-900 text-sm font-semibold rounded-2xl py-3 transition-colors"
      >
        Get More Connects
      </Link>
    </div>
  );
}
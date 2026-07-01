import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Zap } from 'lucide-react';

// Dark "Time Tracker" style card — repurposed to show connects balance
export default function ConnectsTrackerCard({ connects }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Connects</h2>
        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-amber-400" />
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-1">{connects ?? '—'}</div>
        <div className="text-xs text-gray-400">Connects left</div>
      </div>
      <Link
        to={createPageUrl('Pricing')}
        className="mt-4 text-center w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full py-2.5 transition-colors"
      >
        Get More Connects
      </Link>
    </div>
  );
}
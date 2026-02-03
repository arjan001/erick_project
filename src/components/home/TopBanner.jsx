import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function TopBanner() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const allEntries = await base44.entities.TickerEntry.list();
        const liveEntries = allEntries
          .filter(e => e.status === 'live')
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setEntries(liveEntries);
      } catch (error) {
        console.error('Error fetching ticker entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  const defaultMessages = [
    'New commercial project posted in Berlin',
    'Documentary project reached 45k of 80k',
    'Short film secured full backing and moving to production',
    'Feature film production started, crew assembling',
    'Music video successfully backed and in post-production',
    'Independent filmmaker joined the network',
    'Production team available for bookings across Europe',
    'New 3D animation project seeking specialists',
    'Documentary collective expanded to Spain',
    'Brand campaign completed ahead of schedule',
    'First project successfully delivered to client',
    'Emerging director added portfolio to platform'
  ];

  const displayEntries = entries.length > 0 
    ? entries.map(e => ({ text: e.text, link_type: e.link_type, link_target_id: e.link_target_id }))
    : defaultMessages.map(msg => ({ text: msg, link_type: 'none' }));

  const tickerItems = [...displayEntries, ...displayEntries];

  const renderItem = (item, idx) => {
    if (item.link_type === 'project' && item.link_target_id) {
      return (
        <Link
          key={idx}
          to={createPageUrl('Projects')}
          className="px-8 text-sm font-medium flex items-center h-full border-r border-gray-300 last:border-r-0 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {item.text}
        </Link>
      );
    }

    return (
      <div
        key={idx}
        className="px-8 text-sm font-medium flex items-center h-full border-r border-gray-300 last:border-r-0"
      >
        {item.text}
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[40px] bg-[#F5F5F5] text-[#4A4A4A] z-50 overflow-hidden border-b border-gray-200">
      <div className="flex items-center h-full">
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scroll-container {
            animation: scroll ${40 + displayEntries.length * 3}s linear infinite;
          }
          .scroll-container:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="scroll-container flex whitespace-nowrap">
          {tickerItems.map((item, idx) => renderItem(item, idx))}
        </div>
      </div>
    </div>
  );
}
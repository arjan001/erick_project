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

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  const defaultMessages = [
    'Studio22 connects creators across Europe',
    'Post your project, discover your team',
    'Backing and partnerships available',
    'Production support in 12 countries'
  ];

  const displayEntries = entries.length > 0 
    ? entries.map(e => ({ text: e.text, amount: e.amount, link_type: e.link_type, link_target_id: e.link_target_id }))
    : defaultMessages.map(msg => ({ text: msg, amount: null, link_type: 'none' }));

  // Duplicate for seamless loop
  const tickerItems = [...displayEntries, ...displayEntries];

  const renderItem = (item, idx) => {
    const content = item.amount 
      ? `${item.text} (${item.amount})`
      : item.text;

    if (item.link_type === 'project' && item.link_target_id) {
      return (
        <Link
          key={idx}
          to={createPageUrl('Projects')}
          className="px-6 text-sm font-medium flex items-center h-full border-r border-gray-700 last:border-r-0 hover:bg-gray-900 transition-colors cursor-pointer"
        >
          {content}
        </Link>
      );
    } else if (item.link_type === 'backed_discovery') {
      return (
        <Link
          key={idx}
          to={createPageUrl('BackedProjects')}
          className="px-6 text-sm font-medium flex items-center h-full border-r border-gray-700 last:border-r-0 hover:bg-gray-900 transition-colors cursor-pointer"
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        key={idx}
        className="px-6 text-sm font-medium flex items-center h-full border-r border-gray-700 last:border-r-0"
      >
        {content}
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[40px] bg-black text-white z-50 overflow-hidden">
      <div className="flex items-center h-full">
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scroll-container {
            animation: scroll ${40 + displayEntries.length * 2}s linear infinite;
            animation-play-state: running;
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
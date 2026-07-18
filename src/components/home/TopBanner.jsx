import React, { useEffect, useState } from 'react';
import { TickerEntry, Article } from '@/lib/supabaseEntities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { features } from '@/lib/settings';

export default function TopBanner() {
  const [entries, setEntries] = useState([]);
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);

  useEffect(() => {
    const checkMarquee = async () => {
      const enabled = await features.isMarqueeEnabled();
      setMarqueeEnabled(enabled);
    };
    checkMarquee();
  }, []);

  useEffect(() => {
    if (!marqueeEnabled) return;

    const fetchData = async () => {
      try {
        const [tickerData, articlesData] = await Promise.all([
          TickerEntry.list('-display_order', 100),
          Article.list('-published_date', 100)
        ]);
        
        const liveEntries = tickerData
          .filter(e => e.status === 'live')
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        setEntries(liveEntries.filter(e => e.text));
        
        // Create a map of articles for easy lookup
        const articlesMap = {};
        articlesData.forEach(article => {
          articlesMap[article.id] = article;
        });
        setArticles(articlesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [marqueeEnabled]);

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
    ? entries.map(e => ({ 
        text: e.text, 
        link_type: e.link_type, 
        link_url: e.link_url,
        link_target_id: e.link_target_id 
      }))
    : defaultMessages.map(msg => ({ text: msg, link_type: 'none' }));

  const tickerItems = [...displayEntries, ...displayEntries];

  const renderItem = (item, idx) => {
    if (item.link_type === 'article' && item.link_target_id) {
      const article = articles[item.link_target_id];
      if (article) {
        return (
          <Link
            key={idx}
            to={`/article/${article.slug}`}
            className="px-8 text-sm font-medium flex items-center h-full border-r border-gray-300 last:border-r-0 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {item.text}
          </Link>
        );
      }
    }

    if (item.link_type === 'url' && item.link_url) {
      return (
        <a
          key={idx}
          href={item.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 text-sm font-medium flex items-center h-full border-r border-gray-300 last:border-r-0 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {item.text}
        </a>
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

  if (loading) {
    return null;
  }

  if (!marqueeEnabled) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-[40px] bg-[#F5F5F5] text-[#4A4A4A] z-50 overflow-hidden border-b border-gray-200">
      <div className="flex items-center h-full">
        <style>{`
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
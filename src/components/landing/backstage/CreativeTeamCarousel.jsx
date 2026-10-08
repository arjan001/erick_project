import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TalentCard from './TalentCard';
import { talentProfiles } from './talentData';
import { FeaturedCreative } from '@/lib/supabaseEntities';

export default function CreativeTeamCarousel() {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCreatives();
  }, []);

  const loadFeaturedCreatives = async () => {
    try {
      const data = await FeaturedCreative.filter({ is_active: true }, 'order_index', 50);
      if (data && data.length > 0) {
        // Transform backend data to match TalentCard format
        const transformed = data.map(c => ({
          id: c.id,
          name: c.name,
          location: c.location,
          profession: c.profession,
          images: c.images ? (Array.isArray(c.images) ? c.images : JSON.parse(c.images)) : [c.profile_image].filter(Boolean),
          overlayText: c.overlay_text,
          badges: c.badges ? (Array.isArray(c.badges) ? c.badges : JSON.parse(c.badges)) : [],
        }));
        setCreatives(transformed);
      } else {
        // Fallback to dummy data if no backend data
        setCreatives(talentProfiles);
      }
    } catch (err) {
      console.error('Error loading featured creatives:', err);
      // Fallback to dummy data on error
      setCreatives(talentProfiles);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#F5F3EF] py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-black/60">Meet our creative community</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-black md:text-4xl">
              A sample of our <span className="text-[#4F46E5]">creative team</span>
            </h2>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // Duplicate each set so the CSS translate loop is seamless
  const displayCreatives = creatives.length > 0 ? creatives : talentProfiles;
  const row1 = [...displayCreatives.slice(0, 6), ...displayCreatives.slice(0, 6)];
  const row2 = [...displayCreatives.slice(6, 12), ...displayCreatives.slice(6, 12)];

  function AutoScrollRow({ items, direction }) {
    const [paused, setPaused] = useState(false);

    return (
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-4 w-max"
          style={{
            animation: `talent-scroll-${direction} 40s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {items.map((profile, i) => (
            <div key={`${profile.id}-${i}`} className="w-[calc((100vw-6rem)/5)] max-w-[260px] min-w-[180px] shrink-0">
              <TalentCard profile={profile} showActions={false} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#F5F3EF] py-16 md:py-20">
      {/* Keyframes for both directions */}
      <style>{`
        @keyframes talent-scroll-rtl {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes talent-scroll-ltr {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-medium text-black/60">Meet our creative community</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-black md:text-4xl">
            A sample of our <span className="text-[#4F46E5]">creative team</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-black/50 md:text-base">
            Browse vetted performers, creators, and crew — explore the full directory to find your match.
          </p>
        </div>

        {/* Two auto-scrolling rows — opposite directions, pause on hover */}
        <div className="mt-8 space-y-4">
          <AutoScrollRow items={row1} direction="rtl" />
          <AutoScrollRow items={row2} direction="ltr" />
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/talent"
            className="inline-flex items-center gap-2 rounded-full bg-[#4F46E5] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/20 transition-transform hover:scale-105"
          >
            Explore All Talent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

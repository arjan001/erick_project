import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TalentCard from './TalentCard';
import { talentProfiles } from './talentData';

export default function CreativeTeamCarousel() {
  const scrollRef = useRef(null);

  // Duplicate the sample so the auto-scroll loops seamlessly
  const sample = [...talentProfiles.slice(0, 8), ...talentProfiles.slice(0, 8)];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf;
    const tick = () => {
      if (!el) return;
      el.scrollLeft += 0.5; // slow continuous scroll
      // loop back to start when we reach the halfway point (end of first set)
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="bg-[#F5F3EF] py-16 md:py-20">
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

        {/* Auto-scrolling carousel — no controls */}
        <div
          ref={scrollRef}
          className="mt-8 flex gap-4 overflow-x-scroll pb-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sample.map((profile, i) => (
            <div key={`${profile.id}-${i}`} className="w-[240px] shrink-0 sm:w-[280px]">
              <TalentCard profile={profile} />
            </div>
          ))}
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

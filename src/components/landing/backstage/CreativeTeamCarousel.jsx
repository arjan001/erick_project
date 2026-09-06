import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TalentCard from './TalentCard';
import { talentProfiles } from './talentData';

// Duplicate each set so the CSS translate loop is seamless
const row1 = [...talentProfiles.slice(0, 6), ...talentProfiles.slice(0, 6)];
const row2 = [...talentProfiles.slice(6, 12), ...talentProfiles.slice(6, 12)];

function AutoScrollRow({ items, direction }) {
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-4 w-max"
        style={{
          animation: `talent-scroll-${direction} 40s linear infinite`,
        }}
      >
        {items.map((profile, i) => (
          <div key={`${profile.id}-${i}`} className="w-[calc((100vw-6rem)/5)] max-w-[260px] shrink-0">
            <TalentCard profile={profile} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreativeTeamCarousel() {
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

        {/* Two auto-scrolling rows — opposite directions, ~5 cards visible */}
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

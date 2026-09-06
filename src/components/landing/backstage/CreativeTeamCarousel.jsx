import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import TalentCard from './TalentCard';
import { talentProfiles, talentTabs } from './talentData';

export default function CreativeTeamCarousel() {
  const [activeTab, setActiveTab] = useState('actors');
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  // Show first 8 profiles in the carousel sample
  const sample = talentProfiles.slice(0, 8);

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
            Browse vetted performers, creators, and crew — filter by type to find the right match.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-black/[0.06] p-1">
            {talentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#6366f1] text-white'
                    : 'text-black/70 hover:text-black'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Carousel controls */}
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">
            {talentTabs.find((t) => t.id === activeTab)?.label}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5"
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5"
            >
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="mt-6 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]"
        >
          {sample.map((profile) => (
            <div key={profile.id} className="w-[260px] shrink-0 sm:w-[280px]">
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

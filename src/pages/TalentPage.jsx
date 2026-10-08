import React, { useState } from 'react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import SEOMetaTags from '@/components/SEOMetaTags'
import TalentCard from '@/components/landing/backstage/TalentCard'
import CreatorProfileModal from '@/components/landing/backstage/CreatorProfileModal'
import { talentProfiles, talentTabs, filterTags } from '@/components/landing/backstage/talentData'
import { Search, SlidersHorizontal, ChevronDown, CheckSquare, HelpCircle, ZoomIn } from 'lucide-react'

export default function TalentPage() {
  const [activeTab, setActiveTab] = useState('actors')
  const [activeTag, setActiveTag] = useState(null)
  const [autoplay, setAutoplay] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState(null)

  return (
    <div className="min-h-screen bg-[#1a1a23]">
      <SEOMetaTags
        title="Discover Talent — Actors, Creators, Voiceover & Crew | SmartGigs Kenya"
        description="Browse thousands of vetted performers, UGC creators, voiceover artists, and crew across all locations."
        keywords="find talent, actors, performers, UGC creators, voiceover, crew"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Discover Talent', description: 'Browse vetted talent' }}
      />
      <Navbar />

      {/* Page heading */}
      <div className="px-4 pb-6 pt-8 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Discover Talent</h1>
          <p className="mt-2 text-sm text-white/65 md:text-base">
            Browse vetted actors, crew and creators — search by skill, location and tag.
          </p>
        </div>
      </div>

      {/* Sub-header tabs */}
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {talentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id
                    ? 'bg-[#6366f1] text-white'
                    : 'text-black/70 hover:bg-black/[0.04]'
                  }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <button className="hidden shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.03] lg:flex">
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 pt-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Popular Actor & Performers Searches"
              className="w-full rounded-full border border-black/10 bg-white py-3 pl-12 pr-4 text-sm text-black placeholder:text-black/40 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
            />

            {/* Filter tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${activeTag === tag
                      ? 'border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]'
                      : 'border-black/10 bg-white text-black/70 hover:bg-black/[0.03]'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main action bar */}
      <div className="bg-white px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <button className="flex items-center gap-2 rounded-full bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5558e0]">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          <p className="text-sm font-medium text-black/60">
            10,000 Actors & Performers across All Locations
          </p>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-black/70">
              <ZoomIn className="h-4 w-4" />
              Autoplay on zoom
              <button
                onClick={() => setAutoplay(!autoplay)}
                className={`relative h-5 w-9 rounded-full transition-colors ${autoplay ? 'bg-[#6366f1]' : 'bg-black/15'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${autoplay ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>

            <button className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.03]">
              Sort by
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <button className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.03]">
              <CheckSquare className="h-4 w-4" />
              Bulk Actions
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-[#fff0e0] px-4 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-2xl bg-white p-4 md:p-6">
            <h2 className="mb-6 text-xl font-bold text-black md:text-2xl">
              🔥 Top Actors and Performers
            </h2>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {talentProfiles.map((profile) => (
                <TalentCard
                  key={profile.id}
                  profile={profile}
                  onOpenProfile={setSelectedProfile}
                />
              ))}
            </div>

            {/* Load more */}
            <div className="mt-8 flex justify-center">
              <button className="rounded-full border border-black/15 bg-white px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-black/[0.03]">
                Load More Talent
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ChatWidget />

      {/* Creator profile modal */}
      <CreatorProfileModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}

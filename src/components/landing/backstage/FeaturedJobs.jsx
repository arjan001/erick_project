import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import RoleToggle from './RoleToggle';

const tabs = [
  'FEATURE FILMS',
  'TV SHOWS',
  'COMMERCIALS',
  'MODELING',
  'VOICEOVER',
  'UGC',
  'CREW',
  'THEATER',
  'BROWSE ALL JOBS',
];

const jobs = [
  {
    title: 'American Feature Film, Extras',
    project: 'Prisoners',
    detail: 'Background / Extra, Mal...',
    body: 'Casting an American feature film with high-profile talent.',
    location: 'Sydney, NSW',
  },
  {
    title: 'TV Drama Series, Lead Role',
    project: 'The Diplomat',
    detail: 'Lead / Series Regular, Dram...',
    body: 'Casting a streaming TV drama series seeking a lead performer.',
    location: 'Los Angeles, CA',
  },
  {
    title: 'National Commercial, Spokesperson',
    project: 'Brand X',
    detail: 'Principal / Spokesperson, Nat...',
    body: 'Casting a national commercial campaign for a major consumer brand.',
    location: 'New York, NY',
  },
  {
    title: 'Broadway Musical — Ensemble',
    project: 'Hamilton Revival',
    detail: 'Ensemble / Singer-Dancer...',
    body: 'Casting ensemble performers for an upcoming Broadway musical revival.',
    location: 'New York, NY',
  },
  {
    title: 'UGC Creator — Tech Reviews',
    project: 'TechBrand',
    detail: 'Creator / On-Camera, Remote...',
    body: 'Seeking UGC creators to produce authentic tech product review content.',
    location: 'Remote',
  },
  {
    title: 'Voiceover — Audiobook Narration',
    project: 'Penguin Audio',
    detail: 'Narrator / Voiceover, Remote...',
    body: 'Casting a voiceover artist for audiobook narration of a contemporary fiction title.',
    location: 'Remote',
  },
];

export default function FeaturedJobs() {
  const [role, setRole] = useState('talent');
  const [activeTab, setActiveTab] = useState('FEATURE FILMS');
  const [active, setActive] = useState(0);

  return (
    <section className="bg-[#F5F3EF] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        {/* Toggle */}
        <div className="flex justify-center">
          <RoleToggle active={role} onChange={setRole} />
        </div>

        <h2 className="mt-8 text-center text-3xl font-bold text-black md:text-4xl">
          Featured Jobs
        </h2>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs font-bold tracking-wide transition-colors ${
                activeTab === t
                  ? 'text-[#4b55ff] underline underline-offset-4'
                  : 'text-black hover:text-black/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative mt-10">
          <div className="flex items-center gap-5 overflow-hidden">
            {jobs.map((job, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === active ? 1 : 0.92,
                  opacity: i === active ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
                className={`w-full shrink-0 rounded-3xl bg-white p-7 shadow-sm ${
                  i === active ? 'ring-1 ring-black/5' : ''
                }`}
                style={{ maxWidth: 'calc(33.333% - 1.25rem)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-black">{job.title}</h3>
                  <div className="flex items-center gap-2 rounded-xl bg-[#F3F2EF] px-3 py-2">
                    <div>
                      <p className="text-sm font-bold text-black">{job.project}</p>
                      <p className="text-xs text-black/50">{job.detail}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-black/40" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-black/70">{job.body}</p>
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-black/40">
                    Location
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-black">
                    <MapPin className="h-4 w-4 text-black/40" />
                    {job.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-black/5"
          >
            <ChevronLeft className="h-5 w-5 text-black" />
          </button>
          <button
            onClick={() => setActive((a) => Math.min(jobs.length - 1, a + 1))}
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-black/5"
          >
            <ChevronRight className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="mt-8 flex justify-center gap-2">
          {jobs.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === active ? 'bg-[#4b55ff]' : 'bg-black/15'
              }`}
            />
          ))}
        </div>

        {/* Section below */}
        <div className="mt-20 text-center">
          <p className="text-sm font-medium text-black/70">
            Helping creatives across all specialties
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-black md:text-5xl">
            How Eric Rabar works <span className="text-[#4b55ff]">for you</span>
          </h2>
        </div>
      </div>
    </section>
  );
}

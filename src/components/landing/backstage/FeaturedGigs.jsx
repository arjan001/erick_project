import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, BadgeCheck, Search } from 'lucide-react';
import { Job } from '@/lib/supabaseEntities';
import GigDetailSlideOut from './GigDetailSlideOut';

const tabs = [
  'Feature Films',
  'TV Shows',
  'Commercials',
  'Modeling',
  'Voiceover',
  'UGC',
  'Crew',
  'Theater',
  'Browse All Gigs',
];

const fallbackGigs = [
  {
    id: 1,
    title: 'Stylized Documentary B-roll Shoot',
    description: 'Casting a stylized documentary B-roll shoot for an upcoming brand campaign.',
    location: 'Cool Springs, TN',
    roles: [
      { name: 'Female, Lead', detail: 'Female, 30-39' },
      { name: 'Male, Supporting', detail: 'Male, 25-35' },
    ],
  },
  {
    id: 2,
    title: 'American Feature Film, Extras',
    description: 'Casting an American feature film with high-profile talent.',
    location: 'Sydney, NSW',
    roles: [
      { name: 'Background / Extra', detail: 'Any gender, 18-60' },
      { name: 'Featured Extra', detail: 'Female, 20-30' },
      { name: 'Stand-in', detail: 'Male, 30-45' },
    ],
  },
  {
    id: 3,
    title: 'TV Drama Series, Lead Role',
    description: 'Casting a streaming TV drama series seeking a lead performer.',
    location: 'Los Angeles, CA',
    roles: [
      { name: 'Lead / Series Regular', detail: 'Female, 25-35' },
      { name: 'Recurring Guest', detail: 'Male, 30-40' },
    ],
  },
  {
    id: 4,
    title: 'National Commercial, Spokesperson',
    description: 'Casting a national commercial campaign for a major consumer brand.',
    location: 'New York, NY',
    roles: [
      { name: 'Principal / Spokesperson', detail: 'Any gender, 28-45' },
      { name: 'Supporting Cast', detail: 'Female, 20-30' },
    ],
  },
  {
    id: 5,
    title: 'Broadway Musical — Ensemble',
    description: 'Casting ensemble performers for an upcoming Broadway musical revival.',
    location: 'New York, NY',
    roles: [
      { name: 'Ensemble / Singer-Dancer', detail: 'Any gender, 20-35' },
      { name: 'Understudy', detail: 'Male, 25-40' },
    ],
  },
  {
    id: 6,
    title: 'UGC Creator — Tech Reviews',
    description: 'Seeking UGC creators to produce authentic tech product review content.',
    location: 'Remote',
    roles: [
      { name: 'Creator / On-Camera', detail: 'Any gender, 20-40' },
      { name: 'Voiceover Host', detail: 'Any gender, 25-45' },
    ],
  },
];

// Country data for global API simulation
const countries = [
  { code: 'KE', name: 'Kenya', regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
  { code: 'US', name: 'United States', regions: ['California', 'New York', 'Texas', 'Florida', 'Illinois'] },
  { code: 'UK', name: 'United Kingdom', regions: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'] },
  { code: 'ZA', name: 'South Africa', regions: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
  { code: 'NG', name: 'Nigeria', regions: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'] },
  { code: 'CA', name: 'Canada', regions: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { code: 'AU', name: 'Australia', regions: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { code: 'DE', name: 'Germany', regions: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'] },
  { code: 'FR', name: 'France', regions: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  { code: 'IN', name: 'India', regions: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'] },
];

export default function FeaturedGigs() {
  const [activeTab, setActiveTab] = useState('Feature Films');
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const [jobs, setGigs] = useState(fallbackGigs);
  const [selectedGig, setSelectedGig] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');
  const [talentTypeFilter, setTalentTypeFilter] = useState('');

  useEffect(() => {
    Gig.filter({ is_featured: true }, '-posted_at', 7)
      .then((rows) => {
        if (rows && rows.length > 0) {
          setGigs(rows.map(j => ({
            id: j.id,
            title: j.title || 'Untitled Role',
            description: j.description || j.short_description || '',
            location: j.location || 'Remote',
            roles: j.roles || [{ name: j.title || 'Role', detail: j.job_type || '' }],
          })));
        }
      })
      .catch(() => { /* keep fallback data */ });
  }, []);

  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3;
    return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  };

  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, jobs.length - cardsPerView);

  const scrollTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, maxIndex));
    setActive(clamped);
    if (trackRef.current) {
      const cardWidth = trackRef.current.scrollWidth / jobs.length;
      trackRef.current.style.transform = `translateX(-${clamped * cardWidth}px)`;
    }
  };

  const handleFilterSubmit = () => {
    const params = new URLSearchParams();
    if (locationFilter) params.append('location', locationFilter);
    if (projectTypeFilter) params.append('projectType', projectTypeFilter);
    if (talentTypeFilter) params.append('talentType', talentTypeFilter);
    navigate(`/Gigs?${params.toString()}`);
  };

  return (
    <section className="bg-[#F5F3EF] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-black md:text-4xl">
          Featured Gigs
        </h2>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs font-bold tracking-wide transition-colors ${activeTab === t
                ? 'text-[#4F46E5] underline underline-offset-4'
                : 'text-black/70 hover:text-black'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative mt-10 overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-5 transition-transform duration-500 ease-out"
          >
            {jobs.map((job, i) => (
              <div
                key={job.id || i}
                onClick={() => setSelectedGig(job)}
                className="block w-full shrink-0 cursor-pointer rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md md:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.25rem)] md:p-7"
              >
                {/* Left: job info / Right: roles */}
                <div className="flex gap-5">
                  {/* Gig info */}
                  <div className="flex-1 min-w-0">
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#e11d48] px-2.5 py-0.5 text-xs font-bold text-white">
                      <BadgeCheck className="h-3 w-3" /> Featured
                    </span>
                    <h3 className="text-lg font-bold leading-tight text-black">{job.title}</h3>
                    <p className="mt-3 text-sm text-black/70 line-clamp-3">{job.description}</p>
                    <div className="mt-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-black/40">
                        LOCATION
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-black">
                        <MapPin className="h-4 w-4 text-black/40" />
                        {job.location}
                      </p>
                    </div>
                  </div>

                  {/* Roles list */}
                  {job.roles && job.roles.length > 0 && (
                    <div className="hidden w-32 shrink-0 flex-col gap-2 sm:flex">
                      {job.roles.slice(0, 3).map((role, ri) => (
                        <div
                          key={ri}
                          className="flex items-center justify-between gap-2 rounded-xl bg-[#F7F6F3] px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-black">{role.name}</p>
                            <p className="truncate text-[10px] text-black/50">{role.detail}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-black/40" />
                        </div>
                      ))}
                      {job.roles.length > 3 && (
                        <p className="text-center text-[10px] font-medium text-[#4F46E5]">
                          +{job.roles.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={() => scrollTo(active - 1)}
            disabled={active === 0}
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-black/5 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5 text-black" />
          </button>
          <button
            onClick={() => scrollTo(active + 1)}
            disabled={active >= maxIndex}
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-black/5 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${i === active
                ? 'border-[#4F46E5] bg-[#4F46E5]'
                : 'border-[#4F46E5]/40 bg-transparent'
                }`}
            />
          ))}
        </div>

        {/* Filter bar below carousel */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black/70 focus:border-[#4F46E5] focus:outline-none"
          >
            <option value="">Gig location</option>
            {countries.map((country) => (
              <optgroup key={country.code} label={country.name}>
                <option value={`${country.name}, Nationwide`}>{country.name}, Nationwide</option>
                {country.regions.map((region) => (
                  <option key={region} value={`${region}, ${country.name}`}>{region}, {country.name}</option>
                ))}
              </optgroup>
            ))}
            <option value="Remote">Remote</option>
          </select>
          <select
            value={projectTypeFilter}
            onChange={(e) => setProjectTypeFilter(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black/70 focus:border-[#4F46E5] focus:outline-none"
          >
            <option value="">Project Type</option>
            <option value="Feature Film">Feature Film</option>
            <option value="TV Show">TV Show</option>
            <option value="Commercial">Commercial</option>
            <option value="Theater">Theater</option>
            <option value="UGC">UGC</option>
            <option value="Voiceover">Voiceover</option>
            <option value="Modeling">Modeling</option>
            <option value="Crew">Crew</option>
          </select>
          <select
            value={talentTypeFilter}
            onChange={(e) => setTalentTypeFilter(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black/70 focus:border-[#4F46E5] focus:outline-none"
          >
            <option value="">Talent Type</option>
            <option value="Actor">Actor</option>
            <option value="Voiceover">Voiceover</option>
            <option value="Crew">Crew</option>
            <option value="Model">Model</option>
            <option value="Content Creator">Content Creator</option>
            <option value="Director">Director</option>
            <option value="Producer">Producer</option>
          </select>
          <button
            onClick={handleFilterSubmit}
            className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4338CA]"
          >
            <Search className="h-4 w-4" />
            Explore Gigs
          </button>
        </div>
      </div>

      {/* Gig detail slide-out */}
      <GigDetailSlideOut job={selectedGig} onClose={() => setSelectedGig(null)} />
    </section>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, ChevronRight, Share2, Heart, BadgeCheck } from 'lucide-react';
import Navbar from '@/components/landing/backstage/Navbar';
import Footer from '@/components/landing/backstage/Footer';
import Marquee from '@/components/landing/backstage/Marquee';
import GigDetailSlideOut from '@/components/landing/backstage/GigDetailSlideOut';
import { Job } from '@/lib/supabaseEntities';

const dummyJobs = [
  {
    id: 1, title: 'Russian-Language Short Drama', pay: 'Pay not specified', location: 'Worldwide',
    posted: 'Wednesday', featured: true,
    description: 'Casting a Russian-language short drama exploring themes of family, migration, and identity. Seeking authentic Russian-speaking performers for lead and supporting roles. Shoot dates flexible, remote audition process available.',
    tags: ['Short Film', 'Drama', 'Russian Speaking'],
    roles: [{ title: 'American Voiceover Artist', pay: '$200/day' }],
  },
  {
    id: 2, title: 'Corporate Doc-Style Interview', pay: 'Roles paying up to $500/day', location: 'New York, NY',
    posted: 'Tuesday', featured: true,
    description: 'Seeking professionals for a corporate documentary-style interview series. Looking for authentic, on-camera presence for a series of branded content pieces for a Fortune 500 technology company.',
    tags: ['Corporate', 'Documentary', 'Branded Content'],
    roles: [
      { title: 'Director', pay: '$500/day' },
      { title: 'Gaffer', pay: '$350/day' },
      { title: 'Hair & Makeup', pay: '$300/day' },
    ],
  },
  {
    id: 3, title: 'Netflix Original Series — Lead Role', pay: 'Competitive pay', location: 'Atlanta, GA',
    posted: 'Monday', featured: true,
    description: 'Major streaming platform casting the lead role for an upcoming original drama series. Seeking a Black female performer, ages 25-35, with strong dramatic training and on-camera experience. This is a series regular role.',
    tags: ['TV Series', 'Drama', 'Lead Role', 'Netflix'],
    roles: [{ title: 'Series Lead — Female, 25-35', pay: 'SAG Scale + Negotiation' }],
  },
  {
    id: 4, title: 'National Commercial — Spokesperson', pay: 'Roles paying up to $2,500', location: 'Los Angeles, CA',
    posted: 'Friday', featured: false,
    description: 'Casting a national commercial campaign for a major consumer brand. Seeking a charismatic Black male spokesperson, ages 30-45, with natural on-camera presence. Non-union welcome.',
    tags: ['Commercial', 'Spokesperson', 'National'],
    roles: [{ title: 'Principal Spokesperson — Male, 30-45', pay: '$2,500 flat' }],
  },
  {
    id: 5, title: 'Broadway Musical — Ensemble', pay: 'SAG-AFTRA scale', location: 'New York, NY',
    posted: 'Thursday', featured: false,
    description: 'Casting ensemble performers for an upcoming Broadway musical revival. Seeking strong singers and dancers of all ethnicities. Must be available for rehearsals starting next month. Equity and non-equity performers welcome.',
    tags: ['Theater', 'Musical', 'Broadway', 'Ensemble'],
    roles: [
      { title: 'Ensemble Singer/Dancer', pay: 'Equity Scale' },
      { title: 'Understudy — Lead', pay: 'Equity Scale' },
    ],
  },
  {
    id: 6, title: 'UGC Creator — Tech Product Reviews', pay: '$500/day', location: 'Remote',
    posted: 'Today', featured: true,
    description: 'Seeking UGC creators to produce authentic tech product review content for social media campaigns. Looking for Black creators with an established social presence and engaging on-camera personality. Flexible schedule.',
    tags: ['UGC', 'Content Creator', 'Tech', 'Remote'],
    roles: [{ title: 'UGC Creator', pay: '$500/day' }],
  },
  {
    id: 7, title: 'Independent Feature Film — Supporting Cast', pay: 'Deferred pay', location: 'Chicago, IL',
    posted: 'Sunday', featured: false,
    description: 'Indie feature film casting supporting roles for a coming-of-age drama set in Chicago. Seeking authentic local talent, ages 18-25, for several supporting roles. Shoot spans 3 weeks.',
    tags: ['Feature Film', 'Indie', 'Drama'],
    roles: [
      { title: 'Supporting — Male, 18-25', pay: 'Deferred' },
      { title: 'Supporting — Female, 18-25', pay: 'Deferred' },
    ],
  },
  {
    id: 8, title: 'Voiceover — Audiobook Narration', pay: '$300/finished hour', location: 'Remote',
    posted: 'Saturday', featured: false,
    description: 'Casting a voiceover artist for audiobook narration of a contemporary fiction title. Seeking a warm, engaging voice with clear articulation. Remote recording, must have home studio setup.',
    tags: ['Voiceover', 'Audiobook', 'Remote'],
    roles: [{ title: 'Narrator — Any Gender', pay: '$300/finished hour' }],
  },
];

const filterOptions = {
  location: ['Any Location', 'New York, NY', 'Los Angeles, CA', 'Atlanta, GA', 'Chicago, IL', 'Remote', 'Worldwide'],
  jobType: ['Any Type', 'Feature Film', 'TV Series', 'Commercial', 'Theater', 'Voiceover', 'UGC', 'Short Film'],
  gender: ['Any Gender', 'Male', 'Female', 'Non-Binary'],
  age: ['Any Age', '18-25', '25-35', '30-45', '45-55', '55+'],
};

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-w-[140px] flex-1 sm:flex-none">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-black/70 hover:border-gray-300 sm:px-4"
      >
        <span className="truncate">{value || label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-black/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt === options[0] ? '' : opt); setOpen(false); }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${value === opt ? 'font-bold text-[#4f46e5]' : 'text-black/70'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FindJobsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ location: '', jobType: '', gender: '', age: '' });
  const [view, setView] = useState('roles');
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [allJobs, setAllJobs] = useState(dummyJobs);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 5;

  // Fetch jobs from base44 database on mount, fall back to dummy data
  useEffect(() => {
    let cancelled = false;
    Job.list('-created_at', 50)
      .then((data) => {
        if (cancelled || !data || data.length === 0) return;
        const mapped = data.map((j) => ({
          id: j.id,
          title: j.title || j.name || 'Untitled Job',
          pay: j.pay || j.salary || 'Pay not specified',
          location: j.location || 'Worldwide',
          posted: j.posted || 'Recently',
          featured: j.featured || false,
          description: j.description || '',
          tags: j.tags || [],
          roles: j.roles || [],
          project: j.project || j.company || '',
        }));
        if (!cancelled) setAllJobs(mapped);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return allJobs.filter((j) => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !(j.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filters.location && j.location !== filters.location) return false;
      if (filters.jobType && !(j.tags || []).some(t => t.toLowerCase().includes(filters.jobType.toLowerCase()))) return false;
      return true;
    });
  }, [search, filters, allJobs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageJobs = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleShare = (job) => {
    const url = window.location.origin + '/FindJobs';
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description?.slice(0, 100) || '', url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  const handleSaveSearch = () => {
    const searchState = JSON.stringify({ search, filters });
    localStorage.setItem('savedJobSearch', searchState);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Marquee />
      <Navbar />

      {/* Filter bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-3 lg:px-8">
          {/* Mobile: search + filter toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-black/40" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search jobs..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex shrink-0 items-center justify-center rounded-lg bg-gray-100 px-3 py-2.5"
            >
              <SlidersHorizontal className="h-4 w-4 text-black/60" />
            </button>
          </div>

          {/* Desktop: all filters inline */}
          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            <FilterDropdown label="Job location" options={filterOptions.location} value={filters.location} onChange={(v) => { setFilters({ ...filters, location: v }); setPage(1); }} />
            <FilterDropdown label="Job Type" options={filterOptions.jobType} value={filters.jobType} onChange={(v) => { setFilters({ ...filters, jobType: v }); setPage(1); }} />
            <FilterDropdown label="Gender" options={filterOptions.gender} value={filters.gender} onChange={(v) => setFilters({ ...filters, gender: v })} />
            <FilterDropdown label="Age" options={filterOptions.age} value={filters.age} onChange={(v) => setFilters({ ...filters, age: v })} />
            <div className="flex-1" />
            <button onClick={() => setPage(1)} className="flex items-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
              <Search className="h-4 w-4" /> Search
            </button>
            <button onClick={handleSaveSearch} className="flex items-center gap-2 rounded-lg border border-[#00D09C] bg-white px-4 py-2.5 text-sm font-semibold text-[#00a37e] hover:bg-[#00D09C]/10">
              <Heart className="h-4 w-4" /> Save Search
            </button>
          </div>

          {/* Mobile: expandable filters */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
              <FilterDropdown label="Job location" options={filterOptions.location} value={filters.location} onChange={(v) => { setFilters({ ...filters, location: v }); setPage(1); }} />
              <FilterDropdown label="Job Type" options={filterOptions.jobType} value={filters.jobType} onChange={(v) => { setFilters({ ...filters, jobType: v }); setPage(1); }} />
              <FilterDropdown label="Gender" options={filterOptions.gender} value={filters.gender} onChange={(v) => setFilters({ ...filters, gender: v })} />
              <FilterDropdown label="Age" options={filterOptions.age} value={filters.age} onChange={(v) => setFilters({ ...filters, age: v })} />
              <button onClick={handleSaveSearch} className="flex items-center gap-2 rounded-lg border border-[#00D09C] bg-white px-4 py-2.5 text-sm font-semibold text-[#00a37e]">
                <Heart className="h-4 w-4" /> Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        {/* Header + toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-base font-bold text-black md:text-lg">
            Showing {filtered.length} jobs near <span className="underline">{filters.location || 'All Locations'}</span>
          </h1>
          {/* Productions/Roles toggle */}
          <div className="inline-flex items-center rounded-full bg-[#4f46e5]/10 p-1">
            <button
              onClick={() => setView('productions')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:px-5 sm:text-sm ${view === 'productions' ? 'bg-[#4f46e5] text-white' : 'text-[#4f46e5]'}`}
            >
              Productions
            </button>
            <button
              onClick={() => setView('roles')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:px-5 sm:text-sm ${view === 'roles' ? 'bg-[#4f46e5] text-white' : 'text-[#4f46e5]'}`}
            >
              Roles
            </button>
          </div>
        </div>

        {/* Desktop search input */}
        <div className="mt-4 hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 lg:flex">
          <Search className="h-4 w-4 text-black/40" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs by title or keyword..."
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Job cards */}
        <div className="mt-5 space-y-4">
          {pageJobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-5 lg:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                {/* Left: main content */}
                <div className="min-w-0 flex-1">
                  {/* Top row: badge + icons */}
                  <div className="flex items-center justify-between">
                    {job.featured ? (
                      <span className="flex items-center gap-1 rounded-full bg-[#e11d48] px-3 py-1 text-xs font-bold text-white">
                        <BadgeCheck className="h-3.5 w-3.5" /> Featured
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleShare(job)} className="rounded-full p-1.5 hover:bg-gray-100" aria-label="Share job">
                        <Share2 className="h-4 w-4 text-black/40" />
                      </button>
                      <button onClick={() => toggleSave(job.id)} className="rounded-full p-1.5 hover:bg-gray-100" aria-label="Save job">
                        <Heart className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-[#e11d48] text-[#e11d48]' : 'text-black/40'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="mt-3 text-lg font-bold text-black md:text-xl">{job.title}</h2>

                  {/* Meta */}
                  <p className="mt-1.5 text-sm text-black/50">
                    {job.pay} • {job.location} • Posted: {job.posted}
                  </p>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-black/70">
                    {job.description.slice(0, 180)}{job.description.length > 180 ? '... ' : ' '}
                    <button onClick={() => setSelectedJob(job)} className="font-semibold text-[#4f46e5] hover:underline">view more</button>
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black/60">{t}</span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-4 rounded-full bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]"
                  >
                    View Details & Apply
                  </button>
                </div>

                {/* Right sidebar: roles — hidden on mobile, shown on md+ */}
                <div className="hidden w-56 shrink-0 space-y-3 border-l border-gray-100 pl-5 md:block">
                  {job.roles.map((r, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 p-3">
                      <p className="text-sm font-bold text-black">{r.title}</p>
                      <p className="mt-0.5 text-xs text-black/50">{r.pay}</p>
                      <button className="mt-2 w-full rounded-full bg-[#4f46e5] py-1.5 text-xs font-semibold text-white hover:bg-[#4338CA]">
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community card */}
        <div className="mt-6 rounded-2xl bg-[#0a0b2e] p-6 text-center md:p-8">
          <h3 className="text-lg font-bold text-white md:text-xl">Forget generic advice—</h3>
          <p className="mt-2 text-sm text-white/70">Join thousands of creatives sharing real experiences, tips, and opportunities.</p>
          <button className="mt-4 rounded-full bg-[#00D09C] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#00b870]">
            Join the Conversation
          </button>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${p === page ? 'bg-[#4f46e5] text-white' : 'bg-white text-black/60 hover:bg-gray-100'
                }`}
            >
              {p}
            </button>
          ))}
          {page < totalPages && (
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black/60 hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Discover section */}
        <div className="mt-12 rounded-2xl bg-gray-900 p-6 md:p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">Discover more of Eric Rabar</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Netflix Auditions', 'Movie Auditions', 'Commercials', 'Voiceover Jobs', 'Theater Auditions', 'Modeling Jobs', 'UGC Gigs', 'Background Extra', 'Remote Jobs', 'Short Film Casting', 'Drama Casting', 'Reality TV'].map((tag) => (
              <Link key={tag} to="/FindJobs" className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/20 hover:text-white md:px-4 md:text-sm">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* Slide-out detail panel */}
      <GigDetailSlideOut job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}

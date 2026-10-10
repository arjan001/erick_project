import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronDown, ChevronRight, Share2, Heart, BadgeCheck, Building2, MapPin, Clock, Users, Briefcase, Calendar } from 'lucide-react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import Marquee from '@/components/landing/backstage/Marquee'
import GigDetailSlideOut from '@/components/landing/backstage/GigDetailSlideOut'
import { Job } from '@/lib/supabaseEntities'
import { supabase } from '@/lib/supabase'

const dummyJobs = [
  {
    id: 1,
    title: "VO Artist Ones: Voiceover (TV Commercial)",
    company: "HEALTH AND WELLNESS TECHNOLOGY",
    compensation: "£800 (est. 2 hours of work)",
    location: "Worldwide",
    posted: "Thursday",
    featured: true,
    is_production: false,
    gender: "Female",
    age: "25-36",
    description: "Casting a Russian-language short drama exploring themes of family, migration, and identity. Seeking authentic Russian-speaking performers for lead and supporting roles.",
    tags: ["Voiceover", "TV Commercial"],
    roles: []
  },
  {
    id: 2,
    title: "The North American Pantheon - Season 2",
    company: "Ambitious Media",
    compensation: "Roles paying up to US$60",
    location: "Los Angeles, CA",
    posted: "14 hours ago",
    featured: true,
    is_production: true,
    description: "TV Show, Scripted, Drama, Limited Series. Multiple roles available for this production.",
    tags: ["TV Show", "Scripted", "Drama", "Limited Series"],
    roles: [
      { title: "Koreatown Crew", compensation: "$800/day", gender: "Korean American", age: "20s-30s" },
      { title: "David", compensation: "$750/day", gender: "Caucasian", age: "20s-30s" },
      { title: "Jasmine", compensation: "$700/day", gender: "African American", age: "20s-30s" },
      { title: "The Oracle", compensation: "$900/day", gender: "Any Ethnicity", age: "50s+" },
      { title: "Royal Guard", compensation: "$650/day", gender: "Any Ethnicity", age: "20s-30s" },
      { title: "Prince", compensation: "$1,000/day", gender: "Any Ethnicity", age: "30s-40s" },
      { title: "Princess", compensation: "$950/day", gender: "Any Ethnicity", age: "20s-30s" },
      { title: "Hero", compensation: "$1,200/day", gender: "Any Ethnicity", age: "25-35" },
      { title: "Villain", compensation: "$1,100/day", gender: "Any Ethnicity", age: "30s-45" },
      { title: "Sidekick", compensation: "$600/day", gender: "Any Ethnicity", age: "18-25" },
      { title: "Mentor", compensation: "$850/day", gender: "Any Ethnicity", age: "40s-60s" },
      { title: "Advisor", compensation: "$700/day", gender: "Any Ethnicity", age: "35s-55" },
      { title: "Guard", compensation: "$550/day", gender: "Any Ethnicity", age: "25-40" },
      { title: "Spy", compensation: "$1,000/day", gender: "Any Ethnicity", age: "25-35" },
      { title: "Diplomat", compensation: "$900/day", gender: "Any Ethnicity", age: "35-50" },
      { title: "Leader", compensation: "$1,200/day", gender: "Any Ethnicity", age: "40s-60s" },
    ]
  },
  {
    id: 3,
    title: "Independent Feature Film - Supporting Cast",
    company: "Indie Productions LLC",
    compensation: "Deferred pay",
    location: "Chicago, IL",
    posted: "Sunday",
    featured: false,
    is_production: true,
    description: "Indie feature film casting supporting roles for a coming-of-age drama set in Chicago.",
    tags: ["Feature Film", "Indie", "Drama"],
    roles: [
      { title: "Supporting — Male, 18-25", compensation: "Deferred" },
      { title: "Supporting — Female, 18-25", compensation: "Deferred" },
      { title: "Lead — Male, 20-30", compensation: "Deferred" },
    ]
  },
  {
    id: 4,
    title: "Broadway Musical — Ensemble",
    company: "Broadway Productions",
    compensation: "SAG-AFTRA scale",
    location: "New York, NY",
    posted: "Thursday",
    featured: false,
    is_production: false,
    description: "Casting ensemble performers for an upcoming Broadway musical revival.",
    tags: ["Theater", "Musical", "Broadway", "Ensemble"],
    roles: []
  },
  {
    id: 5,
    title: "UGC Creator — Tech Product Reviews",
    company: "Content Creators Inc",
    compensation: "$500/day",
    location: "Remote",
    posted: "Today",
    featured: true,
    is_production: false,
    description: "Seeking UGC creators to produce authentic tech product review content for social media campaigns.",
    tags: ["UGC", "Content Creator", "Tech", "Remote"],
    roles: []
  },
]

const filterOptions = {
  location: ['Any Location', 'New York, NY', 'Los Angeles, CA', 'Atlanta, GA', 'Chicago, IL', 'Remote', 'Worldwide'],
  jobType: ['All Jobs', 'Feature Film', 'TV Series', 'Commercial', 'Theater', 'Voiceover', 'UGC', 'Short Film'],
  gender: ['Any Gender', 'Male', 'Female', 'Non-Binary'],
  age: ['Any Age', '18-25', '25-35', '30-45', '45-55', '55+'],
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative min-w-[140px] flex-1 sm:flex-none">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between border border-gray-300 bg-white px-3 py-2.5 text-sm font-bold text-black hover:border-gray-400 sm:px-4"
      >
        <span className="truncate">{value || label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-black/60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[180px] border border-gray-300 bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt === options[0] ? '' : opt); setOpen(false); }}
                className={`block w-full px-4 py-2 text-left text-sm font-bold hover:bg-gray-50 ${value === opt ? 'text-[#4f46e5]' : 'text-black'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function FindJobsPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ location: '', jobType: '', gender: '', age: '' })
  const [view, setView] = useState('roles') // 'productions' or 'roles'
  const [sortBy, setSortBy] = useState('Most Popular')
  const [page, setPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showClientModal, setShowClientModal] = useState(null)
  const perPage = 12

  // Fetch jobs from Supabase database on mount, fall back to dummy data
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const fetchJobs = async () => {
      try {
        // For now, use dummy data until job_roles table is properly set up
        // The SQL migration needs to be run first
        console.log('Using dummy data - run SQL migration to enable real data')
        if (!cancelled) {
          setAllJobs(dummyJobs)
          setLoading(false)
        }
        return

        // This code will work after running the SQL migration:
        /*
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(company_name, logo_url),
            roles:job_roles(*)
          `)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        if (cancelled || !jobs) {
          if (!cancelled) setAllJobs(dummyJobs)
          return
        }

        const mapped = jobs.map((j) => ({
          id: j.id,
          title: j.title || 'Untitled Job',
          company: j.client?.company_name || 'Production Company',
          compensation: j.compensation_display || 'Pay not specified',
          location: j.location || 'Worldwide',
          posted: getTimeAgo(j.created_at),
          featured: j.featured || false,
          is_production: j.is_production || false,
          gender: j.gender_requirement || '',
          age: j.age_min && j.age_max ? `${j.age_min}-${j.age_max}` : '',
          description: j.description || '',
          tags: j.tags || [],
          roles: j.roles?.map(r => ({
            id: r.id,
            title: r.title,
            compensation: r.compensation_display || 'Pay not specified',
            gender: r.gender_requirement || 'Any',
            age: r.age_min && r.age_max ? `${r.age_min}-${r.age_max}` : '',
            ethnicity: r.ethnicity_requirement || 'Any',
            union: r.union_requirement || 'Any',
            description: r.description || '',
            application_count: r.application_count || 0,
          })) || [],
          application_count: j.application_count || 0,
          client_logo_url: j.client?.logo_url || null,
        }))

        if (!cancelled) setAllJobs(mapped)
        */
      } catch (err) {
        console.error('Error fetching jobs:', err)
        if (!cancelled) setAllJobs(dummyJobs)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchJobs()
    return () => { cancelled = true; }
  }, [])

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    if (!date) return 'Recently'
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const filtered = useMemo(() => {
    return allJobs.filter((j) => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !(j.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
      if (filters.location && j.location !== filters.location) return false
      if (filters.jobType && !(j.tags || []).some(t => t.toLowerCase().includes(filters.jobType.toLowerCase()))) return false
      if (filters.gender && j.gender !== filters.gender && j.gender !== '') return false
      return true
    })
  }, [search, filters, allJobs])

  // Filter by view type
  const viewFiltered = useMemo(() => {
    if (view === 'productions') {
      return filtered.filter(j => j.is_production)
    } else {
      return filtered.filter(j => !j.is_production)
    }
  }, [filtered, view])

  const totalPages = Math.max(1, Math.ceil(viewFiltered.length / perPage))
  const pageJobs = viewFiltered.slice((page - 1) * perPage, page * perPage)

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleShare = (job) => {
    const url = window.location.origin + '/FindJobs'
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description?.slice(0, 100) || '', url })
    } else {
      navigator.clipboard?.writeText(url)
    }
  }

  const handleSaveSearch = () => {
    const searchState = JSON.stringify({ search, filters, view })
    localStorage.setItem('savedJobSearch', searchState)
  }

  const handleClientClick = (job) => {
    setShowClientModal(job)
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Marquee />
      <Navbar />

      {/* Filter bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-3 lg:px-8">
          {/* Mobile: search + filter toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex flex-1 items-center gap-2 border border-gray-300 bg-white px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-black/60" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search jobs..."
                className="w-full bg-transparent text-sm font-bold focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex shrink-0 items-center justify-center border border-gray-300 bg-white px-3 py-2.5"
            >
              <SlidersHorizontal className="h-4 w-4 text-black/60" />
            </button>
          </div>

          {/* Desktop: all filters inline */}
          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            <FilterDropdown label="Job location" options={filterOptions.location} value={filters.location} onChange={(v) => { setFilters({ ...filters, location: v }); setPage(1); }} />
            <FilterDropdown label="Job Type" options={filterOptions.jobType} value={filters.jobType} onChange={(v) => { setFilters({ ...filters, jobType: v }); setPage(1); }} />
            <FilterDropdown label="Gender" options={filterOptions.gender} value={filters.gender} onChange={(v) => { setFilters({ ...filters, gender: v }) }} />
            <FilterDropdown label="Age" options={filterOptions.age} value={filters.age} onChange={(v) => { setFilters({ ...filters, age: v }) }} />
            <div className="flex-1" />
            <button onClick={() => setPage(1)} className="flex items-center gap-2 bg-[#4f46e5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#4338CA]">
              <Search className="h-4 w-4" /> Search
            </button>
            <button onClick={handleSaveSearch} className="flex items-center gap-2 border border-[#00D09C] bg-white px-4 py-2.5 text-sm font-bold text-[#00a37e] hover:bg-[#00D09C]/10">
              <Heart className="h-4 w-4" /> Save Search
            </button>
          </div>

          {/* Mobile: expandable filters */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
              <FilterDropdown label="Job location" options={filterOptions.location} value={filters.location} onChange={(v) => { setFilters({ ...filters, location: v }); setPage(1); }} />
              <FilterDropdown label="Job Type" options={filterOptions.jobType} value={filters.jobType} onChange={(v) => { setFilters({ ...filters, jobType: v }); setPage(1); }} />
              <FilterDropdown label="Gender" options={filterOptions.gender} value={filters.gender} onChange={(v) => { setFilters({ ...filters, gender: v }) }} />
              <FilterDropdown label="Age" options={filterOptions.age} value={filters.age} onChange={(v) => { setFilters({ ...filters, age: v }) }} />
              <button onClick={handleSaveSearch} className="flex items-center gap-2 border border-[#00D09C] bg-white px-4 py-2.5 text-sm font-bold text-[#00a37e]">
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
            Showing {filtered.length} jobs with {allJobs.filter(j => j.is_production).length} productions near <span className="underline">{filters.location || 'All Locations'}</span>
          </h1>
          <div className="flex items-center gap-3">
            {/* Productions/Roles toggle */}
            <div className="inline-flex items-center border border-gray-300 bg-white">
              <button
                onClick={() => setView('productions')}
                className={`px-4 py-1.5 text-xs font-bold transition-colors sm:px-5 sm:text-sm ${view === 'productions' ? 'bg-[#4f46e5] text-white' : 'text-black hover:bg-gray-50'}`}
              >
                Productions
              </button>
              <button
                onClick={() => setView('roles')}
                className={`px-4 py-1.5 text-xs font-bold transition-colors sm:px-5 sm:text-sm ${view === 'roles' ? 'bg-[#4f46e5] text-white' : 'text-black hover:bg-gray-50'}`}
              >
                Roles
              </button>
            </div>
            {/* Sort By dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-black sm:text-sm">
                Sort by: {sortBy}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop search input */}
        <div className="mt-4 hidden items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 lg:flex">
          <Search className="h-4 w-4 text-black/60" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs by title or keyword..."
            className="w-full bg-transparent text-sm font-bold focus:outline-none"
          />
        </div>

        {/* Job cards */}
        <div className="mt-5 space-y-4">
          {pageJobs.map((job) => (
            <div key={job.id} className="border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-5 lg:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                {/* Left: main content */}
                <div className="min-w-0 flex-1">
                  {/* Top row: badge + company + icons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {job.featured && (
                        <span className="flex items-center gap-1 bg-[#e11d48] px-3 py-1 text-xs font-bold text-white">
                          Featured
                        </span>
                      )}
                      {/* Company name - clickable to show client profile */}
                      <button
                        onClick={() => handleClientClick(job)}
                        className="text-sm font-bold text-black hover:text-[#4f46e5] hover:underline"
                      >
                        {job.company}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleShare(job)} className="p-1.5 hover:bg-gray-100" aria-label="Share job">
                        <Share2 className="h-4 w-4 text-black/40" />
                      </button>
                      <button onClick={() => toggleSave(job.id)} className="p-1.5 hover:bg-gray-100" aria-label="Save job">
                        <Heart className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-[#e11d48] text-[#e11d48]' : 'text-black/40'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="mt-3 text-lg font-bold text-black md:text-xl">{job.title}</h2>

                  {/* Meta */}
                  <p className="mt-1.5 text-sm font-bold text-black/70">
                    {job.compensation} • {job.location} • Posted: {job.posted}
                  </p>

                  {/* Gender/Age requirements */}
                  {(job.gender || job.age) && (
                    <div className="mt-2 flex gap-2">
                      {job.gender && (
                        <span className="px-3 py-1 text-xs font-bold text-black">{job.gender}</span>
                      )}
                      {job.age && (
                        <span className="px-3 py-1 text-xs font-bold text-black">{job.age}</span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-black/70">
                    {job.description.slice(0, 180)}{job.description.length > 180 ? '... ' : ' '}
                    <button onClick={() => setSelectedJob(job)} className="font-bold text-[#4f46e5] hover:underline">view more</button>
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span key={t} className="px-3 py-1 text-xs font-bold text-black/60">{t}</span>
                    ))}
                  </div>

                  {/* CTA - different for productions vs single roles */}
                  {job.is_production ? (
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="mt-4 bg-[#4f46e5] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#4338CA]"
                    >
                      View All {job.roles.length} Roles
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="mt-4 bg-[#4f46e5] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#4338CA]"
                    >
                      View Details & Apply
                    </button>
                  )}
                </div>

                {/* Right sidebar: roles — for productions, show first 2 roles */}
                {job.is_production && job.roles.length > 0 && (
                  <div className="hidden w-56 shrink-0 space-y-3 border-l border-gray-100 pl-5 md:block">
                    {job.roles.slice(0, 2).map((r, i) => (
                      <div key={i} className="border border-gray-200 p-3">
                        <p className="text-sm font-bold text-black">{r.title}</p>
                        <p className="mt-0.5 text-xs font-bold text-black/50">{r.compensation}</p>
                        <div className="mt-2 flex gap-1">
                          {r.gender && <span className="text-[10px] font-bold text-black/40">{r.gender}</span>}
                          {r.age && <span className="text-[10px] font-bold text-black/40">{r.age}</span>}
                        </div>
                        <button className="mt-2 w-full bg-[#4f46e5] py-1.5 text-xs font-bold text-white hover:bg-[#4338CA]">
                          Apply
                        </button>
                      </div>
                    ))}
                    {job.roles.length > 2 && (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="w-full text-center text-xs font-bold text-[#4f46e5] hover:underline"
                      >
                        View all {job.roles.length} roles
                      </button>
                    )}
                  </div>
                )}
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">Discover more of SmartGigs Kenya</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Acting Jobs', 'Voiceover Jobs', 'Theater Auditions', 'Commercial Casting', 'UGC Gigs', 'Background Extra', 'Remote Jobs', 'Short Film Casting', 'Drama Casting', 'Reality TV'].map((tag) => (
              <button key={tag} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* Detail slide-out */}
      {selectedJob && (
        <GigDetailSlideOut
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            // Handle apply logic
          }}
        />
      )}

      {/* Client profile modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">Company Profile</h2>
              <button onClick={() => setShowClientModal(null)} className="rounded-full p-2 hover:bg-gray-100">
                <span className="sr-only">Close</span>
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{showClientModal.company}</h3>
                  <p className="text-sm text-black/50">Production Company</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-black/70 mb-2">Contact Information</p>
                <p className="text-sm font-medium text-black">View full profile to see contact details and past productions.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClientModal(null)}
                  className="flex-1 rounded-full bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => setShowClientModal(null)}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

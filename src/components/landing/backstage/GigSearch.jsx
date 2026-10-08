import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const popular = [
  'Netflix',
  'Movie Auditions',
  'Voiceover',
  'New York City, NY',
  'Disney',
  'Reality TV',
  'Remote',
  'TV Series',
  'Background Extra',
  'Browse All Jobs',
]

export default function JobSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/Jobs?q=${encodeURIComponent(query.trim())}`)
    } else {
      navigate('/Jobs')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePopularClick = (tag) => {
    if (tag === 'Browse All Jobs') {
      navigate('/Jobs')
    } else {
      navigate(`/Jobs?q=${encodeURIComponent(tag)}`)
    }
  }

  return (
    <section className="bg-[#F5F3EF] py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-4 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-base font-medium text-black/70">
            Endless opportunities, unlimited submissions
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-black md:text-5xl">
            Explore <span className="text-[#4F46E5]">thousands</span> of open jobs
          </h2>
        </motion.div>

        {/* Search bar — dark navy container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-8 flex max-w-3xl items-center gap-3 rounded-full bg-[#0a0b2e] p-2.5"
        >
          <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-[#4F46E5]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for jobs (e.g. 'Paid acting jobs in LA')"
              className="w-full bg-transparent text-sm text-black placeholder:text-black/40 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 rounded-full bg-[#5b56f7] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </motion.div>

        {/* Popular searches */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-2.5">
            {popular.map((tag) => (
              <button
                key={tag}
                onClick={() => handlePopularClick(tag)}
                className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black/40 hover:bg-black/[0.02]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

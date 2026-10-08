import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { ArrowRight, MapPin, Briefcase } from 'lucide-react'

const jobs = [
  {
    title: 'Cinematographer',
    company: 'Northbound Studios',
    location: 'London, UK',
    type: 'Full-time',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  },
  {
    title: 'Video Editor',
    company: 'Frame by Frame',
    location: 'Berlin, DE',
    type: 'Contract',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  },
  {
    title: 'VFX Artist',
    company: 'Darkroom VFX',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
  {
    title: 'Sound Designer',
    company: 'Echo Post',
    location: 'Remote',
    type: 'Freelance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    title: 'Production Designer',
    company: 'Meridian Films',
    location: 'Paris, FR',
    type: 'Contract',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    title: 'Color Grader',
    company: 'Lightwave Post',
    location: 'New York, NY',
    type: 'Full-time',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582084d557?w=100&h=100&fit=crop',
  },
]

export default function FeaturedJobs() {
  return (
    <section className="bg-[#0A0A0A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Open Roles
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Curated job openings from productions hiring right now.
            </p>
          </div>
          <Link
            to={createPageUrl('JobBoard')}
            className="flex items-center gap-2 text-sm font-semibold text-[#C9A962] hover:text-[#D4B575]"
          >
            Browse all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group cursor-pointer rounded-xl border border-white/10 bg-[#141414] p-6 transition-all hover:border-[#C9A962]/30 hover:bg-[#1A1A1A]"
            >
              <div className="flex items-start gap-4">
                <img
                  src={job.avatar}
                  alt={job.company}
                  className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[#C9A962]">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500">{job.company}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

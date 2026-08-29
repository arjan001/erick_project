import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import RoleToggle from './RoleToggle';

const stats = [
  { value: '65+', label: 'YEARS OF INDUSTRY TRUST' },
  { value: '1k+', label: 'TALENT AGENTS SCOUTING' },
  { value: '14k+', label: 'ROLES ADDED MONTHLY' },
  { value: '280k+', label: 'PROS SEARCHING FOR TALENT' },
];

const rotatingRoles = [
  'theater',
  'TV shows',
  'voiceover',
  'commercials',
  'feature films',
  'UGC gigs',
];

export default function Hero() {
  const [role, setRole] = useState('talent');
  const [roleIdx, setRoleIdx] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.08]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIdx((i) => (i + 1) % rotatingRoles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F5F3EF] pt-8 pb-14 md:pt-10 md:pb-16">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        {/* Toggle */}
        <div className="flex justify-center">
          <RoleToggle active={role} onChange={setRole} />
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* Left: copy + stats */}
          <div>
            <h1 className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-black md:text-5xl">
              <span className="block">The place to</span>
              <span className="block">get hired for{' '}
                <span className="relative inline-block">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={roleIdx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4 }}
                      className="text-[#4F46E5]"
                    >
                      {rotatingRoles[roleIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            </h1>

            {/* Stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                >
                  <div className="text-2xl font-bold text-black md:text-3xl">{s.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-black/50">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <button className="rounded-full bg-[#4F46E5] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/20 transition-transform hover:scale-[1.02]">
                Join Now
              </button>
            </div>

            {/* Hiring card — exact layout: bold heading on own line, subtext below, button right */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 flex max-w-md items-center justify-between gap-6 rounded-2xl border border-[#E0E0E0] bg-white p-5"
            >
              <div className="flex-1">
                <p className="text-base font-bold leading-snug text-black">
                  Hiring talent / creators?
                </p>
                <p className="mt-1 text-sm font-normal leading-snug text-black">
                  Post a job and find the perfect talent for your project.
                </p>
              </div>
              <button className="shrink-0 rounded-full bg-[#a7f3d0] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#85F1B5]">
                Post a Job
              </button>
            </motion.div>
          </div>

          {/* Right: hero image with parallax */}
          <motion.div style={{ y }} className="relative">
            <motion.div
              style={{ scale }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1000&fit=crop"
                alt="Production set"
                className="h-full w-full object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              {/* Decorative gradient blobs */}
              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#4F46E5]/20 blur-3xl" />
              <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-[#B2F5EA]/20 blur-3xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

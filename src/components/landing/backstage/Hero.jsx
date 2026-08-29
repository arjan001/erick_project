import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import RoleToggle from './RoleToggle';

const stats = [
  { value: '65+', label: 'YEARS OF INDUSTRY TRUST' },
  { value: '1k+', label: 'TALENT AGENTS SCOUTING' },
  { value: '14k+', label: 'ROLES ADDED MONTHLY' },
  { value: '280k+', label: 'PROS SEARCHING FOR TALENT' },
];

export default function Hero() {
  const [role, setRole] = useState('talent');
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  return (
    <section className="relative overflow-hidden bg-[#F5F3EF] pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        {/* Toggle */}
        <div className="flex justify-center">
          <RoleToggle active={role} onChange={setRole} />
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: copy + stats */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl"
            >
              The place to get hired for{' '}
              <span className="text-[#4F46E5]">theater</span>
            </motion.h1>

            {/* Stats grid */}
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <div className="text-3xl font-bold text-black md:text-4xl">{s.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-black/50">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-[#4F46E5] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/20 transition-transform hover:scale-[1.02]">
                Join Now
              </button>
            </div>

            {/* Hiring card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 max-w-md rounded-2xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-black">
                Hiring talent / creators? Post a job and find the perfect talent for your project.
              </p>
              <button className="mt-4 rounded-full bg-[#34D399] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2bbf88]">
                Post a Job
              </button>
            </motion.div>
          </div>

          {/* Right: hero media with parallax */}
          <motion.div
            style={{ y, opacity }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] shadow-2xl"
            >
              {/* Placeholder media */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-white/70">Hero video placeholder</p>
                </div>
              </div>
              {/* Decorative gradient */}
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#4F46E5]/30 blur-3xl" />
              <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#B2F5EA]/20 blur-3xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

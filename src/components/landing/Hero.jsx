import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { ArrowRight, Clapperboard } from 'lucide-react'

export default function Hero() {
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 800], [0, 200])
  const yContent = useTransform(scrollY, [0, 600], [0, 120])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 600], [1, 1.15])

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-[#0A0A0A]">
      {/* Parallax background image */}
      <motion.div
        style={{ y: yBg, scale }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80"
          alt="Film set"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/50" />
      </motion.div>

      {/* Film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <motion.div
        style={{ y: yContent, opacity }}
        className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-[#C9A962]/30 bg-[#C9A962]/10 px-4 py-1.5"
        >
          <Clapperboard className="h-4 w-4 text-[#C9A962]" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#C9A962]">
            The Film Industry's Curated Network
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          Where Film Talent
          <br />
          Meets <span className="text-[#C9A962]">Opportunity</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 max-w-xl text-lg font-light leading-relaxed text-gray-400 md:text-xl"
        >
          Eric Rabar connects directors, cinematographers, editors, and production
          teams with the people who need them. Curated. Verified. Ready to work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            to="/SignUp?role=client"
            className="group flex items-center gap-2 rounded-lg bg-[#C9A962] px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#D4B575]"
          >
            Post a Gig
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/SignUp?role=artist"
            className="flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Join as Talent
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-white/20 pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-1 rounded-full bg-white/40"
          />
        </div>
      </motion.div>
    </section>
  )
}

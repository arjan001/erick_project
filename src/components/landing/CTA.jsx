import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#0F0F0F] py-24 md:py-32">
      {/* Subtle film set background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80"
          alt=""
          className="h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-[#0F0F0F]/70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Ready to make
          <br />
          something great?
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-gray-400">
          Join Eric Rabar today. Post a project, build your portfolio, or find your
          next crew.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to={createPageUrl('SignUp')}
            className="group flex items-center gap-2 rounded-lg bg-[#C9A962] px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#D4B575]"
          >
            Post a Project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to={createPageUrl('SignUp')}
            className="rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Join as a Creator
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

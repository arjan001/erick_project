import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RoleToggle from './RoleToggle';

export default function CTASection() {
  const [role, setRole] = useState('talent');

  return (
    <section className="bg-[#F5F3EF] pb-20">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl bg-[#5353FF] px-6 py-16 text-center md:px-12"
        >
          <div className="flex justify-center">
            <RoleToggle active={role} onChange={setRole} dark />
          </div>

          <h2 className="mt-8 font-serif text-3xl font-bold text-white md:text-5xl">
            Join SmartGigs Kenya today and kickstart your film career!
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80">
            No matter what type of work you do, SmartGigs Kenya has the most gigs, the best tools,
            and expert advice to help you get hired.
          </p>

          <button className="mt-8 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white hover:bg-black/80">
            Join Now
          </button>

          {/* Secondary options */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                For Finding Talent
              </p>
              <p className="mt-2 text-sm text-white/90">
                Looking for talent for your project?
              </p>
              <button className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
                Post a Gig
              </button>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                For Representing Talent
              </p>
              <p className="mt-2 text-sm text-white/90">
                Managing or representing talent?
              </p>
              <button className="mt-4 rounded-full border border-white px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                Sign Up
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

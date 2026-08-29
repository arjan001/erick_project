import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Upload, Bell, Smartphone } from 'lucide-react';

const features = [
  { icon: UserCircle, text: 'Create multiple profiles to showcase your different specialties.' },
  { icon: Upload, text: 'Upload unlimited media—photos, videos, and audio.' },
  { icon: Bell, text: 'Never miss a job with custom job searches with instant alerts.' },
  { icon: Smartphone, text: 'Apply anywhere with the top-rated Backstage iOS app.' },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F5F3EF] pb-20 md:pb-28">
      <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl bg-white shadow-sm"
        >
          <div className="grid md:grid-cols-2">
            {/* Left: media placeholder */}
            <div className="relative min-h-[340px] bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm text-white/60">Video placeholder</p>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#4F46E5]/30 blur-3xl" />
            </div>

            {/* Right: content */}
            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-bold text-black">Get discovered, get booked!</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
                Every day, actors, models, voice artists, and creators get booked on Backstage.
                It's more than gigs—it's your path to a thriving career. Find jobs, get expert
                guidance, and access the tools you need to succeed!
              </p>

              <div className="mt-6 space-y-4">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#4F46E5]" />
                      <p className="text-sm text-[#4B5563]">{f.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              <button className="mt-8 rounded-full bg-[#4F46E5] px-7 py-3 text-sm font-semibold text-white hover:bg-[#4338CA]">
                Join Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

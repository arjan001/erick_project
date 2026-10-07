import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, Compass, Users } from 'lucide-react';

const features = [
  { icon: Search, title: 'Find Gigs', text: 'Search for short-term or long-term opportunities tailored to your expertise and preferences.' },
  { icon: Sparkles, title: 'Showcase', text: 'Your skills, experience, and availability to attract producers and casting directors.' },
  { icon: Compass, title: 'Explore', text: 'Explore a range of gigs to find the perfect match for your project.' },
  { icon: Users, title: 'Connect', text: 'With professionals. Network with industry insiders, collaborate on projects and build lasting relationships.' },
];

export default function KeyFeatures() {
  return (
    <section className="bg-[#F5F3EF] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#4F46E5]">Key Features</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-black md:text-5xl">
            Everything you need to land your next gig
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:pb-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4F46E5]/10">
                  <Icon className="h-5 w-5 text-[#4F46E5]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-black">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{f.text}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center lg:mt-0">
          <p className="text-base font-semibold text-black md:text-lg">
            Join SmartGigs Kenya and take your career to new heights!
          </p>
          <Link
            to="/SignUp"
            className="mt-4 inline-block rounded-full bg-[#4F46E5] px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Music2, Podcast, Globe, Apple, Cookie } from 'lucide-react';
import RoleToggle from './RoleToggle';

const columns = [
  {
    title: 'For Finding Jobs',
    links: ['Actors & Performers', 'Voiceover Artists', 'Creatives & Production Crew', 'Influencers + Content Creators', 'Models', 'Search Casting Calls', 'Popular Auditions', 'How it Works', 'Advice & Guides', 'Create Your Free Talent Profile'],
  },
  {
    title: 'For Finding Talent',
    links: ['Film, Video & TV Production', 'Theater & Performing Arts', 'Voiceover Production', 'Commercial + Branded Content', 'Models', 'UGC Creators and Influencers', 'Talent Database', 'Pay Talent', 'How it Works', 'Post a Job'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Partners', 'Sitemap', 'Articles Archive', 'Group and School Subscriptions'],
  },
  {
    title: 'Support',
    links: ['Help', 'Contact', 'Pricing', 'Advertising', 'Report Content'],
  },
];

const socials = [
  { icon: Facebook, name: 'Facebook' },
  { icon: Twitter, name: 'X' },
  { icon: Instagram, name: 'Instagram' },
  { icon: Music2, name: 'TikTok' },
  { icon: Youtube, name: 'YouTube' },
  { icon: Podcast, name: 'Podcast' },
];

export default function Footer() {
  const [role, setRole] = useState('talent');

  return (
    <footer className="bg-black px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1400px]">
        {/* Top toggle */}
        <div className="flex justify-center pb-8 md:pb-10">
          <RoleToggle active={role} onChange={setRole} dark />
        </div>

        {/* Columns — 2 per row on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2 md:mt-4 md:space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-xs text-white/60 hover:text-white md:text-sm">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Connect</h4>
            <div className="mt-3 flex flex-wrap gap-2 md:mt-4 md:gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href="#"
                    aria-label={s.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:h-9 md:w-9"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom section: language, newsletter, app, cookies — 2 per row on mobile */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4 md:gap-8">
          {/* Language */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Choose Language</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2">
              <Globe className="h-4 w-4 shrink-0 text-white/60" />
              <select className="w-full bg-transparent text-xs text-white focus:outline-none md:text-sm">
                <option className="text-black">English</option>
                <option className="text-black">Español</option>
                <option className="text-black">Français</option>
                <option className="text-black">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Newsletter</p>
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full rounded-lg border border-white/20 bg-transparent px-2 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none md:text-sm"
              />
              <button className="shrink-0 rounded-lg bg-[#5850EC] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4F46E5] md:px-4 md:text-sm">
                Submit
              </button>
            </div>
          </div>

          {/* iOS App */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">iOS App</p>
            <button className="mt-3 flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-white hover:bg-white/10">
              <Apple className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <p className="text-[9px] text-white/60">Download on the</p>
                <p className="text-xs font-semibold leading-none md:text-sm">App Store</p>
              </div>
            </button>
          </div>

          {/* Cookie preferences */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Cookie Preferences</p>
            <button className="mt-3 flex items-center gap-2 rounded-lg border border-[#34D399] px-3 py-2 text-xs font-medium text-white hover:bg-[#34D399]/10 md:text-sm">
              <Cookie className="h-4 w-4 shrink-0" />
              Cookie Preferences
            </button>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">© 2026 Eric Rabar. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <a href="#" className="text-xs text-white/40 hover:text-white">Terms of Service</a>
            <a href="#" className="text-xs text-white/40 hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

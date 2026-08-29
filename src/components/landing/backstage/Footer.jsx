import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Music2, Podcast } from 'lucide-react';

const columns = [
  {
    title: 'For Finding Jobs',
    links: ['Actors & Performers', 'Voiceover Artists', 'Creatives & Production Crew', 'Influencers + Content Creators', 'Models', 'Search Casting Calls'],
  },
  {
    title: 'For Finding Talent',
    links: ['Film, Video & TV Production', 'Theater & Performing Arts', 'Voiceover Production', 'Commercial & Branded Content', 'Models', 'UGC Creators and Influencers'],
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
  return (
    <footer className="bg-black py-16">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/60 hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Connect</h4>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href="#"
                    aria-label={s.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Backstage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

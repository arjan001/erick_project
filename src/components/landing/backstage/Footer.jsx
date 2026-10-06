import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Music2, Podcast, Globe, Check } from 'lucide-react';

const columns = [
  {
    title: 'For Finding Jobs',
    links: [
      { label: 'Actors & Performers', to: '/talent' },
      { label: 'Voiceover Artists', to: '/talent' },
      { label: 'Creatives & Production Crew', to: '/talent' },
      { label: 'Content Creators', to: '/talent' },
      { label: 'Search Casting Calls', to: '/FindJobs' },
      { label: 'How it Works', to: '/About' },
      { label: 'Create Your Free Talent Profile', to: '/SignUp' },
    ],
  },
  {
    title: 'For Finding Talent',
    links: [
      { label: 'Film, Video & TV Production', to: '/SubmitProject' },
      { label: 'Theater & Performing Arts', to: '/SubmitProject' },
      { label: 'Voiceover Production', to: '/SubmitProject' },
      { label: 'Talent Database', to: '/talent' },
      { label: 'How it Works', to: '/About' },
      { label: 'Post a Job', to: '/SubmitProject' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/About' },
      { label: 'Careers', to: '/Careers' },
      { label: 'Partners', to: '#' },
      { label: 'Privacy Policy', to: '/legal/privacy' },
      { label: 'Terms of Service', to: '/legal/terms' },
      { label: 'Cookie Policy', to: '/legal/cookies' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', to: '/FAQ' },
      { label: 'Contact', to: '/Contact' },
      { label: 'Pricing', to: '/Pricing' },
    ],
  },
];

const howItWorks = [
  ['Create Profile', 'Build your profile to highlight your talents.'],
  ['Search Gigs', 'Browse available gigs based on your interests.'],
  ['Apply/Contact', 'Connect with producers and casting directors.'],
  ['Get Hired', 'Land your next gig and start filming!'],
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
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return;
    const sub = {
      id: Date.now().toString(),
      email,
      source: 'footer',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    // Store in localStorage as fallback
    const raw = localStorage.getItem('smartgigs_mailing_list');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(sub);
    localStorage.setItem('smartgigs_mailing_list', JSON.stringify(list));
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-white px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1400px]">
        {/* Footer blocks: How It Works · Our Mission · The Process */}
        <div className="grid gap-8 border-b border-black/10 pb-10 md:grid-cols-3 md:gap-10 md:pb-12">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">How It Works</h4>
            <ol className="mt-4 space-y-3 text-sm font-bold text-black">
              {howItWorks.map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold text-black">{i + 1}</span>
                  <span><strong className="text-black">{title}:</strong> {text}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">Our Mission</h4>
            <p className="mt-4 text-sm font-bold leading-relaxed text-black">
              To build a vibrant community of filmmakers in Kenya while empowering talent, directors
              and producers by providing a platform for them to showcase their skills and find
              opportunities.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">The Process</h4>
            <p className="mt-4 text-sm font-bold text-black">Create Profile → Search Gigs → Apply → Get Hired</p>
            <p className="mt-4 text-sm font-bold text-black">
              Join SmartGigs Kenya today and kickstart your film career!
            </p>
            <Link to="/SignUp" className="mt-4 inline-block rounded-full bg-[#5850EC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4F46E5]">
              Get started
            </Link>
          </div>
        </div>

        {/* Columns */}
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2 md:mt-4 md:space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-xs font-bold text-black/70 hover:text-black md:text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">Connect</h4>
            <div className="mt-3 flex flex-wrap gap-2 md:mt-4 md:gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href="#"
                    aria-label={s.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-black hover:bg-black/20 md:h-9 md:w-9"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom section: language + newsletter */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-black/10 pt-8 sm:grid-cols-2 md:gap-8">
          {/* Language */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-black/60">Choose Language</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-2">
              <Globe className="h-4 w-4 shrink-0 text-black/60" />
              <select className="w-full bg-transparent text-xs font-medium text-black focus:outline-none md:text-sm">
                <option>English</option>
                <option>Swahili</option>
                <option>Français</option>
                <option>Deutsch</option>
              </select>
            </div>
          </div>

          {/* Newsletter / Mailing List */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-black/60">Newsletter</p>
            {subscribed ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                <Check className="h-4 w-4" /> You're subscribed!
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder="Enter email"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-medium text-black placeholder:text-black/40 focus:outline-none md:text-sm"
                />
                <button onClick={handleSubscribe} className="shrink-0 rounded-lg bg-[#5850EC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4F46E5] md:px-5 md:text-sm">
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-6 sm:flex-row">
          <p className="text-xs font-bold text-black">© 2026 SmartGigs Kenya. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <Link to="/legal/terms" className="text-xs font-bold text-black hover:text-black/70">Terms of Service</Link>
            <Link to="/legal/privacy" className="text-xs font-bold text-black hover:text-black/70">Privacy Policy</Link>
            <Link to="/legal/cookies" className="text-xs font-bold text-black hover:text-black/70">Cookie Policy</Link>
            <Link to="/FAQ" className="text-xs font-bold text-black hover:text-black/70">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

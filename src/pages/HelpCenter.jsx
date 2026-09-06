import React, { useState } from 'react';
import { Search, Building2, HelpCircle, Briefcase, Smartphone, MessageCircle } from 'lucide-react';
import SEOMetaTags from '@/components/SEOMetaTags';

const cards = [
  {
    icon: Building2,
    title: 'The Eric Rabar Platforms',
    desc: 'Everything you need to know about the company, the service, and the platforms.',
    count: '58 articles',
  },
  {
    icon: HelpCircle,
    title: 'Advice and Additional Resources',
    desc: 'How do you get a Visa? What are some profile best practices? Do you guys know of a list of monologues...',
    count: '19 articles',
  },
  {
    icon: Briefcase,
    title: 'For Casting Directors + Employers',
    desc: 'Looking for talent? Want to post an opportunity with us? Check out this section for everything you need...',
    count: '35 articles',
  },
  {
    icon: Smartphone,
    title: 'The Eric Rabar iOS apps',
    desc: 'How to use the Eric Rabar iOS app',
    count: '24 articles',
  },
];

export default function HelpCenter() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5b80f7] to-[#e8efff]">
      <SEOMetaTags
        title="Help Center — Eric Rabar"
        description="Search for answers and find help articles."
        keywords="help center, support, eric rabar"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Help Center', description: 'Find answers and support' }}
      />

      {/* Header text */}
      <div className="px-4 pt-6">
        <p className="text-sm font-medium text-white/80">
          Eric Rabar Help Center
        </p>
      </div>

      {/* Hero / Search */}
      <section className="px-4 pt-12 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-2xl font-bold leading-snug text-[#222222] md:text-3xl">
            Search for answers here, or click the message icon at the bottom of the page to
            message us.
          </h1>
          <div className="mt-8 flex items-center rounded-full bg-[#d8e2ff] px-5 py-3 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-[#3a61f5]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for articles..."
              className="ml-3 w-full bg-transparent text-sm text-[#222222] placeholder:text-[#3a61f5]/50 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Content Cards */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl space-y-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#3a61f5]/10">
                  <Icon className="h-6 w-6 text-[#3a61f5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#222222]">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#4a4a4a]">{c.desc}</p>
                  <p className="mt-2 text-xs font-medium text-[#3a61f5]">{c.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer text */}
      <div className="px-4 pb-10 text-center">
        <p className="text-sm font-medium text-[#4a4a4a]">Eric Rabar Help Center</p>
      </div>

      {/* Floating chat widget */}
      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#3a61f5] shadow-lg transition-transform hover:scale-110">
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, ChevronRight, MessageCircle, ThumbsDown, Meh, ThumbsUp } from 'lucide-react';
import SEOMetaTags from '@/components/SEOMetaTags';

const relatedArticles = [
  'Learn About Eric Rabar',
  'Cancellation & Refunds',
  'Tax Reporting Tips for Income Received via the Secure Payments System',
  'Agent Tools FAQ',
  'New to Eric Rabar?',
];

export default function ContactUs() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="Contact Us — Eric Rabar Help Center"
        description="Contact our customer service team for support."
        keywords="contact, support, eric rabar"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Contact Us', description: 'Contact Eric Rabar support' }}
      />

      {/* Header banner */}
      <div className="bg-gradient-to-b from-[#5A75FF] to-[#A0C3FF] px-4 pb-12 pt-6">
        <p className="text-sm font-medium text-white/80">Eric Rabar Help Center</p>
        <div className="mx-auto mt-8 flex max-w-xl items-center rounded-full bg-white/90 px-5 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-[#5A75FF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for articles..."
            className="ml-3 w-full bg-transparent text-sm text-black placeholder:text-[#5A75FF]/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
          <span>All Collections</span>
          <ChevronRight className="h-3 w-3" />
          <span>The Eric Rabar Platforms</span>
          <ChevronRight className="h-3 w-3" />
          <span>The Basics</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-700">Contact Us</span>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-black">Contact Us</h1>
        <p className="mt-2 text-sm text-gray-400">January 8, 2026</p>

        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-black">Customer Service</h2>
          <p className="text-sm leading-relaxed text-gray-700">
            Our customer service reps are eager to help. Most requests are typically answered
            within 1 business day. We also offer some weekend support.
          </p>
          <ul className="space-y-3">
            <li className="text-sm leading-relaxed text-gray-700">
              <span className="font-semibold">Contact Our Support Team:</span> To contact Eric
              Rabar, <span className="font-semibold">click the chat-widget icon on the
              bottom-right of this page.</span> Immediate support is available via AI chat, or
              you can request additional assistance and a customer support agent will get back
              to you via email ASAP.
            </li>
          </ul>
        </div>

        {/* Divider */}
        <hr className="my-10 border-gray-200" />

        {/* Related Articles */}
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Related Articles</h3>
          <ul className="mt-4 space-y-3">
            {relatedArticles.map((a) => (
              <li key={a}>
                <a
                  href="#"
                  className="flex items-center justify-between text-sm text-gray-700 hover:text-[#5A75FF]"
                >
                  {a}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Feedback */}
        <div className="mt-8 rounded-xl bg-[#F2F2F2] p-6 text-center">
          <p className="text-sm font-medium text-gray-700">Did this answer your question?</p>
          <div className="mt-4 flex justify-center gap-6">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors hover:text-gray-700">
              <ThumbsDown className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors hover:text-gray-700">
              <Meh className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors hover:text-gray-700">
              <ThumbsUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="px-4 pb-10 text-center">
        <p className="text-sm font-medium text-gray-400">Eric Rabar Help Center</p>
      </div>

      {/* Floating chat widget */}
      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#5A75FF] shadow-lg transition-transform hover:scale-110">
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}

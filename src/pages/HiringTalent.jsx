import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/backstage/Navbar';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';
import SEOMetaTags from '@/components/SEOMetaTags';
import { Search, FileText, Users, Zap, Shield, TrendingUp, ArrowRight, Check } from 'lucide-react';

const stats = [
  { value: '195,348', label: 'CREATORS LOOKING FOR TALENT' },
  { value: '3,512', label: 'NEW ROLES POSTED THIS WEEK' },
  { value: '259,293', label: 'TALENT PROFILES' },
  { value: '66', label: 'YEARS OF INDUSTRY TRUST' },
];

const features = [
  { icon: Search, title: 'Search the Talent Database', desc: 'Browse thousands of vetted performers, creators, and crew across every category.' },
  { icon: FileText, title: 'Post a Job in Minutes', desc: 'Create a casting call or project listing and start receiving submissions instantly.' },
  { icon: Users, title: 'Manage Submissions', desc: 'Review, shortlist, and message applicants all in one streamlined dashboard.' },
  { icon: Zap, title: 'AI-Powered Matching', desc: 'Our smart matching algorithm surfaces the best talent for your specific needs.' },
  { icon: Shield, title: 'Secure Payments', desc: 'Pay talent safely through our platform with built-in escrow and contracts.' },
  { icon: TrendingUp, title: 'Track & Optimize', desc: 'Analytics on your postings, response rates, and hiring success over time.' },
];

const steps = [
  { num: '1', title: 'Post Your Job', desc: 'Tell us what you need — role, budget, timeline, and location.' },
  { num: '2', title: 'Review Submissions', desc: 'Receive curated applications from qualified talent within hours.' },
  { num: '3', title: 'Hire & Collaborate', desc: 'Message, contract, and pay your chosen talent — all in one place.' },
];

const brands = ['ABC', 'Disney', 'AMC', 'HBO', 'Netflix', 'NBC'];

export default function HiringTalent() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <SEOMetaTags
        title="I'm Hiring Talent — Eric Rabar"
        description="Find and hire the world's best talent for your next project."
        keywords="hire talent, casting, find talent, post a job"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Hire Talent', description: 'Find and hire top talent' }}
      />
      <Navbar />

      {/* Hero */}
      <section className="px-4 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="mx-auto max-w-[1400px]">
          {/* Toggle indicator */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full bg-black/[0.06] p-1">
              <Link to="/" className="rounded-full px-5 py-2 text-sm font-semibold text-black/70 hover:text-black">
                I'm Talent
              </Link>
              <span className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">
                I'm Hiring Talent
              </span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-black md:text-5xl">
              Find the perfect talent<br />for your next project
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-black/60 md:text-lg">
              Post a job and connect with thousands of vetted performers, creators, and crew —
              all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/SubmitProject"
                className="rounded-full bg-[#4F46E5] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/20 transition-transform hover:scale-105"
              >
                Post a Job
              </Link>
              <Link
                to="/FindJobs"
                className="rounded-full border border-black/80 bg-white px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-black/[0.03]"
              >
                Search Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#A8E4C0] md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-4 py-6 text-center">
                <div className="text-2xl font-bold text-black md:text-3xl">{s.value}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-black/60">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-2xl font-bold text-black md:text-3xl">
            Everything you need to hire great talent
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-black/5 bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46E5]/10">
                    <Icon className="h-6 w-6 text-[#4F46E5]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-black">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/60">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-2xl font-bold text-black md:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4F46E5] text-lg font-bold text-white">
                  {s.num}
                </div>
                <h3 className="mt-4 text-lg font-bold text-black">{s.title}</h3>
                <p className="mt-2 text-sm text-black/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted brands */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-black/50">
            Trusted by leading production companies and studios
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {brands.map((b) => (
              <span key={b} className="text-lg font-bold text-gray-400">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-[#4A47E5] px-6 py-14 text-center md:px-12">
            <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
              Ready to find your next great hire?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-white/80">
              Join thousands of creators who trust Eric Rabar to find top talent.
            </p>
            <Link
              to="/SubmitProject"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Post a Job Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}

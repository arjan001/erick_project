import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Clapperboard, Users, ShieldCheck, Bell, MessageSquare, Video } from 'lucide-react';
import Navbar from '@/components/landing/backstage/Navbar';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';
import SEOMetaTags from '@/components/SEOMetaTags';
import { ParallaxBackground } from '@/components/landing/backstage/Parallax';
import { isFeatureEnabled } from '@/lib/featureFlags';

const audiences = [
  'a filmmaker seeking the perfect cast',
  'a location scout in search of the ideal spot for your next shoot',
  'a visionary trying to get into film',
  'a producer looking for the right team',
];

const forTalent = [
  'Sign up and complete a detailed public profile with high-resolution photos, portfolio uploads and embedded video reels.',
  'Receive real-time job alerts and notifications matched by your location and profile tags.',
  'Track every application status in one view and converse with producers through in-site messaging.',
];

const forProducers = [
  'Post gigs, assigning city or region tags so roles surface to the right talent automatically.',
  'Filter incoming submissions by location, skills or custom tags, then drill down with advanced talent search.',
  'Review organised application pipelines and move candidates through stages — the actor dashboard updates automatically.',
];

const shared = [
  { icon: Users, text: 'Responsive design for mobile, tablet and desktop' },
  { icon: ShieldCheck, text: 'Secure sign-in, role-based access and admin content moderation' },
  { icon: Video, text: 'Embeddable YouTube links for video portfolios' },
  { icon: Bell, text: 'Email and in-app notifications that keep both sides informed' },
  { icon: MessageSquare, text: 'Built-in messaging threads between talent and producers' },
  { icon: Clapperboard, text: 'A shop with branded productions and live discount auctions' },
];

const steps = [
  ['Create Profile', 'Build your profile to highlight your talents.'],
  ['Search Gigs', 'Browse available gigs based on your interests.'],
  ['Apply / Contact', 'Connect with producers and casting directors.'],
  ['Get Hired', 'Land your next gig and start filming!'],
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="About Us — SmartGigs Kenya"
        description="SmartGigs Kenya connects actors, crew, location managers, producers and casting directors across Kenya's film industry."
        keywords="about smartgigs kenya, film industry kenya, casting platform, actors and crew"
        ogType="website"
        schemaType="WebPage"
        schemaData={{
          name: 'About SmartGigs Kenya', description: 'Connecting talent with opportunity in Kenya film industry'
        }}
      />
      < Navbar />

      {/* Hero with parallax backdrop */}
      < ParallaxBackground
        src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1800&h=900&fit=crop"
        overlay="bg-gradient-to-b from-black/70 via-black/60 to-black/80"
      >
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a7f3d0]">About us</p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-white md:text-5xl">
            Where Kenyan film talent meets its next opportunity
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80">
            SmartGigs Kenya brings actors and casting professionals together — with a tailored
            dashboard and tool-set for everyone who tells stories on screen.
          </p>
        </div>
      </ParallaxBackground>

      {/* Story */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-gray-700">
          <p>
            At SmartGigs Kenya, we're passionate about connecting talented individuals with
            opportunities in the dynamic world of film.
          </p>
          <p>
            Our mission is to provide a platform where actors, crew members, and location managers
            can showcase their skills, connect with industry professionals, and find their next gig
            with ease.
          </p>
          <p>
            With a user-friendly interface and robust features, SmartGigs Kenya is revolutionizing
            the way talent is discovered and hired in film. Whether you're
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {audiences.map((a) => (
              <li key={a} className="rounded-xl bg-[#F5F3EF] px-4 py-3 text-sm font-medium text-black">
                {a}
              </li>
            ))}
          </ul>
          <p>SmartGigs Kenya has you covered.</p>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="bg-[#F5F3EF] px-4 py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46E5]/10">
              <Target className="h-6 w-6 text-[#4F46E5]" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-black">Our mission</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-700">
              To build a vibrant community of filmmakers in Kenya while empowering talent, directors
              and producers — giving every one of them a platform to showcase their skills, be
              discovered on merit and find opportunities that turn passion into a career.
            </p>
          </div>
          <div className="rounded-3xl bg-[#1a1a23] p-8 text-white shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Eye className="h-6 w-6 text-[#a7f3d0]" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold">Our vision</h2>
            <p className="mt-3 text-base leading-relaxed text-white/80">
              A Kenya where every great story can find its cast and crew in a single click — where a
              young actor in Kisumu, a cinematographer in Mombasa and a producer in Nairobi build
              award-winning productions together, and East African cinema takes its place on the
              world stage.
            </p>
          </div>
        </div>
      </section>

      {/* Two portals */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-bold text-black">Built for both sides of the camera</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600">
            The core build includes two user roles — Actors &amp; Crew and Producers &amp; Casting
            Managers — each with a tailored dashboard and tool-set.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-black/5 p-8">
              <h3 className="text-xl font-bold text-black">Actors &amp; Crew</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#4F46E5]">
                Actors portal open {isFeatureEnabled('CREW_PORTAL_ENABLED') ? '· Crew portal open' : '· Crew portal opening soon'}
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700">
                {forTalent.map((t) => (
                  <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F46E5]" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-black/5 p-8">
              <h3 className="text-xl font-bold text-black">Producers &amp; Casting Managers</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#4F46E5]">Hire with confidence</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700">
                {forProducers.map((t) => (
                  <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F46E5]" />{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shared.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.text} className="flex items-start gap-3 rounded-2xl bg-[#F5F3EF] p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#4F46E5]" />
                  <p className="text-sm font-medium text-black">{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#1a1a23] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-serif text-3xl font-bold text-white">The process</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], i) => (
              <div key={title} className="rounded-2xl bg-white/5 p-6 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a7f3d0] text-sm font-bold text-black">{i + 1}</span>
                <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-white/65">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg font-semibold text-white">
            Join our growing community and let SmartGigs Kenya be your trusted partner in navigating
            the exciting world of film.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/SignUp" className="rounded-full bg-[#a7f3d0] px-8 py-3 text-sm font-bold text-black hover:bg-[#85F1B5]">
              Join SmartGigs Kenya
            </Link>
            <Link to="/Contact" className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div >
  );
}

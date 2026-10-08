import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import SEOMetaTags from '@/components/SEOMetaTags'
import RoleToggle from '@/components/landing/backstage/RoleToggle'
import PartnersCarousel from '@/components/landing/backstage/PartnersCarousel'
import { talentProfiles } from '@/components/landing/backstage/talentData'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, Users, Zap, Shield, TrendingUp, ArrowRight, Check,
  Calendar, MessageSquare, UserPlus, Briefcase, Camera, Smartphone, Star,
} from 'lucide-react'

// ── Stats ──
const heroStats = [
  { value: 'FREE', label: 'TO CREATE A HIRING ACCOUNT', highlight: true },
  { value: '1M+', label: 'TALENT ACROSS THE GLOBE' },
  { value: '1M+', label: 'PROJECTS SUCCESSFULLY COMPLETED' },
  { value: '1K+', label: 'TALENT AGENTS SUBMITTING' },
]

// ── Top info cards ──
const infoCards = [
  { title: 'Find great talent', desc: 'Access the largest, most diverse marketplace for creative professionals.' },
  { title: 'Seamless hiring', desc: 'Flexible tools to post jobs, track submissions, audition and hire talent.' },
  { title: 'Secure payments', desc: 'Find, hire, and pay talent all in one place using our Secure Payments system.' },
]

// ── Feature grid (3x3) ──
const features = [
  { icon: Search, title: 'Talent search filters', desc: 'Narrow down talent with precision' },
  { icon: Users, title: 'Team collaboration', desc: 'Work together to find your perfect match' },
  { icon: Camera, title: 'Virtual auditions', desc: 'Host virtual auditions tailored to your industry' },
  { icon: UserPlus, title: 'Invite talent', desc: 'Invite your favorites to apply' },
  { icon: Briefcase, title: 'Shortlist management', desc: 'Compile and share top candidate selections' },
  { icon: MessageSquare, title: 'Messaging', desc: 'Personally engage through direct messaging' },
  { icon: Smartphone, title: 'Self-tape auditions', desc: 'Vet talent with ease' },
  { icon: Calendar, title: 'Audition schedules', desc: 'Coordinate talent bookings' },
  { icon: FileText, title: 'Talent profiles', desc: 'Explore comprehensive talent profiles' },
]

// ── Filter pills ──
const filterPills = [
  { label: 'Actors', active: true },
  { label: 'Voiceover Artists' },
  { label: 'Production Crew' },
  { label: 'Content Creators' },
  { label: 'Explore All Talent' },
]

// ── Success story checklist ──
const storyChecklist = [
  'Covert Film needed to cast high-quality talent on a limited budget.',
  'They wanted motivated professionals who were a good fit for the project and crew.',
  'Six right-fit actors, including for the lead role, were cast from SmartGigs Kenya.',
  'The indie film starring SmartGigs Kenya talent won multiple festival awards.',
]

export default function HiringTalent() {
  const navigate = useNavigate()
  const [role, setRole] = useState('hiring')
  const carouselRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const [scrollDirection, setScrollDirection] = useState(1)

  // Auto-scroll carousel
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let animationFrame
    let scrollAmount = 0
    const speed = 1; // pixels per frame

    const scroll = () => {
      if (!isPaused) {
        scrollAmount += speed * scrollDirection

        // Check if we've scrolled past the end
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
          scrollAmount = 0
        } else if (scrollAmount < 0) {
          scrollAmount = carousel.scrollWidth - carousel.clientWidth
        }

        carousel.scrollLeft = scrollAmount
      }
      animationFrame = requestAnimationFrame(scroll)
    }

    animationFrame = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isPaused, scrollDirection])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)
  const handleMouseMove = (e) => {
    const rect = carouselRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const center = rect.width / 2

    // Scroll left on left side, right on right side
    if (x < center) {
      setScrollDirection(-1)
    } else {
      setScrollDirection(1)
    }
  }

  // Pause only when hovering the carousel container, not individual cards
  const handleCarouselMouseEnter = () => setIsPaused(true)
  const handleCarouselMouseLeave = () => setIsPaused(false)

  return (
    <div className="min-h-screen bg-[#20202a]">
      <SEOMetaTags
        title="I'm Hiring Talent — SmartGigs Kenya"
        description="Find and hire the world's best talent for your next project."
        keywords="hire talent, casting, find talent, post a job"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Hire Talent', description: 'Find and hire top talent' }}
      />
      <Navbar />

      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden px-4 pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="mx-auto max-w-[1400px]">
          {/* Toggle */}
          <div className="flex justify-center">
            <RoleToggle
              active={role}
              dark
              onChange={(r) => {
                setRole(r)
                if (r === 'talent') navigate('/')
              }}
            />
          </div>

          {/* Heading */}
          <div className="mt-10 text-center md:mt-14">
            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Find your next{' '}
              <span className="relative inline-block">
                crew member
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#0047ab]"></span>
              </span>
            </h1>
          </div>

          {/* Stats grid */}
          <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:max-w-4xl lg:mx-auto">
            {heroStats.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`inline-block rounded-lg px-4 py-2 text-2xl font-bold md:text-4xl ${s.highlight ? 'bg-[#0047ab] text-white' : 'text-white'
                  }`}>
                  {s.value}
                </div>
                <div className="mt-2 text-[10px] font-medium uppercase tracking-wide text-white/60 md:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-center md:mt-12">
            <Link
              to="/SubmitProject"
              className="rounded-xl bg-[#a0f0c0] px-8 py-3.5 text-sm font-bold text-black transition-transform hover:scale-105 md:text-base"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Trusted By Carousel (same partner logos as the landing page, managed in Admin → Partners) ═══ */}
      <section className="overflow-hidden px-0 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-4">
          <p className="text-center text-sm font-medium text-white/80 md:text-base">
            Trusted by producers, casting directors and brands across Kenya
          </p>
        </div>
        <PartnersCarousel tone="dark" fade="#20202a" />
      </section>

      {/* ═══ Industry Pros Heading ═══ */}
      <section className="px-4 py-8 md:py-12">
        <div className="mx-auto max-w-[1400px] text-center">
          <p className="text-sm font-medium text-white/60 md:text-base">
            From small projects to feature films
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-white md:text-4xl lg:text-5xl">
            Why 50k+ industry pros trust SmartGigs Kenya
          </h2>
        </div>
      </section>

      {/* ═══ Top Info Cards ═══ */}
      <section className="px-4 pb-8 md:pb-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {infoCards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-white p-5 shadow-lg md:p-6">
                <h3 className="text-lg font-bold text-black md:text-xl">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600 md:text-base">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Feature Grid (3x3) ═══ */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="text-center text-xl font-bold text-white md:text-3xl">
            Industry-leading hiring tools for your needs
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="rounded-xl bg-white p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#52d8a5]/10 md:h-10 md:w-10">
                      <Icon className="h-4 w-4 text-[#52d8a5] md:h-5 md:w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-black md:text-base">{f.title}</h3>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 md:text-sm">{f.desc}</p>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/SubmitProject"
              className="rounded-xl bg-[#a8f1d3] px-8 py-3.5 text-sm font-bold text-black transition-transform hover:scale-105 md:text-base"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Talent Showcase ═══ */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px]">
          {/* Sub-heading */}
          <p className="text-center text-sm font-medium text-white/60 md:text-base">
            Find the perfect fit for your roles
          </p>
          <h2 className="mt-3 text-center font-serif text-2xl font-bold text-white md:text-4xl lg:text-5xl">
            Access 1M+ dynamic creatives
          </h2>

          {/* Filter pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {filterPills.map((pill) => (
              <button
                key={pill.label}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors md:text-sm ${pill.active
                  ? 'border-transparent bg-[#4ade80] text-black'
                  : 'border-white/20 bg-white text-black hover:bg-white/90'
                  }`}
              >
                <Check className="h-3 w-3" />
                {pill.label}
              </button>
            ))}
          </div>

          {/* Talent carousel with auto-scroll on hover */}
          <div
            ref={carouselRef}
            className="mt-10 flex gap-4 overflow-x-auto pb-4 cursor-pointer"
            onMouseEnter={handleCarouselMouseEnter}
            onMouseLeave={handleCarouselMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {talentProfiles.map((profile) => (
              <div key={profile.id} className="w-[200px] shrink-0">
                <div className="overflow-hidden rounded-xl bg-[#282835]">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={profile.images[0]}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-3 py-3">
                    <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                    <p className="mt-0.5 text-xs text-white/60">{profile.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Discover Talent CTA */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/talent"
              className="rounded-xl bg-[#98ffcc] px-8 py-3.5 text-sm font-bold text-black transition-transform hover:scale-105 md:text-base"
            >
              Discover Talent
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Success Stories ═══ */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-white/60">Success stories</p>
            <h2 className="mt-3 font-serif text-2xl font-bold text-white md:text-4xl lg:text-5xl">
              Real projects. <span className="text-[#95f1d4]">Real results.</span>
            </h2>
          </div>

          {/* Sub-heading */}
          <p className="mt-4 text-center text-base font-bold text-white md:text-lg">
            SmartGigs Kenya Cast Leads Indie Film to Festival Success
          </p>

          {/* Two-column cards */}
          <div className="mt-8 grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Left: Testimonial */}
            <div className="rounded-2xl bg-white p-5 shadow-lg md:p-8">
              <div className="mb-4">
                <span className="text-xs font-bold tracking-widest text-gray-400">COVERT FILM</span>
              </div>
              <blockquote className="text-sm leading-relaxed text-gray-700 md:text-base">
                "We were looking for undiscovered actors who were on the cusp of being great, who have
                learnt techniques, have been to acting school, and were ready to put the work in to
                create something amazing. And we found exactly what we were looking for on SmartGigs Kenya."
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                    alt="Luke Covert"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Luke Covert</p>
                  <p className="text-xs text-gray-500">Film Director / Producer</p>
                </div>
              </div>
            </div>

            {/* Right: Case study */}
            <div className="rounded-2xl bg-white p-5 shadow-lg md:p-8">
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1485846234645-a62644fd8c96?w=600&h=400&fit=crop"
                  alt="On set"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">Photo Source: Covert Film, on set of Turbo Cola</p>
              <h3 className="mt-4 text-sm font-bold text-black md:text-base">
                Covert Film used SmartGigs Kenya to cast the lead and five supporting roles in award-winning
                feature film
              </h3>
              <ul className="mt-4 space-y-2">
                {storyChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 md:text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#95f1d4]">
                      <Check className="h-2.5 w-2.5 text-black" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-xl bg-[#95f1d4] py-3 text-sm font-bold text-black transition-colors hover:bg-[#7fe5c0]">
                Read Case Study
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Contact Expert Section ═══ */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-center gap-8 lg:grid-cols-3">
            {/* Left: Expert profile */}
            <div className="text-center lg:text-left">
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-gray-200 lg:mx-0">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f44?w=200&h=200&fit=crop"
                  alt="Sonja Smith"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 text-sm font-bold text-white">Sonja Smith</p>
              <p className="text-xs text-white/60">SmartGigs Kenya Casting Expert</p>
            </div>

            {/* Middle: Heading */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-white md:text-2xl">
                Find out more and connect with one of our experts.
              </h2>
              <p className="mt-3 text-sm text-white/60 md:text-base">
                Not ready to post yet? No problem. Leave your details and one of our casting experts
                will get back to you.
              </p>
            </div>

            {/* Right: Form */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="First Name"
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a47a3]"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a47a3]"
              />
              <input
                type="text"
                placeholder="Company Name"
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a47a3]"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a47a3]"
              />
              <button className="w-full rounded-lg bg-[#4a47a3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3e3b8f]">
                Contact Me
              </button>
              <p className="text-xs text-white/40">
                By clicking 'Contact Me', you agree that SmartGigs Kenya will process your personal
                information in accordance with our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  )
}

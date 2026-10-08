import React from 'react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import SEOMetaTags from '@/components/SEOMetaTags'
import { Target, Heart, Users, TrendingUp, BookOpen, Calendar } from 'lucide-react'

const values = [
  { icon: Target, title: 'Mission First', desc: 'We exist to break down barriers in the creative industry and make opportunity accessible to all.' },
  { icon: Heart, title: 'Talent Obsessed', desc: 'Every decision starts with what is best for the talent and creators who rely on us.' },
  { icon: Users, title: 'Inclusive by Design', desc: 'We build products that welcome everyone, regardless of background or experience level.' },
  { icon: TrendingUp, title: 'Always Improving', desc: 'We iterate fast, learn from data, and never settle for "good enough."' },
  { icon: BookOpen, title: 'Knowledge Sharing', desc: 'We democratize insider knowledge so that anyone can navigate the industry with confidence.' },
  { icon: Calendar, title: 'Remote-First', desc: 'We trust our team to do their best work wherever they are, with flexibility and autonomy.' },
]

const perks = [
  { icon: Users, title: 'Remote-First Culture', desc: 'Work from anywhere. We have team members across multiple time zones.' },
  { icon: Heart, title: 'Health and Wellness', desc: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
  { icon: Users, title: 'Community', desc: 'Regular team meetups, virtual events, and a culture of collaboration.' },
  { icon: TrendingUp, title: 'Retirement Planning', desc: '401(k) with company match to help you plan for the future.' },
  { icon: BookOpen, title: 'Professional Development', desc: 'Learning stipend, conference attendance, and internal growth paths.' },
  { icon: Calendar, title: 'Generous PTO', desc: 'Flexible paid time off plus holidays — we want you rested and inspired.' },
]

const teamPhotos = [
  { src: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=500&h=350&fit=crop', caption: 'Team Meetup — New York City' },
  { src: 'https://images.unsplash.com/photo-1513635269970-9b3131f5b1c4?w=500&h=350&fit=crop', caption: 'Team Meetup — London' },
  { src: 'https://images.unsplash.com/photo-1515462277126-7b8f1d1f1f1f?w=500&h=350&fit=crop', caption: 'Team Meetup — Las Vegas' },
]

export default function Careers() {
  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="Careers — Eric Rabar"
        description="Help us build the world's best career platform for entertainment industry professionals."
        keywords="careers, jobs, eric rabar, entertainment jobs"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Careers at Eric Rabar', description: 'Join our team' }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[400px] overflow-hidden md:h-[480px]">
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&h=600&fit=crop"
          alt="Team working"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative flex h-full items-center justify-center px-4">
          <div className="max-w-2xl text-center">
            <h1 className="font-serif text-2xl font-bold leading-tight text-white md:text-4xl">
              Help us build the world's best career platform for entertainment industry
              professionals.
            </h1>
            <button className="mt-8 rounded-full bg-[#4ade80] px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105">
              Explore Roles
            </button>
          </div>
        </div>
      </section>

      {/* Mission Body Text */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-gray-700">
            At Eric Rabar, we believe that talent is everywhere, but opportunity is not. Our
            mission is to break down the barriers that keep great talent from finding great work.
            We are building the tools, the network, and the knowledge base to make the creative
            industry more open, more fair, and more accessible to everyone — regardless of where
            they come from or who they know.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-2xl font-bold text-black md:text-3xl">
            Our values are the engine that drives our work.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title}>
                  <Icon className="h-8 w-8 text-[#5A75FF]" strokeWidth={1.5} />
                  <h3 className="mt-4 text-lg font-bold text-black">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Photos */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {teamPhotos.map((p) => (
              <div key={p.caption}>
                <div className="overflow-hidden rounded-2xl">
                  <img src={p.src} alt={p.caption} className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-center text-sm font-medium text-gray-700">{p.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks and Benefits */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-[#eef2ff] px-6 py-14 md:px-12">
            <h2 className="text-center font-serif text-2xl font-bold text-black md:text-3xl">
              Perks and Benefits
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {perks.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.title}>
                    <Icon className="h-8 w-8 text-[#5A75FF]" strokeWidth={1.5} />
                    <h3 className="mt-4 text-lg font-bold text-black">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  )
}

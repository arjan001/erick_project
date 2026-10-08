import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserCircle, Film, CalendarCheck, Lock, Briefcase } from 'lucide-react'
import { ParallaxLayer } from './Parallax'

const keyElements = [
  { icon: UserCircle, label: 'Bio', text: 'Introduce yourself and highlight your skills, specialties, and areas of expertise.' },
  { icon: Film, label: 'Portfolio', text: 'Showcase your past work, projects, and achievements to demonstrate your capabilities.' },
  { icon: CalendarCheck, label: 'Availability', text: "Specify your availability for gigs, whether you're looking for short-term opportunities or long-term projects." },
  { icon: Lock, label: 'Contact Information', text: 'Communication is only within the app until an application is accepted.' },
]

export default function ProfilesGigs() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-[#4F46E5]">Profiles</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-black md:text-4xl">Make a lasting impression</h2>
          <p className="mt-4 text-base leading-relaxed text-black/70">
            Set up a profile on SmartGigs Kenya and showcase your talent, experience, and availability
            to potential employers in the film industry. Whether you're an actor, crew member, or
            location manager, your profile is your opportunity to make a lasting impression and land
            your next gig.
          </p>
          <p className="mt-3 text-sm text-black/55">
            Add images and reels, your bio, past projects, availability, city of residence and any
            other relevant information to be displayed to the public.
          </p>

          <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-black">Key elements of a profile</h3>
          <ul className="mt-4 space-y-4">
            {keyElements.map((k) => {
              const Icon = k.icon
              return (
                <li key={k.label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#4F46E5]" />
                  <p className="text-sm leading-relaxed text-black/70">
                    <strong className="text-black">{k.label}:</strong> {k.text}
                  </p>
                </li>
              )
            })}
          </ul>
          <p className="mt-6 text-sm font-semibold text-black">
            Create your profile to unlock exciting opportunities in the film industry with SmartGigs Kenya!
          </p>
          <Link to="/SignUp" className="mt-4 inline-block rounded-full bg-[#4F46E5] px-7 py-3 text-sm font-semibold text-white hover:bg-[#4338CA]">
            Create your profile
          </Link>
        </motion.div>

        {/* Gigs */}
        <ParallaxLayer speed={0.12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-full rounded-3xl bg-[#1a1a23] p-8 text-white md:p-10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Briefcase className="h-6 w-6 text-[#a7f3d0]" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[#a7f3d0]">Gigs</p>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">All available gigs, in one place</h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Producers can post what they are looking for from within their profiles, and every
              opening is displayed here. Users show interest by applying for the gigs.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>• Producers tag city or region so roles surface to the right talent automatically.</li>
              <li>• Actors and crew get instant alerts matched by location and profile tags.</li>
              <li>• Track every application's status in one view.</li>
            </ul>
            <Link to="/FindJobs" className="mt-8 inline-block rounded-full bg-[#a7f3d0] px-7 py-3 text-sm font-bold text-black hover:bg-[#85F1B5]">
              Browse gigs
            </Link>
          </motion.div>
        </ParallaxLayer>
      </div>
    </section>
  )
}

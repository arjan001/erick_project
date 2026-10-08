import React from 'react'
import { Link } from 'react-router-dom'
import { ParallaxBackground } from './Parallax'

/** Full-bleed parallax banner carrying the SmartGigs mission (footer block B2) + about blurb (M2). */
export default function MissionBanner() {
  return (
    <section className="bg-[#F5F3EF] pb-16 md:pb-24">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="rounded-3xl overflow-hidden">
          <ParallaxBackground
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop"
            overlay="bg-gradient-to-r from-black/85 via-black/65 to-black/40"
          >
            <div className="max-w-2xl px-6 py-16 text-white md:px-12 md:py-24">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#a7f3d0]">Our mission</p>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-5xl">
                Building a vibrant community of filmmakers in Kenya
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/85">
                To empower talent, directors and producers by providing a platform for them to showcase
                their skills and find opportunities — from the actor chasing a first break to the
                producer assembling the perfect team.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/About" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black hover:bg-white/90">
                  About SmartGigs
                </Link>
                <Link to="/SignUp" className="rounded-full border border-white/70 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10">
                  Join the community
                </Link>
              </div>
            </div>
          </ParallaxBackground>
        </div>
      </div>
    </section>
  )
}

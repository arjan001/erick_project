import React from 'react'
import SEOMetaTags from '@/components/SEOMetaTags'
import Navbar from '@/components/landing/backstage/Navbar'
import Marquee from '@/components/landing/backstage/Marquee'
import Hero from '@/components/landing/backstage/Hero'
// import TrustBar from '@/components/landing/backstage/TrustBar'; // Disabled for now
import PartnersCarousel from '@/components/landing/backstage/PartnersCarousel'
import CreativeTeamCarousel from '@/components/landing/backstage/CreativeTeamCarousel'
import GigSearch from '@/components/landing/backstage/GigSearch'
import FeaturedGigs from '@/components/landing/backstage/FeaturedGigs'
import ProfilesGigs from '@/components/landing/backstage/ProfilesGigs'
import KeyFeatures from '@/components/landing/backstage/KeyFeatures'
import HowItWorks from '@/components/landing/backstage/HowItWorks'
import InspiringPerformers from '@/components/landing/backstage/InspiringPerformers'
// import NewsAndVideos from '@/components/landing/backstage/NewsAndVideos'; // Deleted as requested
import MissionBanner from '@/components/landing/backstage/MissionBanner'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <SEOMetaTags
        title="SmartGigs Kenya — The Place to Get Hired for Theater, Film & TV"
        description="SmartGigs Kenya is the leading casting platform in Kenya. Find thousands of open casting calls, auditions, and acting gigs. Post a gig and find the perfect talent for your film, TV, theater, or commercial project."
        keywords="smartgigs kenya, casting calls kenya, acting jobs kenya, auditions kenya, theater gigs kenya, film jobs kenya, TV jobs kenya, voiceover jobs kenya, modeling gigs kenya, ugc creators kenya, lip sync jobs kenya, commercial casting kenya, background actors kenya, extras kenya, film production kenya, tv production kenya, theater production kenya, casting directors kenya, talent agencies kenya, where to get casting roles kenya, how to get acting jobs kenya, film auditions kenya, tv auditions kenya, commercial auditions kenya, modeling agencies kenya, voice actors kenya, actors for hire kenya, crew for hire kenya, producers kenya, casting managers kenya, creative talent kenya, performers kenya, entertainers kenya, kenya film industry, kenya tv industry, kenya theater industry, nairobi casting, mombasa acting, kisumu auditions, entertainment jobs kenya, media jobs kenya, production jobs kenya"
        ogImage="https://smartgigs.co.ke/og-home.jpg"
        ogType="website"
        schemaType="WebSite"
        schemaData={{
          name: 'SmartGigs Kenya',
          url: 'https://smartgigs.co.ke',
          description: 'The leading casting platform in Kenya connecting actors, crew, producers, and casting directors.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://smartgigs.co.ke/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }}
      />

      <Marquee />
      <Navbar />
      <main>
        <Hero />
        <FeaturedGigs />
        {/* <TrustBar /> - Disabled for now, can be re-enabled via admin */}
        <PartnersCarousel />
        <KeyFeatures />
        <CreativeTeamCarousel />
        <GigSearch />
        <ProfilesGigs />
        <HowItWorks />
        <InspiringPerformers />
        {/* <NewsAndVideos /> - Deleted as requested */}
        <MissionBanner />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

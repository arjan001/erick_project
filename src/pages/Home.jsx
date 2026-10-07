import React from 'react';
import SEOMetaTags from '@/components/SEOMetaTags';
import Navbar from '@/components/landing/backstage/Navbar';
import Marquee from '@/components/landing/backstage/Marquee';
import Hero from '@/components/landing/backstage/Hero';
// import TrustBar from '@/components/landing/backstage/TrustBar'; // Disabled for now
import PartnersCarousel from '@/components/landing/backstage/PartnersCarousel';
import CreativeTeamCarousel from '@/components/landing/backstage/CreativeTeamCarousel';
import GigSearch from '@/components/landing/backstage/GigSearch';
import FeaturedGigs from '@/components/landing/backstage/FeaturedGigs';
import ProfilesGigs from '@/components/landing/backstage/ProfilesGigs';
import KeyFeatures from '@/components/landing/backstage/KeyFeatures';
import HowItWorks from '@/components/landing/backstage/HowItWorks';
import InspiringPerformers from '@/components/landing/backstage/InspiringPerformers';
// import NewsAndVideos from '@/components/landing/backstage/NewsAndVideos'; // Deleted as requested
import MissionBanner from '@/components/landing/backstage/MissionBanner';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <SEOMetaTags
        title="SmartGigs Kenya — The Place to Get Hired for Theater, Film & TV"
        description="SmartGigs Kenya is the place to get hired for theater, film, and TV. Find thousands of open casting calls, auditions, and gigs. Post a gig and find the perfect talent for your project."
        keywords="smartgigs kenya, casting calls, acting gigs, auditions, theater gigs, film gigs, TV gigs, voiceover gigs, modeling gigs, hire talent"
        ogImage="https://smartgigs.co.ke/og-home.jpg"
        ogType="website"
        schemaType="WebSite"
        schemaData={{
          name: 'SmartGigs Kenya',
          url: 'https://smartgigs.co.ke',
          description: 'The place to get hired for theater, film, and TV.',
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
  );
}

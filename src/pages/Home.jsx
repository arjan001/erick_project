import React from 'react';
import SEOMetaTags from '@/components/SEOMetaTags';
import Navbar from '@/components/landing/backstage/Navbar';
import Marquee from '@/components/landing/backstage/Marquee';
import Hero from '@/components/landing/backstage/Hero';
import TrustBar from '@/components/landing/backstage/TrustBar';
import JobSearch from '@/components/landing/backstage/JobSearch';
import FeaturedJobs from '@/components/landing/backstage/FeaturedJobs';
import ProfilesGigs from '@/components/landing/backstage/ProfilesGigs';
import HowItWorks from '@/components/landing/backstage/HowItWorks';
import InspiringPerformers from '@/components/landing/backstage/InspiringPerformers';
import NewsAndVideos from '@/components/landing/backstage/NewsAndVideos';
import CTASection from '@/components/landing/backstage/CTASection';
import MissionBanner from '@/components/landing/backstage/MissionBanner';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <SEOMetaTags
        title="SmartGigs Kenya — The Place to Get Hired for Theater, Film & TV"
        description="SmartGigs Kenya is the place to get hired for theater, film, and TV. Find thousands of open casting calls, auditions, and jobs. Post a job and find the perfect talent for your project."
        keywords="smartgigs kenya, casting calls, acting jobs, auditions, theater jobs, film jobs, TV jobs, voiceover jobs, modeling jobs, hire talent"
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
        <TrustBar />
        <JobSearch />
        <FeaturedJobs />
        <ProfilesGigs />
        <HowItWorks />
        <InspiringPerformers />
        <NewsAndVideos />
        {/* CTASection commented out for now */}
        {/* <CTASection /> */}
        <MissionBanner />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

import React from 'react';
import SEOMetaTags from '@/components/SEOMetaTags';
import Navbar from '@/components/landing/backstage/Navbar';
import Hero from '@/components/landing/backstage/Hero';
import TrustBar from '@/components/landing/backstage/TrustBar';
import JobSearch from '@/components/landing/backstage/JobSearch';
import FeaturedJobs from '@/components/landing/backstage/FeaturedJobs';
import HowItWorks from '@/components/landing/backstage/HowItWorks';
import InspiringPerformers from '@/components/landing/backstage/InspiringPerformers';
import NewsAndVideos from '@/components/landing/backstage/NewsAndVideos';
import CTASection from '@/components/landing/backstage/CTASection';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <SEOMetaTags
        title="Eric Rabar — The Place to Get Hired for Theater, Film & TV"
        description="Eric Rabar is the place to get hired for theater, film, and TV. Find thousands of open casting calls, auditions, and jobs. Post a job and find the perfect talent for your project."
        keywords="eric rabar, casting calls, acting jobs, auditions, theater jobs, film jobs, TV jobs, voiceover jobs, modeling jobs, hire talent"
        ogImage="https://ericrabar.com/og-home.jpg"
        ogType="website"
        schemaType="WebSite"
        schemaData={{
          name: 'Eric Rabar',
          url: 'https://ericrabar.com',
          description: 'The place to get hired for theater, film, and TV.',
        }}
      />

      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <JobSearch />
        <FeaturedJobs />
        <HowItWorks />
        <InspiringPerformers />
        <NewsAndVideos />
        <CTASection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

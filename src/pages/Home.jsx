import React from 'react';
import SEOMetaTags from '@/components/SEOMetaTags';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import FeaturedJobs from '@/components/landing/FeaturedJobs';
import Disciplines from '@/components/landing/Disciplines';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';

export default function Home() {
  return (
    <div className="bg-[#0A0A0A]">
      <SEOMetaTags
        title="Studio22 — The Film Industry's Curated Talent Network"
        description="Studio22 connects directors, cinematographers, editors, VFX artists, and production teams with the people who need them. Post a project, browse vetted talent, and hire your crew."
        keywords="film industry jobs, hire filmmakers, cinematographers, video editors, VFX artists, production teams, creative talent marketplace, film crew, post a project"
        ogImage="https://studio22.com/og-home.jpg"
        ogType="website"
        schemaType="WebSite"
        schemaData={{
          name: 'Studio22',
          url: 'https://studio22.com',
          description:
            'The film industry\u2019s curated talent network connecting clients with vetted creators and production teams.',
        }}
      />

      <Hero />
      <Stats />
      <FeaturedJobs />
      <Disciplines />
      <HowItWorks />
      <CTA />
    </div>
  );
}

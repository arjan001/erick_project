import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/backstage/Navbar';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';
import SEOMetaTags from '@/components/SEOMetaTags';

const metrics = [
  { value: '3,512', label: 'NEW ROLES POSTED THIS WEEK' },
  { value: '259,293', label: 'ERIC RABAR MEMBERS & COUNTING' },
  { value: '195,348', label: 'CREATORS LOOKING FOR TALENT' },
  { value: '66', label: 'YEARS OF INSIDER KNOWLEDGE' },
];

const brands = ['ABC', 'Disney', 'AMC', 'HBO', 'CW', 'Netflix', '20th Century Animation', 'NBC', 'SAG-AFTRA'];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="About — Eric Rabar"
        description="Eric Rabar is the #1 platform for the world's best talent and creators."
        keywords="about eric rabar, casting platform, talent marketplace"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'About Eric Rabar', description: 'The #1 platform for talent and creators' }}
      />
      <Navbar />

      {/* Hero */}
      <section className="px-4 pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-black md:text-5xl">
            Eric Rabar is the #1 platform for the world's best talent and creators
          </h1>
        </div>
      </section>

      {/* Metric Bar */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#A8E4C0] md:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="px-6 py-8 text-center">
                <div className="text-3xl font-bold text-black md:text-4xl">{m.value}</div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-black/60 md:text-xs">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Editorial */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1504711438077-2dc8d2f1d3d8?w=600&h=750&fit=crop"
                alt="Backstage newspaper"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-5">
              <p className="text-base leading-relaxed text-gray-700">
                Since 1960, Eric Rabar has been the most trusted name in casting. What began as a
                small trade publication for the performing arts has grown into the world's leading
                platform connecting talent with the creators who need them.
              </p>
              <p className="text-base leading-relaxed text-gray-700">
                Today, we serve hundreds of thousands of performers, creators, and production
                companies across film, television, theater, commercials, voiceover, and digital
                media. Our mission remains the same: to break down barriers and make the
                entertainment industry accessible to everyone, everywhere.
              </p>
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-lg leading-relaxed text-gray-800">
            Whether you want to land one of the thousands of roles posted each week or find the
            perfect talent for your next project, Eric Rabar gives you the tools, the network, and
            the insider knowledge to succeed.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-[#4A47E5] px-6 py-14 text-center md:px-12">
            <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
              Want to see what Eric Rabar can do for you?
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
                Get Hired
              </button>
              <button className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
                Launch Your Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-serif text-xl font-bold text-black md:text-2xl">
            Trusted by some of the biggest names in the industry
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {brands.map((b) => (
              <span key={b} className="text-lg font-bold text-gray-400 md:text-xl">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop"
            alt="Sandra Bullock"
            className="mx-auto h-24 w-24 rounded-full object-cover"
          />
          <p className="mt-6 text-lg font-medium italic leading-relaxed text-gray-800 md:text-xl">
            "Eric Rabar has been an essential part of my career from the very beginning. It's the
            place where opportunities meet preparation, and where the next generation of talent
            gets their start."
          </p>
          <p className="mt-4 text-base font-bold text-black">Sandra Bullock</p>
        </div>
      </section>

      {/* Work with us */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-[#A8E4C0] px-6 py-14 text-center md:px-12">
            <h2 className="font-serif text-2xl font-bold text-black md:text-3xl">Work with us</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-black/70">
              Join our team and help launch the careers of the next generation of performing
              artists.
            </p>
            <Link
              to="/Careers"
              className="mt-8 inline-block rounded-full bg-[#2A2A2A] px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              View Current Opportunities
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}

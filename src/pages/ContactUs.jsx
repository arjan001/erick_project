import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';
import Navbar from '@/components/landing/backstage/Navbar';
import Footer from '@/components/landing/backstage/Footer';
import ChatWidget from '@/components/landing/backstage/ChatWidget';
import SEOMetaTags from '@/components/SEOMetaTags';

const EMAIL = 'contact@smartgigskenya.com';
const PHONE = '+254 780278398';

const socials = [
  { icon: Facebook, name: 'Facebook' },
  { icon: Twitter, name: 'Twitter' },
  { icon: Instagram, name: 'Instagram' },
];

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="Contact Us — SmartGigs Kenya"
        description="Have a question or feedback for the SmartGigs Kenya team? Email, call or visit us."
        keywords="contact smartgigs kenya, support, film jobs kenya"
        ogType="website"
        schemaType="ContactPage"
        schemaData={{ name: 'Contact SmartGigs Kenya' }}
      />
      <Navbar />

      <section className="bg-gradient-to-b from-[#5A75FF] to-[#A0C3FF] px-4 pb-14 pt-14 text-center">
        <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Contact us</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/90">
          Have a question or feedback for the SmartGigs Kenya team? We'd love to hear from you!
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <a href={`mailto:${EMAIL}`} className="rounded-2xl border border-black/5 bg-[#F5F3EF] p-6 transition-shadow hover:shadow-md">
            <Mail className="h-6 w-6 text-[#4F46E5]" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-black/50">Email</p>
            <p className="mt-1 break-all text-sm font-semibold text-black">{EMAIL}</p>
          </a>
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="rounded-2xl border border-black/5 bg-[#F5F3EF] p-6 transition-shadow hover:shadow-md">
            <Phone className="h-6 w-6 text-[#4F46E5]" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-black/50">Phone</p>
            <p className="mt-1 text-sm font-semibold text-black">{PHONE}</p>
          </a>
          <div className="rounded-2xl border border-black/5 bg-[#F5F3EF] p-6">
            <MapPin className="h-6 w-6 text-[#4F46E5]" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-black/50">Address</p>
            <p className="mt-1 text-sm font-semibold text-black">Nairobi, Kenya</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-[#1a1a23] p-8 text-center text-white">
          <h2 className="font-serif text-2xl font-bold">Connect with us on social media</h2>
          <p className="mt-2 text-sm text-white/65">Our community pages are launching soon — follow along.</p>
          <div className="mt-6 flex justify-center gap-4">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-xs font-medium text-white/80">{s.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/40">Coming soon</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <a href={`mailto:${EMAIL}`} className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-black/80">
            Send us an email
          </a>
          <Link to="/FAQ" className="flex items-center gap-2 rounded-full border border-black/20 px-8 py-3 text-sm font-semibold text-black hover:bg-black/[0.04]">
            <MessageCircle className="h-4 w-4" /> Read the FAQ
          </Link>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}

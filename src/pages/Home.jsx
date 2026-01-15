import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Play, MapPin, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../components/useTranslation';
import EuropeanPresenceMap from '../components/home/EuropeanPresenceMap';
import FeaturedWork from '../components/home/FeaturedWork';
import ServicesPreview from '../components/home/ServicesPreview';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/10 to-white z-10" />
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000" 
            alt="Production"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-blue-600 px-12 py-8 mb-8 animate-fadeInUp">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-tight">
              Production<br />Excellence
            </h1>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl text-white font-medium max-w-3xl mx-auto mb-16 animate-fadeInUp bg-blue-600 inline-block px-8 py-4" style={{animationDelay: '0.2s'}}>
            European network of curated production specialists
          </p>
          <div className="flex justify-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <Link to={createPageUrl('SubmitProject')}>
              <Button size="lg" className="bg-white hover:bg-gray-100 text-black px-16 py-8 text-xl font-medium rounded-sm shadow-2xl border-2 border-black">
                SUBMIT PROJECT
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Featured Work */}
      <FeaturedWork />

      {/* Services Preview */}
      <ServicesPreview />

      {/* First Frame CTA */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 text-amber-600 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Studio22 First Frame</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Experience how Studio22 works with one complimentary production day for verified projects. See our quality firsthand.
          </p>
          <Link to={createPageUrl('FirstFrame')}>
            <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-6 text-lg rounded-lg">
              Learn More About First Frame
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Ready to start?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Submit your project and let us assemble the perfect team.
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-lg rounded-lg shadow-2xl shadow-amber-600/20">
              Submit Your Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
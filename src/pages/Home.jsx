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
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000" 
            alt="Production"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fadeInUp">
            <span className="block text-black mb-2">Production</span>
            <span className="block gradient-text">Excellence</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            European network of curated production specialists
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <Link to={createPageUrl('SubmitProject')}>
              <Button size="lg" className="bg-white hover:bg-gray-100 text-black px-12 py-7 text-lg font-semibold rounded-none group relative overflow-hidden">
                <span className="relative z-10">SUBMIT PROJECT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to={createPageUrl('Work')}>
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-12 py-7 text-lg font-semibold rounded-none transition-all duration-300">
                VIEW PORTFOLIO
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-white/50 rounded-full"></div>
            </div>
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
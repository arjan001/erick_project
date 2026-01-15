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
      <section className="relative min-h-screen flex items-center justify-center py-20 bg-white">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white z-10" />
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000" 
            alt="Production"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        {/* Hero Content - Form Style */}
        <div className="relative z-20 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-black">
              New Project
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              One sentence. The system handles the rest.
            </p>

            {/* Reference Website */}
            <div className="mb-8">
              <label className="block text-base font-semibold mb-3 text-black">
                Reference Website (Optional)
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="www.example.com"
                  className="flex-1 px-5 py-4 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-base font-medium">
                  Extract
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Provide a URL and click Extract to auto-generate your project description
              </p>
            </div>

            {/* Project Description */}
            <div className="mb-8">
              <label className="block text-base font-semibold mb-3 text-black">
                Project Description
              </label>
              <textarea
                rows={8}
                placeholder="Describe your project or use Extract button above. You can write multiple sentences with details about your vision, target audience, style, and goals."
                className="w-full px-5 py-4 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 transition-all flex items-center gap-2">
                <span>⭐</span>
                Commercial
                <span className="text-gray-400">▼</span>
              </button>
              <div className="flex gap-3">
                <button className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 transition-all flex items-center gap-2">
                  <span>📎</span>
                  Attach
                </button>
                <Link to={createPageUrl('SubmitProject')}>
                  <Button size="lg" className="bg-gray-600 hover:bg-gray-700 text-white px-10 py-4 text-base font-medium rounded-xl shadow-xl">
                    <span className="mr-2">✨</span>
                    Generate Production Plan
                  </Button>
                </Link>
              </div>
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
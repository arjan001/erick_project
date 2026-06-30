import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Button } from '@/components/ui/button';
import { Video, Film, Scissors, Wand2, ArrowRight, CheckCircle } from 'lucide-react';

const SERVICES = [
  {
    icon: Video,
    title: 'Commercial Production',
    description: 'Full-service commercial production from concept to delivery',
    features: [
      'Concept development & creative direction',
      'Location scouting & casting',
      'Production coordination across Europe',
      'On-set direction & cinematography',
      'Multi-format delivery for all platforms'
    ],
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    icon: Film,
    title: 'Film Support',
    description: 'Comprehensive support for short films and feature productions',
    features: [
      'Script consultation & development',
      'Crew assembly & coordination',
      'Equipment & location packages',
      'Production management',
      'Festival preparation & delivery'
    ],
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    icon: Scissors,
    title: 'Post Production',
    description: 'End-to-end post-production with world-class editors',
    features: [
      'Editing & color grading',
      'Sound design & mixing',
      'Music composition & licensing',
      'Motion graphics & titles',
      'Format conversion & delivery'
    ],
    gradient: 'from-amber-600 to-orange-600'
  },
  {
    icon: Wand2,
    title: 'VFX & 3D',
    description: 'Cutting-edge visual effects and 3D animation',
    features: [
      'CGI & 3D animation',
      'Compositing & integration',
      'Green screen & set extensions',
      'Product visualization',
      'Real-time rendering & previews'
    ],
    gradient: 'from-green-600 to-emerald-600'
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-black">
              Full-Spectrum <span className="gradient-text">Production Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              From initial concept to final delivery, we handle every aspect of your production with curated teams across Europe
            </p>
            <Link to={createPageUrl('SubmitProject')}>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Start a Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl border border-gray-200 p-8 hover-lift"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-black">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">How Studio22 Works</h2>
          
          <div className="space-y-12">
            {[
              { step: '01', title: 'Submit Your Project', desc: 'Tell us about your production through our guided intake process' },
              { step: '02', title: 'We Curate Your Team', desc: 'Our network of vetted artists and teams across Europe is matched to your needs' },
              { step: '03', title: 'Studio22 Manages', desc: 'We handle coordination, introductions, and logistics under the Studio22 brand' },
              { step: '04', title: 'Production & Delivery', desc: 'Your project is executed to the highest standards with full support' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-amber-600/20 border-2 border-amber-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-600">{item.step}</span>
                  </div>
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-bold mb-2 text-black">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-black">Ready to start your production?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit your project and let us assemble the perfect team
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              Submit Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
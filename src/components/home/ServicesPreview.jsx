import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Film, Clapperboard, Plane, Wand2, Box, Music, Code, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    icon: Film,
    title: 'Commercial Production',
    description: 'High-end commercial production from concept to delivery',
    color: 'from-amber-600 to-orange-600',
  },
  {
    icon: Clapperboard,
    title: 'Film & Short Film',
    description: 'Feature films, short films, and festival-ready productions',
    color: 'from-purple-600 to-pink-600',
  },
  {
    icon: Plane,
    title: 'Production Services',
    description: 'Full-service production support across Europe',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    icon: Wand2,
    title: 'Post Production',
    description: 'Editing, color grading, and finishing',
    color: 'from-green-600 to-emerald-600',
  },
  {
    icon: Box,
    title: 'VFX & 3D',
    description: 'Visual effects and 3D animation',
    color: 'from-red-600 to-rose-600',
  },
  {
    icon: Music,
    title: 'Sound & Music',
    description: 'Sound design, mixing, and original music composition',
    color: 'from-indigo-600 to-violet-600',
  },
  {
    icon: Code,
    title: 'Web Development',
    description: 'Full-stack development for marketing and promotion',
    color: 'from-yellow-600 to-amber-600',
  },
];

export default function ServicesPreview() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black">
            What We Do
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            End-to-end production services with curated specialists
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative p-6 md:p-8 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover-lift"
              >
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl`} />
                
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-black group-hover:text-amber-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            to={createPageUrl('Services')} 
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-500 text-lg font-medium group"
          >
            <span>Explore All Services</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
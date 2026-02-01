import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Play } from 'lucide-react';

export default function HeroShowcase() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-6 py-24">
      {/* Large Title */}
      <div className="text-center max-w-6xl mx-auto">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg mb-8">
            Production of the Day - Feb 1, 2026
          </span>
        </div>
        
        <h1 className="text-hero uppercase mb-8 tracking-tighter">
          STUDIO22
        </h1>
        
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <span className="text-sm font-medium">European Production Network</span>
          </div>
        </div>

        {/* Featured Project Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000"
            alt="Featured Production"
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Bottom Nav Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="bg-[#2B2B2B]/95 backdrop-blur-sm rounded-xl px-2 py-2 flex items-center gap-2">
              <button className="px-4 py-2 text-sm text-white font-medium bg-gray-700 rounded-lg">
                Details
              </button>
              <button className="px-4 py-2 text-sm text-gray-300 font-medium hover:text-white transition-colors">
                Team
              </button>
              <button className="px-4 py-2 text-sm text-gray-300 font-medium hover:text-white transition-colors">
                Services
              </button>
              <button className="px-4 py-2 text-sm text-gray-300 font-medium hover:text-white transition-colors">
                Score
              </button>
              <button className="px-4 py-2 bg-yellow-400 text-black text-sm font-bold rounded-lg hover:bg-yellow-300 transition-colors">
                View Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
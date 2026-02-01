import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Award } from 'lucide-react';
import HeroShowcase from '../components/home/HeroShowcase';
import ProjectGrid from '../components/home/ProjectGrid';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Showcase */}
      <HeroShowcase />

      {/* Nominees Section */}
      <ProjectGrid />

      {/* Winners Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-black uppercase mb-4 tracking-tight">
              Winners
            </h2>
            <p className="text-xl text-gray-600">
              Recent Productions of the Day
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Winner Cards */}
            {[1, 2].map((i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 card-hover"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${i === 1 ? '1579547621113' : '1574267432553'}-c130c5abfa72?q=80&w=1200`}
                    alt="Winner"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="inline-flex flex-col items-center px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-600">POTD</div>
                      <div className="text-3xl font-black leading-none">8.{i}7</div>
                      <div className="text-xs text-gray-500">/10</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                    Featured Commercial
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                    <span className="font-medium">Studio22 Amsterdam</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('Work')}>
              <button className="px-8 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300">
                View All Winners
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display uppercase mb-6 tracking-tighter">
              Full-Service
              <br />
              Production
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From concept to delivery, we handle every aspect with curated teams across Europe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Commercial', desc: 'High-end commercial production from concept to delivery' },
              { title: 'Film & Docs', desc: 'Feature films, shorts, and documentaries' },
              { title: 'Post Production', desc: 'Editing, color grading, and finishing' },
              { title: 'VFX & 3D', desc: 'Visual effects and 3D animation' },
              { title: 'Sound & Music', desc: 'Sound design, mixing, and composition' },
              { title: 'Web Dev', desc: 'Marketing websites and digital experiences' },
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-black rounded-lg mb-4" />
                <h3 className="text-2xl font-black uppercase mb-3 tracking-tight">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First Frame CTA */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight">Studio22 First Frame</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Experience our quality with one complimentary production day for verified projects
          </p>
          <Link to={createPageUrl('FirstFrame')}>
            <button className="px-8 py-4 bg-yellow-400 text-black font-bold uppercase text-sm tracking-wider hover:bg-yellow-300 transition-all duration-300 rounded-lg">
              Learn More <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-display uppercase mb-6 tracking-tighter">Ready to Start?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit your project and we'll assemble the perfect team
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <button className="px-12 py-5 bg-black text-white font-bold uppercase text-sm tracking-wider hover:bg-gray-800 transition-all duration-300 rounded-lg shadow-2xl">
              Submit Project <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
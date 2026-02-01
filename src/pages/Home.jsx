import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Award, MapPin, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroShowcase from '../components/home/HeroShowcase';

export default function Home() {
  const [nominees, setNominees] = useState([]);
  const [winners, setWinners] = useState([]);
  const [creators, setCreators] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [nomineesRes, winnersRes, creatorsRes, collectionsRes] = await Promise.all([
        base44.functions.invoke('generateContent', { section: 'nominees' }),
        base44.functions.invoke('generateContent', { section: 'winners' }),
        base44.functions.invoke('generateContent', { section: 'creators' }),
        base44.functions.invoke('generateContent', { section: 'collections' })
      ]);

      if (nomineesRes.data?.success) setNominees(nomineesRes.data.data.projects || []);
      if (winnersRes.data?.success) setWinners(winnersRes.data.data.projects || []);
      if (creatorsRes.data?.success) setCreators(creatorsRes.data.data.creators || []);
      if (collectionsRes.data?.success) setCollections(collectionsRes.data.data.collections || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Showcase */}
      <HeroShowcase />

      {/* Nominees Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
              NOMINEES
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-xl text-gray-600">Latest productions seeking talent</p>
              <Link to={createPageUrl('Work')} className="text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {nominees.slice(0, 9).map((project, i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 card-hover"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700', '1558618666', '1574267432553', '1485846234645'][i]}-c130c5abfa72?q=80&w=800`}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                      {project.type}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">{project.title}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                      <span className="text-xs font-bold">300cbt</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300" />
                    <span className="font-medium">{project.company}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Winners Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
              WINNERS
            </h2>
            <p className="text-xl text-gray-600">Recent Productions of the Day</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {winners.slice(0, 6).map((winner, i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 card-hover"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700'][i]}-c130c5abfa72?q=80&w=1200`}
                    alt={winner.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="inline-flex flex-col items-center px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-600">POTD</div>
                      <div className="text-3xl font-black leading-none">{winner.score}</div>
                      <div className="text-xs text-gray-500">/10</div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">{winner.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300" />
                    <span className="font-medium">{winner.company}</span>
                  </div>
                  <p className="text-xs text-gray-500">{winner.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('Work')}>
              <button className="px-8 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg">
                View All Winners
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 px-6 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
              COLLECTIONS
            </h2>
            <p className="text-xl text-gray-600">Curated production showcases</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection, i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1574267432553', '1492691527719', '1516035069371', '1485846234645'][i]}-c130c5abfa72?q=80&w=600`}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">{collection.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{collection.description}</p>
                  <div className="text-xs font-bold text-gray-400">{collection.project_count} Projects</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Creators Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
              W.CREATORS
            </h2>
            <p className="text-xl text-gray-600">European production talent</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {creators.map((creator, i) => (
              <Link 
                key={i}
                to={createPageUrl('Services')}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-black uppercase tracking-tight mb-1">{creator.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{creator.city}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-2">{creator.role}</p>
                  <p className="text-xs text-gray-400 line-clamp-2">{creator.specialty}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('Services')}>
              <button className="px-8 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg">
                View All Creators
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
      <section className="py-24 bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-16 h-16 mx-auto mb-6 text-[#FFD700]" />
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">Studio22 First Frame</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Experience our quality with one complimentary production day for verified projects
          </p>
          <Link to={createPageUrl('FirstFrame')}>
            <button className="px-10 py-4 bg-[#FFD700] text-black font-bold uppercase text-sm tracking-wider hover:bg-[#FFC700] transition-all duration-300 rounded-lg">
              Learn More <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">Ready to Start?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit your project and we'll assemble the perfect team
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <button className="px-12 py-5 bg-[#1a1a1a] text-white font-bold uppercase text-sm tracking-wider hover:bg-black transition-all duration-300 rounded-lg shadow-2xl">
              Submit Project <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
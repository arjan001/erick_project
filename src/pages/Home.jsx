import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Award, MapPin, User, Play, Bookmark } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [inProduction, setInProduction] = useState([]);
  const [released, setReleased] = useState([]);
  const [creators, setCreators] = useState([]);
  const [collections, setCollections] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [inProdRes, releasedRes, creatorsRes, collectionsRes, recentRes] = await Promise.all([
        base44.functions.invoke('generateContent', { section: 'inproduction' }),
        base44.functions.invoke('generateContent', { section: 'released' }),
        base44.functions.invoke('generateContent', { section: 'creators' }),
        base44.functions.invoke('generateContent', { section: 'collections' }),
        base44.functions.invoke('generateContent', { section: 'recent' })
      ]);

      if (inProdRes.data?.success) setInProduction(inProdRes.data.data.projects || []);
      if (releasedRes.data?.success) setReleased(releasedRes.data.data.projects || []);
      if (creatorsRes.data?.success) setCreators(creatorsRes.data.data.creators || []);
      if (collectionsRes.data?.success) setCollections(collectionsRes.data.data.collections || []);
      if (recentRes.data?.success) setRecent(recentRes.data.data.projects || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2400"
            alt="Cinematic"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#FAFAFA]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-block px-4 py-2 bg-[#FFD700] text-black text-xs font-bold uppercase tracking-widest rounded-full mb-6">
            Production of the Day - Feb 1, 2026
          </div>
          
          <h1 className="text-[120px] md:text-[180px] lg:text-[220px] font-black uppercase leading-[0.85] tracking-tighter text-white mb-8">
            WE ARE 22.
          </h1>
          
          <p className="text-2xl md:text-3xl text-white/90 font-light tracking-wide mb-12">
            Creators of cinematic worlds.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to={createPageUrl('SubmitProject')}>
              <button className="px-8 py-4 bg-white text-black font-bold uppercase text-sm tracking-wider hover:bg-gray-100 transition-all rounded-lg">
                Submit Project
              </button>
            </Link>
            <Link to={createPageUrl('Work')}>
              <button className="px-8 py-4 border-2 border-white text-white font-bold uppercase text-sm tracking-wider hover:bg-white hover:text-black transition-all rounded-lg">
                View Productions
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* IN PRODUCTION Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter">
              IN PRODUCTION
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-xl text-gray-600">Projects currently in development</p>
              <Link to={createPageUrl('Work')} className="text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {inProduction.slice(0, 9).map((project, i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700', '1558618666', '1574267432553', '1485846234645'][i]}-c130c5abfa72?q=80&w=900`}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <button className="p-3 bg-white rounded-full">
                        <Play className="w-5 h-5 text-black" fill="currentColor" />
                      </button>
                      <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                        <Bookmark className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-xs font-bold rounded">
                      {project.type}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="px-3 py-2 bg-white/95 backdrop-blur-sm rounded text-xs font-medium text-black">
                      In Production
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-black uppercase tracking-tight flex-1">{project.title}</h3>
                    <div className="flex items-center gap-1 ml-3">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold">22</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <div className="w-4 h-4 rounded-full bg-gray-300" />
                    <span className="font-medium text-xs">{project.studio}</span>
                    <span className="text-xs text-[#FFD700] font-bold">PRO</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RELEASED Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter">
              RELEASED
            </h2>
            <p className="text-xl text-gray-600">Completed and delivered productions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {released.slice(0, 6).map((project, i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700'][i]}-c130c5abfa72?q=80&w=1200`}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="p-4 bg-white rounded-full">
                      <Play className="w-6 h-6 text-black" fill="currentColor" />
                    </button>
                  </div>

                  <div className="absolute top-5 left-5">
                    <div className="inline-flex flex-col items-center px-5 py-4 bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">POTD</div>
                      <div className="text-4xl font-black leading-none">{project.score}</div>
                      <div className="text-xs text-gray-500 mt-1">/10</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{project.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                    <span className="font-medium">{project.studio}</span>
                    <span className="text-xs text-[#FFD700] font-bold">PRO</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-xs font-bold uppercase tracking-wider rounded mb-3">
                    {project.type}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('Work')}>
              <button className="px-10 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg">
                View All Released
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* COLLECTIONS Section */}
      <section className="py-20 px-6 bg-[#FAFAFA]">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter">
              COLLECTIONS
            </h2>
            <p className="text-xl text-gray-600">Curated production showcases</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, i) => (
              <Link 
                key={i}
                to={createPageUrl('Services')}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1574267432553', '1492691527719', '1516035069371', '1485846234645', '1579547621113', '1536240478700'][i]}-c130c5abfa72?q=80&w=800`}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-300">
                      {collection.project_count} Productions
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{collection.title}</h3>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{collection.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WE ARE 22. CREATORS Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter">
              WE ARE 22. CREATORS
            </h2>
            <p className="text-xl text-gray-600">The people behind our productions</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {creators.map((creator, i) => (
              <Link 
                key={i}
                to={createPageUrl('ApplyArtist')}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-black uppercase tracking-tight mb-1 line-clamp-1">{creator.name}</h3>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{creator.city}</span>
                  </div>
                  
                  <p className="text-xs font-bold text-gray-700 mb-2">{creator.role}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{creator.specialty}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('ApplyArtist')}>
              <button className="px-10 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg">
                View All Creators
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT PRODUCTIONS Section */}
      <section className="py-20 px-6 bg-[#FAFAFA]">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter">
              RECENT PRODUCTIONS
            </h2>
            <p className="text-xl text-gray-600">Recently updated and completed</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {recent.map((project, i) => (
              <Link 
                key={i}
                to={createPageUrl('Work')}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700', '1558618666', '1574267432553'][i]}-c130c5abfa72?q=80&w=800`}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/90 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                      {project.type}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-black uppercase tracking-tight mb-2 line-clamp-1">{project.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="font-medium line-clamp-1">{project.studio}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{project.description}</p>
                </div>
              </Link>
            ))}
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

      {/* Studio22 Market Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-6 tracking-tighter">
              STUDIO22 MARKET
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional network for sharing cameras, lenses, lighting, audio gear, locations, studios, and special equipment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'Cinema Cameras', count: '127 items', icon: '📹' },
              { title: 'Lenses & Optics', count: '243 items', icon: '🎥' },
              { title: 'Lighting', count: '189 items', icon: '💡' },
              { title: 'Audio Equipment', count: '156 items', icon: '🎤' },
              { title: 'Locations', count: '89 spaces', icon: '📍' },
              { title: 'Studios', count: '34 facilities', icon: '🏢' },
            ].map((category, i) => (
              <Link 
                key={i}
                to={createPageUrl('ApplyTeam')}
                className="group bg-[#FAFAFA] rounded-lg p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{category.count}</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to={createPageUrl('ApplyTeam')}>
              <button className="px-10 py-4 bg-[#1a1a1a] text-white font-bold uppercase text-sm tracking-wider hover:bg-black transition-all duration-300 rounded-lg">
                Browse Market <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* First Frame CTA */}
      <section className="py-24 bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-20 h-20 mx-auto mb-8 text-[#FFD700]" />
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">STUDIO22 FIRST FRAME</h2>
          <p className="text-2xl mb-10 max-w-2xl mx-auto text-gray-300 font-light">
            Experience our quality with one complimentary production day for verified projects
          </p>
          <Link to={createPageUrl('FirstFrame')}>
            <button className="px-12 py-5 bg-[#FFD700] text-black font-bold uppercase text-sm tracking-wider hover:bg-[#FFC700] transition-all duration-300 rounded-lg shadow-2xl">
              Learn More <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, X } from 'lucide-react';
import TopBanner from './components/home/TopBanner';

export default function Layout({ children, currentPageName }) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('commercial');

  const bottomNav = [
    { name: 'In Production', href: 'Home' },
    { name: 'Released', href: 'Work' },
    { name: 'Collections', href: 'Services' },
    { name: 'Creators', href: 'ApplyArtist' },
    { name: 'Market', href: 'ApplyTeam' },
    { name: 'Visit Sotd.', href: 'FirstFrame', highlight: true },
  ];

  return (
    <div className="min-h-screen bg-white text-[#212121]">
      {/* Top Banner */}
      <TopBanner />

      {/* Main Header (Awwwards Style) */}
      <header className="fixed top-[40px] left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-[60px]">
            {/* Left Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to={createPageUrl('Home')} className="hover:opacity-70 transition-opacity">
                <span className="text-2xl font-black tracking-tighter text-[#1a1a1a]">22.</span>
              </Link>

              {/* Main Nav */}
              <nav className="hidden lg:flex items-center gap-6">
                <div className="relative">
                  <button 
                    onClick={() => setExploreOpen(!exploreOpen)}
                    className="flex items-center gap-1 text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors"
                  >
                    Start to shoot <span className="ml-1 px-1.5 py-0.5 bg-black text-white text-[10px] font-bold rounded">NEW</span> <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <Link to={createPageUrl('FirstFrame')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                  FilmAcademy
                </Link>

                <Link to={createPageUrl('ApplyTeam')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                  Jobs
                </Link>
                <Link to={createPageUrl('ApplyTeam')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                  Market
                </Link>
              </nav>
            </div>

            {/* Center Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="search" 
                  placeholder="Search by Inspiration"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-[#1a1a1a] placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 hover:bg-transparent">
                Log in
              </Button>
              <Button variant="ghost" size="sm" className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 hover:bg-transparent">
                Sign Up
              </Button>
              <Link to={createPageUrl('SubmitProject')}>
                <Button size="sm" className="border-2 border-black hover:bg-black hover:text-white text-white font-bold">
                  Submit Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu Overlay */}
      {exploreOpen && (
        <div className="fixed inset-0 bg-white z-50 pt-[100px]">
          <div className="max-w-[1800px] mx-auto px-6 h-full">
            {/* Close Button */}
            <button 
              onClick={() => setExploreOpen(false)}
              className="absolute top-[120px] right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-[#1a1a1a]" />
            </button>

            <div className="flex gap-12 h-full py-8">
              {/* Left Sidebar - Categories */}
              <div className="w-64 flex-shrink-0">
                <nav className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('commercial')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'commercial' ? 'bg-gray-100 text-[#1a1a1a]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Commercial
                  </button>
                  <button
                    onClick={() => setSelectedCategory('short')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'short' ? 'bg-gray-100 text-[#1a1a1a]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Short Film
                  </button>
                  <button
                    onClick={() => setSelectedCategory('feature')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'feature' ? 'bg-gray-100 text-[#1a1a1a]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Feature Film
                  </button>
                  <button
                    onClick={() => setSelectedCategory('music')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'music' ? 'bg-gray-100 text-[#1a1a1a]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Music Video
                  </button>
                  <button
                    onClick={() => setSelectedCategory('documentary')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'documentary' ? 'bg-gray-100 text-[#1a1a1a]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Documentary
                  </button>
                </nav>
              </div>

              {/* Right Content Area */}
              <div className="flex-1">
                {selectedCategory === 'commercial' && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Commercial</h2>
                    <p className="text-gray-600 text-lg mb-8">Brand films, ads, campaigns. Clear structure. Clear budgets.</p>
                    <div className="grid grid-cols-2 gap-6">
                      <Link to={createPageUrl('Home')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">In Production</div>
                        <div className="text-sm text-gray-500">49K projects in development</div>
                      </Link>
                      <Link to={createPageUrl('Work')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">Released</div>
                        <div className="text-sm text-gray-500">6236 completed productions</div>
                      </Link>
                    </div>
                  </div>
                )}

                {selectedCategory === 'short' && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Short Film</h2>
                    <p className="text-gray-600 text-lg mb-8">Narrative driven. Script heavy. Small to mid crews.</p>
                    <div className="grid grid-cols-2 gap-6">
                      <Link to={createPageUrl('Home')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">In Production</div>
                        <div className="text-sm text-gray-500">Active short film projects</div>
                      </Link>
                      <Link to={createPageUrl('Work')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">Released</div>
                        <div className="text-sm text-gray-500">Completed short films</div>
                      </Link>
                    </div>
                  </div>
                )}

                {selectedCategory === 'feature' && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Feature Film</h2>
                    <p className="text-gray-600 text-lg mb-8">Full production planning. Cast, locations, long schedule.</p>
                    <div className="grid grid-cols-2 gap-6">
                      <Link to={createPageUrl('Home')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">In Production</div>
                        <div className="text-sm text-gray-500">Feature films in development</div>
                      </Link>
                      <Link to={createPageUrl('Work')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">Released</div>
                        <div className="text-sm text-gray-500">Completed features</div>
                      </Link>
                    </div>
                  </div>
                )}

                {selectedCategory === 'music' && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Music Video</h2>
                    <p className="text-gray-600 text-lg mb-8">Visual first. Short schedule. Strong art direction.</p>
                    <div className="grid grid-cols-2 gap-6">
                      <Link to={createPageUrl('Home')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">In Production</div>
                        <div className="text-sm text-gray-500">Active music video projects</div>
                      </Link>
                      <Link to={createPageUrl('Work')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">Released</div>
                        <div className="text-sm text-gray-500">Completed music videos</div>
                      </Link>
                    </div>
                  </div>
                )}

                {selectedCategory === 'documentary' && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Documentary</h2>
                    <p className="text-gray-600 text-lg mb-8">Real world. Flexible planning. Research focused.</p>
                    <div className="grid grid-cols-2 gap-6">
                      <Link to={createPageUrl('Home')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">In Production</div>
                        <div className="text-sm text-gray-500">Active documentary projects</div>
                      </Link>
                      <Link to={createPageUrl('Work')} className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="font-bold text-lg mb-2">Released</div>
                        <div className="text-sm text-gray-500">Completed documentaries</div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-[100px] pb-24">
        {children}
      </main>

      {/* Bottom Floating Navigation */}
      <nav className="fixed bottom-6 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-[#3a3a3a] rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-0 px-2 md:px-3 py-2.5 overflow-x-auto scrollbar-hide">
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center justify-center px-2 md:px-3 py-2 hover:bg-white/5 rounded-lg transition-all mr-1 md:mr-2 flex-shrink-0"
            >
              <span className="text-base md:text-lg font-black text-white tracking-tighter">22.</span>
            </Link>

            <div className="h-6 w-px bg-gray-600 mr-1 md:mr-2 flex-shrink-0" />

            {bottomNav.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                    item.highlight 
                      ? 'bg-[#FFD700] text-black hover:bg-[#FFC700]' 
                      : isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer (Awwwards Style) */}
      <footer className="bg-[#1a1a1a] text-white py-16">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Studio22</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('Home')} className="hover:text-white">About</Link></li>
                <li><Link to={createPageUrl('Home')} className="hover:text-white">Our Story</Link></li>
                <li><Link to={createPageUrl('Home')} className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Productions</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('Home')} className="hover:text-white">In Production</Link></li>
                <li><Link to={createPageUrl('Work')} className="hover:text-white">Released</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">Collections</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('FirstFrame')} className="hover:text-white">First Frame</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">Full Service</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">Virtual Production</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Creators</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('ApplyArtist')} className="hover:text-white">Apply as Artist</Link></li>
                <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Apply as Team</Link></li>
                <li><Link to={createPageUrl('ApplyArtist')} className="hover:text-white">Directory</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Market</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Equipment</Link></li>
                <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Locations</Link></li>
                <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Studios</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#" className="hover:text-white">Imprint</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2026 Studio22. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Instagram</a>
              <a href="#" className="hover:text-white">Vimeo</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
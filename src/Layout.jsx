import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);

  const bottomNav = [
    { name: 'In Production', href: 'Home' },
    { name: 'Released', href: 'Work' },
    { name: 'Collections', href: 'Services' },
    { name: 'Creators', href: 'ApplyArtist' },
    { name: 'Market', href: 'ApplyTeam' },
    { name: 'Visit Sotd.', href: 'FirstFrame', highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#212121]">
      {/* Main Header (Awwwards Style) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] text-white">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Left Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to={createPageUrl('Home')} className="hover:opacity-80 transition-opacity">
                <span className="text-2xl font-black tracking-tighter">22.</span>
              </Link>

              {/* Main Nav */}
              <nav className="hidden lg:flex items-center gap-6">
                <div className="relative">
                  <button 
                    onMouseEnter={() => setExploreOpen(true)}
                    onMouseLeave={() => setExploreOpen(false)}
                    className="flex items-center gap-1 text-sm font-medium hover:text-[#FFD700] transition-colors"
                  >
                    Explore <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {exploreOpen && (
                    <div 
                      onMouseEnter={() => setExploreOpen(true)}
                      onMouseLeave={() => setExploreOpen(false)}
                      className="absolute top-full left-0 mt-4 w-72 bg-white text-black rounded-lg shadow-2xl py-4 px-2"
                    >
                      <div className="space-y-1">
                        <Link to={createPageUrl('Home')} className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">
                          <div className="font-bold">In Production</div>
                          <div className="text-xs text-gray-500">49K projects in development</div>
                        </Link>
                        <Link to={createPageUrl('Work')} className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">
                          <div className="font-bold">Released</div>
                          <div className="text-xs text-gray-500">6236 completed productions</div>
                        </Link>
                        <Link to={createPageUrl('Services')} className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">
                          <div className="font-bold">Collections</div>
                          <div className="text-xs text-gray-500">201 curated showcases</div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onMouseEnter={() => setAcademyOpen(true)}
                    onMouseLeave={() => setAcademyOpen(false)}
                    className="flex items-center gap-1 text-sm font-medium hover:text-[#FFD700] transition-colors"
                  >
                    FilmAcademy <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {academyOpen && (
                    <div 
                      onMouseEnter={() => setAcademyOpen(true)}
                      onMouseLeave={() => setAcademyOpen(false)}
                      className="absolute top-full left-0 mt-4 w-72 bg-white text-black rounded-lg shadow-2xl py-4 px-2"
                    >
                      <div className="space-y-1">
                        <Link to={createPageUrl('FirstFrame')} className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">
                          <div className="font-bold">Cinematography</div>
                          <div className="text-xs text-gray-500">Master camera work</div>
                        </Link>
                        <Link to={createPageUrl('FirstFrame')} className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">
                          <div className="font-bold">Studio Lighting</div>
                          <div className="text-xs text-gray-500">Professional lighting setups</div>
                        </Link>
                        <Link to={createPageUrl('FirstFrame')} className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">
                          <div className="font-bold">3D Environments</div>
                          <div className="text-xs text-gray-500">Virtual production techniques</div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl('ApplyTeam')} className="text-sm font-medium hover:text-[#FFD700] transition-colors">
                  Jobs
                </Link>
                <Link to={createPageUrl('ApplyTeam')} className="text-sm font-medium hover:text-[#FFD700] transition-colors">
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
                  placeholder="Search productions, studios, creators, locations"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FFD700] transition-colors text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-white hover:text-[#FFD700] hover:bg-transparent">
                Log in
              </Button>
              <Button variant="ghost" size="sm" className="text-sm font-medium text-white hover:text-[#FFD700] hover:bg-transparent">
                Sign Up
              </Button>
              <Button size="sm" className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold px-4">
                Be Pro
              </Button>
              <Link to={createPageUrl('SubmitProject')}>
                <Button size="sm" className="bg-white hover:bg-gray-100 text-black font-bold">
                  Submit Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[72px] pb-24">
        {children}
      </main>

      {/* Bottom Floating Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-0 px-3 py-2.5">
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center justify-center px-3 py-2 hover:bg-white/5 rounded-lg transition-all mr-2"
            >
              <span className="text-lg font-black text-white tracking-tighter">22.</span>
            </Link>

            <div className="h-6 w-px bg-gray-700 mr-2" />

            {bottomNav.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    item.highlight 
                      ? 'bg-[#FFD700] text-black hover:bg-[#FFC700]' 
                      : isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
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
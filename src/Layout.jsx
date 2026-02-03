import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import TopBanner from './components/home/TopBanner';

export default function Layout({ children, currentPageName }) {
  const [editMode, setEditMode] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);

  const categoryInfo = {
    commercial: {
      title: 'Commercial',
      desc: 'Brand films, ads, campaigns.\nClear structure. Clear budgets.'
    },
    short: {
      title: 'Short Film',
      desc: 'Narrative driven.\nScript heavy. Small to mid crews.'
    },
    feature: {
      title: 'Feature Film',
      desc: 'Full production planning.\nCast, locations, long schedule.'
    },
    music: {
      title: 'Music Video',
      desc: 'Visual first.\nShort schedule. Strong art direction.'
    },
    documentary: {
      title: 'Documentary',
      desc: 'Real world.\nFlexible planning. Research focused.'
    }
  };

  const bottomNav = [
    { name: 'Projects', href: 'Projects' },
    { name: 'Creators', href: 'Creators' },
    { name: 'Teams', href: 'Teams' },
    { name: 'How It Works', href: 'Services' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#212121]">
      {/* Top Banner */}
      <TopBanner />

      {/* Main Header (Awwwards Style) */}
      <header className="fixed top-[40px] left-0 right-0 z-40 transition-colors bg-white border-b border-gray-200">
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
                <Link to={createPageUrl('Projects')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                  Projects
                </Link>
                <Link to={createPageUrl('Creators')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                  Creators
                </Link>
                <Link to={createPageUrl('Teams')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                  Teams
                </Link>
              </nav>
            </div>

            {/* Center Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="search" 
                  placeholder="Search Projects"
                  className="w-full pl-12 pr-4 py-3 text-base rounded-lg focus:outline-none transition-colors bg-gray-50 border border-gray-200 text-[#1a1a1a] placeholder:text-gray-500 focus:border-gray-400"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 hover:bg-transparent">
                Login
              </Button>
              <Link to={createPageUrl('ApplyArtist')}>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 hover:bg-transparent">
                  Join as Creator
                </Button>
              </Link>
              <Link to={createPageUrl('ApplyTeam')}>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 hover:bg-transparent">
                  Join as Team
                </Button>
              </Link>
              <Link to={createPageUrl('SubmitProject')}>
                <Button size="sm" className="bg-black text-white hover:bg-gray-800 font-bold">
                  Post a Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="pt-[100px] pb-24">
        {React.cloneElement(children, { editMode })}
      </main>

      {/* Bottom Floating Navigation */}
      <nav className="fixed bottom-6 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-[#3a3a3a] rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-0 px-2 md:px-3 py-2.5 overflow-x-auto scrollbar-hide">
            {currentPageName === 'Home' ? (
              <button
                onMouseDown={() => {
                  const timer = setTimeout(() => {
                    setEditMode(true);
                  }, 3000);
                  setPressTimer(timer);
                }}
                onMouseUp={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                onMouseLeave={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                onTouchStart={() => {
                  const timer = setTimeout(() => {
                    setEditMode(true);
                  }, 3000);
                  setPressTimer(timer);
                }}
                onTouchEnd={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                className={`flex items-center justify-center px-2 md:px-3 py-2 rounded-lg transition-all mr-1 md:mr-2 flex-shrink-0 ${
                  editMode ? 'bg-white text-black' : 'hover:bg-white/5 text-white'
                }`}
                title={editMode ? 'Edit Mode Active' : 'Hold for 3 seconds to edit'}
              >
                <span className="text-base md:text-lg font-black tracking-tighter">22.</span>
              </button>
            ) : (
              <Link 
                to={createPageUrl('Home')}
                className="flex items-center justify-center px-2 md:px-3 py-2 hover:bg-white/5 rounded-lg transition-all mr-1 md:mr-2 flex-shrink-0"
              >
                <span className="text-base md:text-lg font-black text-white tracking-tighter">22.</span>
              </Link>
            )}

            <div className="h-6 w-px bg-gray-600 mr-1 md:mr-2 flex-shrink-0" />

            {editMode && currentPageName === 'Home' && (
              <button
                onClick={() => setEditMode(false)}
                className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 bg-red-500 text-white hover:bg-red-600"
              >
                Exit Edit Mode
              </button>
            )}

            {bottomNav.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
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
                <li><Link to={createPageUrl('Services')} className="hover:text-white">About the Network</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">How It Works</Link></li>
                <li><Link to={createPageUrl('Home')} className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">For Clients</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('SubmitProject')} className="hover:text-white">Post a Project</Link></li>
                <li><Link to={createPageUrl('Home')} className="hover:text-white">Browse Projects</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">For Creators</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('ApplyArtist')} className="hover:text-white">Apply as Creator</Link></li>
                <li><Link to={createPageUrl('ApplyArtist')} className="hover:text-white">Creator Directory</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">Membership Plans</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">For Teams</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Apply as Team</Link></li>
                <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Team Directory</Link></li>
                <li><Link to={createPageUrl('Services')} className="hover:text-white">Partnership Options</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Showcase</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('Work')} className="hover:text-white">Featured Work</Link></li>
                <li><Link to={createPageUrl('Home')} className="hover:text-white">Success Stories</Link></li>
                <li><Link to={createPageUrl('Work')} className="hover:text-white">Project Gallery</Link></li>
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
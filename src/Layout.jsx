import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import AnimatedBanner from './components/home/AnimatedBanner';

export default function Layout({ children, currentPageName }) {
  const bottomNav = [
    { name: 'Nominees', href: 'Home' },
    { name: 'Projects', href: 'Work' },
    { name: 'Directory', href: 'Services' },
    { name: 'Artists', href: 'ApplyArtist' },
    { name: 'Teams', href: 'ApplyTeam' },
    { name: 'First Frame', href: 'FirstFrame' },
    { name: 'Submit Project', href: 'SubmitProject', highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#212121]">
      {/* Animated Top Banner */}
      <AnimatedBanner />

      {/* Minimal Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="hover:opacity-80 transition-opacity">
              <span className="text-3xl font-black tracking-tighter" style={{ color: '#1a1a1a' }}>
                22.
              </span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <input 
                type="search" 
                placeholder="Search by projects"
                className="hidden md:block w-64 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              />
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Log in
              </Button>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Sign Up
              </Button>
              <Button size="sm" className="bg-black hover:bg-gray-800 text-white font-medium px-4">
                Be Pro
              </Button>
              <Button size="sm" variant="outline" className="font-medium">
                Submit Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[104px] pb-24">
        {children}
      </main>

      {/* Bottom Floating Navigation (Exact Awwwards Style) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-0 px-3 py-2.5">
            {/* Logo Section */}
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center justify-center px-3 py-2 hover:bg-white/5 rounded-lg transition-all mr-2"
            >
              <span className="text-lg font-black text-white tracking-tighter">22.</span>
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-700 mr-2" />

            {/* Navigation Items */}
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
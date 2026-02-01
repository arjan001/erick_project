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
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="2" fill="#000000"/>
                <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Inter, sans-serif">
                  S
                </text>
              </svg>
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
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-[#2B2B2B] rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-1 px-2 py-2">
            {/* Logo Section */}
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center justify-center px-4 py-3 hover:bg-gray-700/50 rounded-xl transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="2" fill="#FFFFFF"/>
                <text x="12" y="17" textAnchor="middle" fill="#000" fontSize="14" fontWeight="900" fontFamily="Inter, sans-serif">
                  S
                </text>
              </svg>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-600" />

            {/* Navigation Items */}
            {bottomNav.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className={`px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    item.highlight 
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                      : isActive
                        ? 'text-white bg-gray-700/50'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
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
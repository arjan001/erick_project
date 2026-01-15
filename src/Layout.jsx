import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  Home, 
  Film, 
  Briefcase, 
  Award, 
  UserPlus, 
  Users, 
  Mail,
  Menu,
  X
} from 'lucide-react';
export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: 'Home', icon: Home },
    { name: 'Services', href: 'Services', icon: Briefcase },
    { name: 'First Frame', href: 'FirstFrame', icon: Award },
    { name: 'Work', href: 'Work', icon: Film },
    { name: 'Artist', href: 'ApplyArtist', icon: UserPlus },
    { name: 'Team', href: 'ApplyTeam', icon: Users },
    { name: 'Contact', href: 'Contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        :root {
          --studio-gold: #C9A962;
          --studio-black: #000000;
          --studio-white: #FFFFFF;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-24 lg:flex-col bg-white border-r border-gray-200 z-50">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center flex-shrink-0 mb-8">
            <Link to={createPageUrl('Home')} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-white">S22</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-normal transition-all rounded-lg ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-[10px] leading-tight text-center">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <span className="text-sm font-bold text-white">S22</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-black">Studio<span className="text-black">22</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-black"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 py-4 bg-white border-t border-gray-200 max-h-[80vh] overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => window.scrollTo(0, 0), 100);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all mb-1 ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:pl-24">
        <main className="pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
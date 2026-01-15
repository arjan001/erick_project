import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  Home, 
  Film, 
  Briefcase, 
  Award, 
  DollarSign, 
  Upload, 
  UserPlus, 
  Users, 
  Mail,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from './components/useTranslation';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggle from './components/ThemeToggle';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navigation = [
    { name: 'Services', href: 'Services', icon: Briefcase },
    { name: 'First Frame', href: 'FirstFrame', icon: Award },
    { name: 'Apply as Artist', href: 'ApplyArtist', icon: UserPlus },
    { name: 'Apply as Team', href: 'ApplyTeam', icon: Users },
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
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-20 hover:lg:w-72 lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 group z-50">
        <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-12">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">S22</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Studio<span className="text-black">22</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.href;
              return (
                <div key={item.name} className="relative group/navitem">
                  <Link
                    to={createPageUrl(item.href)}
                    onClick={() => window.scrollTo(0, 0)}
                    className={`flex items-center gap-3 px-4 py-4 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-400 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {item.name}
                    </span>
                  </Link>
                  {/* Tooltip - only shows when sidebar is NOT expanded */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-white text-black text-sm font-medium rounded-lg shadow-xl opacity-0 group-hover/navitem:opacity-100 group-hover:group-hover/navitem:opacity-0 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Theme Toggle & Language Selector */}
          <div className="px-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <LanguageSelector />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-sm flex items-center justify-center">
              <span className="text-sm font-bold text-white">S22</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Studio<span className="text-amber-600">22</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 py-4 bg-zinc-900 border-t border-zinc-800 max-h-[80vh] overflow-y-auto">
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
                      ? 'bg-amber-600 text-white'
                      : item.highlight
                      ? 'bg-zinc-800 text-amber-500 border border-amber-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
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
      <div className="lg:pl-20">
        <main className="pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
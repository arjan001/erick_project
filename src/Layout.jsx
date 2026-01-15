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
    { name: t('nav.home'), href: 'Home', icon: Home },
    { name: t('nav.work'), href: 'Work', icon: Film },
    { name: t('nav.services'), href: 'Services', icon: Briefcase },
    { name: t('nav.first_frame'), href: 'FirstFrame', icon: Award },
    { name: t('nav.pricing'), href: 'Pricing', icon: DollarSign },
    { name: t('nav.submit'), href: 'SubmitProject', icon: Upload, highlight: true },
    { name: t('nav.apply_artist'), href: 'ApplyArtist', icon: UserPlus },
    { name: t('nav.apply_team'), href: 'ApplyTeam', icon: Users },
    { name: t('nav.contact'), href: 'Contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <style>{`
        :root {
          --studio-gold: #C9A962;
          --studio-black: #000000;
          --studio-white: #FFFFFF;
        }
        body {
          background: #000000;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-20 hover:lg:w-72 lg:flex-col bg-black border-r border-white/10 transition-all duration-300 group z-50">
        <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-12">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-black">S22</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Studio<span className="text-white">22</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className={`flex items-center gap-3 px-4 py-4 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black'
                      : item.highlight
                      ? 'bg-white/10 text-white hover:bg-white hover:text-black border border-white/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Language Selector & Theme Toggle */}
          <div className="px-6 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-3">
            <LanguageSelector />
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
                  onClick={() => setMobileMenuOpen(false)}
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
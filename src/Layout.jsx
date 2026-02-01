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
  User,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const navigation = [
    { name: 'Explore', href: 'Home', icon: Home },
    { name: 'Directory', href: 'Services', icon: Users },
    { name: 'Projects', href: 'Work', icon: Film },
    { name: 'Artists', href: 'ApplyArtist', icon: UserPlus },
    { name: 'Teams', href: 'ApplyTeam', icon: Briefcase },
    { name: 'First Frame', href: 'FirstFrame', icon: Award },
    { name: 'Contact', href: 'Contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#212121]">
      {/* Minimal Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-lg font-bold text-white">S.</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Studio22</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-sm">
                Log in
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-sm">
                Sign Up
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                Be Pro
              </Button>
            </Link>
            <Link to={createPageUrl('SubmitProject')}>
              <Button size="sm" variant="outline">
                Submit Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-32">
        {children}
      </main>

      {/* Bottom Navigation Bar (Awwwards Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#2B2B2B] border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
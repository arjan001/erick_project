import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, FileText, Mail, Users, Gift, Bell, User, Settings,
  Home as HomeIcon, Search as SearchIcon
} from 'lucide-react';
import { createPageUrl } from '../utils';

const MENU_ITEMS = [
        { label: 'Find Work', icon: SearchIcon, href: 'Jobs' },
        { label: 'Job Board', icon: Briefcase, href: 'Jobs' },
        { label: 'Applications', icon: FileText, href: 'JobApplications' },
        { label: 'Invitations', icon: Mail, href: 'JobInvitations' },
        { label: 'Messages', icon: Mail, href: 'Messages' },
        { label: 'Network', icon: Users, href: 'ArtistDashboard' },
        { label: 'Invites & Rewards', icon: Gift, href: 'ArtistDashboard' },
        { label: 'Notifications', icon: Bell, href: 'ArtistDashboard' },
        { label: 'My Profile', icon: User, href: 'ArtistProfile' },
        { label: 'Settings', icon: Settings, href: 'ArtistDashboard' }
      ];

export default function ArtistSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-black text-white p-6 flex flex-col">
      {/* Logo */}
      <Link to={createPageUrl('Home')} className="mb-12 flex items-center gap-2">
        <span className="text-2xl font-black">N</span>
        <span className="text-xs font-bold uppercase tracking-wider">pro</span>
      </Link>

      {/* Menu */}
      <nav className="flex-1 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={createPageUrl(item.href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Bottom */}
      <div className="border-t border-white/10 pt-4">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">A</span>
          </div>
          <div className="text-left text-sm">
            <div className="font-medium text-white">Artist</div>
            <div className="text-xs text-gray-500">artist@artist.com</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
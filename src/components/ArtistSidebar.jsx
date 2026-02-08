import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Briefcase, FileText, Mail, Users, Gift, Bell, User, Settings,
  Home as HomeIcon, ChevronRight
} from 'lucide-react';
import { createPageUrl } from '../utils';

const MENU_ITEMS = [
  { label: 'Find Work', icon: Search, href: 'Jobs', showIcon: true },
  { label: 'Job Board', icon: Briefcase, href: 'Jobs', showIcon: true },
  { label: 'Applications', icon: FileText, href: 'JobApplications', showIcon: true },
  { label: 'Messages', icon: Mail, href: 'Messages', showIcon: true },
  { label: 'My Profile', icon: User, href: 'ArtistProfile', showIcon: true },
  { label: 'Settings', icon: Settings, href: 'ArtistDashboard', showIcon: true }
];

export default function ArtistSidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studio22_user');
    window.location.href = createPageUrl('Home');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#F8F8F8] border-r border-gray-200 flex flex-col transition-all duration-300 z-[45] shadow-xl ${
        expanded ? 'w-64' : 'w-20'
      } ${expanded ? 'md:w-64' : 'md:w-20 w-16'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <Link to={createPageUrl('ArtistDashboard')} className="h-20 flex items-center justify-center border-b border-gray-200 hover:bg-gray-100 transition-colors">
        <span className={`font-black text-gray-900 transition-all ${expanded ? 'text-2xl' : 'text-lg'}`}>
          {expanded ? '22.' : '22.'}
        </span>
      </Link>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.href.toLowerCase());
          return (
            <Link
              key={item.href}
              to={createPageUrl(item.href)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              title={!expanded ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Bottom */}
      <div className="border-t border-gray-200 p-2">
        <button className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-200 transition-all ${expanded ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          {expanded && (
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{user?.full_name || 'Artist'}</div>
              <div className="text-xs text-gray-600 truncate">{user?.email || 'artist@artist.com'}</div>
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 text-red-600 transition-all text-sm font-medium mt-2 ${expanded ? '' : 'justify-center'}`}
          title="Logout"
        >
          <span className="text-lg">⌗</span>
          {expanded && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Plus, FileText, Mail, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';

const MENU_ITEMS = [
  { label: 'My Projects', icon: Briefcase, href: 'ClientDashboard' },
  { label: 'Post Project', icon: Plus, href: 'ClientPostProject' },
  { label: 'Applications', icon: FileText, href: 'ClientApplications' },
  { label: 'Messages', icon: Mail, href: 'ClientMessages' },
  { label: 'Analytics', icon: BarChart3, href: 'ClientAnalytics' },
  { label: 'Settings', icon: Settings, href: 'ClientSettings' }
];

export default function ClientSidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const { setSidebarExpanded } = useSidebar();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    setSidebarExpanded(next);
  };

  const handleLogout = () => {
    localStorage.removeItem('studio22_user');
    window.location.href = '/';
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#F8F8F8] border-r-2 border-gray-200 flex flex-col transition-all duration-300 z-40 ${
        expanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200">
        <Link to={createPageUrl('ClientDashboard')} className="font-black text-gray-900 text-xl">
          22.
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase().includes(item.href.toLowerCase());
          return (
            <Link
              key={item.href}
              to={createPageUrl(item.href)}
              title={!expanded ? item.label : ''}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${expanded ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {user?.full_name?.charAt(0) || 'C'}
          </div>
          {expanded && (
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{user?.full_name || 'Client'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium ${expanded ? '' : 'justify-center'}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {expanded && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
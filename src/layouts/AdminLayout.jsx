import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Users, FolderKanban, LayoutDashboard, Shield, FileText, Database, Image, Mail, CreditCard, DollarSign, ChevronLeft, ChevronRight, Menu, X, Bell, Settings, Search, ScrollText, Grid3x3, Star, Trophy, Clock, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { path: '/Admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/Admin/UserManagement', label: 'System Admin Users', icon: Users },
  { path: '/Admin/RolesPermissions', label: 'Roles & Permissions', icon: Shield },
  { path: '/Admin/Invites', label: 'Invites', icon: Mail },
  { path: '/Admin/Clients', label: 'Clients', icon: Users },
  { path: '/Admin/Artists', label: 'Artists', icon: Users },
  { path: '/Admin/Teams', label: 'Teams', icon: FolderKanban },
  { path: '/Admin/Backers', label: 'Backers', icon: DollarSign },
  { path: '/Admin/Projects', label: 'Projects', icon: FolderKanban },
  { path: '/Admin/Jobs', label: 'Jobs', icon: FileText },
  { path: '/Admin/Categories', label: 'Categories', icon: Grid3x3 },
  { path: '/Admin/Ticker', label: 'Marquee / Ticker', icon: ScrollText },
  { path: '/Admin/Messages', label: 'Messages', icon: Mail },
  { path: '/Admin/Notifications', label: 'Notifications', icon: Bell },
  { path: '/Admin/SEOCMS', label: 'SEO & CMS', icon: FileText },
  { path: '/Admin/ImageStorage', label: 'Image Storage', icon: Image },
  { path: '/Admin/LoginProviders', label: 'Login Providers', icon: Shield },
  { path: '/Admin/APISettings', label: 'API Settings', icon: Database },
  { path: '/Admin/PaymentSettings', label: 'Payment Settings', icon: CreditCard },
  { path: '/Admin/GeneralSettings', label: 'General Settings', icon: Settings },
  { path: '/Admin/Analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  { path: '/Admin/FinanceDashboard', label: 'Finance Dashboard', icon: DollarSign },
  { path: '/Admin/AuditLogs', label: 'Audit Logs', icon: FileText },
  { path: '/Admin/FeaturedWork', label: 'Featured Work', icon: Star },
  { path: '/Admin/SuccessStories', label: 'Success Stories', icon: Trophy },
  { path: '/Admin/RecentProjects', label: 'Recent Projects', icon: Clock },
];

const navGroups = [
  { label: 'Main', items: ['/Admin'] },
  { label: 'User Management', items: ['/Admin/UserManagement', '/Admin/RolesPermissions', '/Admin/Invites'] },
  { label: 'Content Management', items: ['/Admin/Clients', '/Admin/Artists', '/Admin/Teams', '/Admin/Backers', '/Admin/Projects', '/Admin/Jobs', '/Admin/Categories', '/Admin/Ticker'] },
  { label: 'Communication', items: ['/Admin/Messages', '/Admin/Notifications'] },
  { label: 'Integrations', items: ['/Admin/SEOCMS', '/Admin/ImageStorage', '/Admin/LoginProviders', '/Admin/APISettings', '/Admin/PaymentSettings'] },
  { label: 'System', items: ['/Admin/GeneralSettings', '/Admin/Analytics', '/Admin/FinanceDashboard', '/Admin/AuditLogs', '/Admin/FeaturedWork', '/Admin/SuccessStories', '/Admin/RecentProjects'] },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const isActive = (path, exact) => exact
    ? location.pathname === path
    : location.pathname === path || location.pathname.startsWith(path + '/');

  const getNavItem = (path) => navItems.find(n => n.path === path);

  const toggleGroup = (groupLabel) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }));
  };

  // Auto-expand group containing current path
  useEffect(() => {
    navGroups.forEach(group => {
      const hasActivePath = group.items.some(path => {
        const item = getNavItem(path);
        return item && isActive(path, item.exact);
      });
      if (hasActivePath) {
        setExpandedGroups(prev => ({ ...prev, [group.label]: true }));
      }
    });
  }, [location.pathname]);

  // Filter nav items based on search
  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(path => {
      const item = getNavItem(path);
      if (!item) return false;
      return item.label.toLowerCase().includes(searchQuery.toLowerCase());
    })
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-100 shadow-[2px_0_12px_rgba(0,0,0,0.03)] flex flex-col transition-all duration-300 z-50 flex-shrink-0 fixed h-screen`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm tracking-tighter">22</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-black transition-colors text-gray-400"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* User Profile - hide when collapsed */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => navigate('/Admin/UserManagement')}
              className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-semibold text-gray-800 truncate">{user?.full_name || 'Admin'}</div>
                <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
              </div>
            </button>
          </div>
        )}

        {/* Search Bar - hide when collapsed */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {sidebarOpen ? (
            // Expanded state - show section headers with items
            filteredNavGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((path) => {
                    const item = getNavItem(path);
                    if (!item) return null;
                    const Icon = item.icon;
                    const active = isActive(path, item.exact);
                    return (
                      <Link
                        key={path}
                        to={path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          active
                            ? 'bg-indigo-100 text-indigo-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Collapsed state - show icons only with tooltips
            navItems.map((item) => {
              const active = isActive(item.path, item.exact);
              const Icon = item.icon;
              return (
                <div key={item.path} className="relative group mb-2">
                  <Link
                    to={item.path}
                    className={`flex items-center justify-center w-full p-2 rounded-lg transition-all ${
                      active
                        ? 'bg-gray-900 text-white font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99999] pointer-events-none">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              );
            })
          )}
          {sidebarOpen && filteredNavGroups.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No modules found
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-2 space-y-1">
          {sidebarOpen ? (
            <button
              onClick={() => logout(true)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <div className="relative group">
              <button
                onClick={() => logout(true)}
                className="flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99999] pointer-events-none">
                Logout
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:mx-[17.5625rem]' : 'lg:mx-[5.5625rem]'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 flex-shrink-0"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div className="text-sm font-semibold text-gray-700">
                {navItems.find(n => isActive(n.path, n.exact))?.label || 'Admin Panel'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors relative">
                <Bell className="w-4 h-4" />
              </button>
              <Link to="/" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                ← Back to site
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
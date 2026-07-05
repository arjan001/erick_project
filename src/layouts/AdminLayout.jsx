import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Users, FolderKanban, LayoutDashboard, Shield, FileText, Database, Image, Mail, CreditCard, DollarSign, ChevronRight, Menu, X, Bell, Settings, Search, ScrollText, Grid3x3, Star, Trophy, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { path: '/Admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/Admin/Artists', label: 'Artists', icon: Users },
  { path: '/ArtistAdmin', label: 'Creators', icon: Users },
  { path: '/TeamAdmin', label: 'Teams', icon: FolderKanban },
  { path: '/ProjectAdmin', label: 'Projects', icon: FolderKanban },
  { path: '/Admin/UserManagement', label: 'Users', icon: Users },
  { path: '/Admin/RolesPermissions', label: 'Roles & Permissions', icon: Shield },
  { path: '/Admin/Invites', label: 'Invites', icon: Mail },
  { path: '/Admin/AuditLogs', label: 'Audit Logs', icon: FileText },
  { path: '/Admin/Settings', label: 'Settings', icon: Settings },
  { path: '/Admin/Ticker', label: 'Marquee/Ticker', icon: ScrollText },
  { path: '/Admin/Categories', label: 'Categories', icon: Grid3x3 },
  { path: '/Admin/FeaturedWork', label: 'Featured Work', icon: Star },
  { path: '/Admin/SuccessStories', label: 'Success Stories', icon: Trophy },
  { path: '/Admin/RecentProjects', label: 'Recent Projects', icon: Clock },
  { path: '/Admin/SEOCMS', label: 'SEO & CMS', icon: FileText },
  { path: '/Admin/ImageStorage', label: 'Image Storage', icon: Image },
  { path: '/Admin/LoginProviders', label: 'Login Providers', icon: Shield },
  { path: '/Admin/APISettings', label: 'API Settings', icon: Database },
  { path: '/Admin/PaymentSettings', label: 'Payment Settings', icon: CreditCard },
  { path: '/Admin/FinanceDashboard', label: 'Finance', icon: DollarSign },
  { path: '/Admin/Subscriptions', label: 'Subscription Plans', icon: CreditCard },
];

const navGroups = [
  { label: 'Overview', items: ['/Admin', '/Admin/Artists', '/ArtistAdmin', '/TeamAdmin', '/ProjectAdmin'] },
  { label: 'Content', items: ['/Admin/Ticker', '/Admin/Categories', '/Admin/FeaturedWork', '/Admin/SuccessStories', '/Admin/RecentProjects', '/Admin/SEOCMS'] },
  { label: 'Users', items: ['/Admin/UserManagement', '/Admin/RolesPermissions', '/Admin/Invites'] },
  { label: 'Finance', items: ['/Admin/FinanceDashboard', '/Admin/Subscriptions'] },
  { label: 'Integrations', items: ['/Admin/LoginProviders', '/Admin/APISettings', '/Admin/PaymentSettings'] },
  { label: 'System', items: ['/Admin/Settings', '/Admin/ImageStorage', '/Admin/AuditLogs'] },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path, exact) => exact
    ? location.pathname === path
    : location.pathname === path || location.pathname.startsWith(path + '/');

  const getNavItem = (path) => navItems.find(n => n.path === path);

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
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} bg-white flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col h-screen sticky top-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm tracking-tighter">22</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">Studio22</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Admin</div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{user?.full_name || 'Admin'}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {filteredNavGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group.label}</div>
              {group.items.map((path) => {
                const item = getNavItem(path);
                if (!item) return null;
                const Icon = item.icon;
                const active = isActive(path, item.exact);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                      active
                        ? 'bg-black text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </div>
          ))}
          {filteredNavGroups.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No modules found
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => logout(true)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 flex-shrink-0"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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
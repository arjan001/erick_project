import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { LogOut, Settings, Users, FolderKanban, LayoutDashboard, Shield, FileText, Database, Image, Mail, CreditCard, DollarSign, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const adminSections = [
  {
    category: 'Main',
    items: [
      { path: '/Admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/ArtistAdmin', label: 'Creators', icon: Users },
      { path: '/TeamAdmin', label: 'Teams', icon: FolderKanban },
      { path: '/ProjectAdmin', label: 'Projects', icon: FolderKanban },
    ]
  },
  {
    category: 'User Management',
    items: [
      { path: '/Admin/Users', label: 'Users', icon: Users },
      { path: '/Admin/Roles', label: 'Roles & Permissions', icon: Shield },
      { path: '/Admin/Invites', label: 'Invites', icon: Mail },
    ]
  },
  {
    category: 'System',
    items: [
      { path: '/Admin/AuditLogs', label: 'Audit Logs', icon: FileText },
      { path: '/Admin/Settings', label: 'General Settings', icon: Settings },
    ]
  },
  {
    category: 'Content',
    items: [
      { path: '/Admin/SEO', label: 'SEO & CMS', icon: FileText },
      { path: '/Admin/Storage', label: 'Image Storage', icon: Image },
    ]
  },
  {
    category: 'Integrations',
    items: [
      { path: '/Admin/AuthProviders', label: 'Login Providers', icon: Shield },
      { path: '/Admin/API', label: 'API Settings', icon: Database },
      { path: '/Admin/Payment', label: 'Payment Settings', icon: CreditCard },
    ]
  },
  {
    category: 'Finance',
    items: [
      { path: '/Admin/Finance', label: 'Finance Dashboard', icon: DollarSign },
    ]
  }
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <Link to="/" className="text-2xl font-black tracking-tighter text-black">
              22.
            </Link>
            <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {adminSections.map((section) => (
              <div key={section.category} className="mb-4">
                <button
                  onClick={() => toggleCategory(section.category)}
                  className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
                >
                  {section.category}
                  {expandedCategories[section.category] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedCategories[section.category] && (
                  <div className="mt-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2 text-sm ${
                            isActive(item.path)
                              ? 'bg-black text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 truncate">{user?.email}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="w-full mt-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

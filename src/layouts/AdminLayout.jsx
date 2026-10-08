import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Users, FolderKanban, LayoutDashboard, Shield, FileText, Database, Image, Mail, CreditCard, DollarSign, ChevronLeft, ChevronRight, Menu, X, Bell, Settings, Search, ScrollText, Grid3x3, Star, Trophy, Clock, BarChart3, AlertTriangle, ShoppingBag, Upload, UserCheck } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

const navItems = [
  { path: '/Admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/Admin/UserManagement', label: 'System Admin Users', icon: Users },
  { path: '/Admin/RolesPermissions', label: 'Roles & Permissions', icon: Shield },
  { path: '/Admin/Invites', label: 'Invites', icon: Mail },
  { path: '/Admin/Clients', label: 'Clients', icon: Users },
  { path: '/Admin/Artists', label: 'Creators', icon: Users },
  { path: '/Admin/Projects', label: 'Projects', icon: FolderKanban },
  { path: '/Admin/Jobs', label: 'Jobs', icon: FileText },
  { path: '/Admin/FeaturedWork', label: 'Featured Jobs', icon: Star },
  { path: '/Admin/Categories', label: 'Categories', icon: Grid3x3 },
  { path: '/Admin/Ticker', label: 'Marquee / Ticker', icon: ScrollText },
  { path: '/Admin/Products', label: 'Products', icon: ShoppingBag },
  { path: '/Admin/Orders', label: 'Orders', icon: ShoppingBag },
  { path: '/Admin/CardPayments', label: 'Cards', icon: CreditCard },
  { path: '/Admin/ShopSettings', label: 'Shop Settings', icon: Settings },
  { path: '/Admin/Partners', label: 'Partners', icon: Trophy },
  { path: '/Admin/Articles', label: 'Articles & Blogs', icon: FileText },
  { path: '/Admin/Newsletter', label: 'Newsletter', icon: Mail },
  { path: '/Admin/MailingList', label: 'Mailing List', icon: Mail },
  { path: '/Admin/Messages', label: 'Messages', icon: Mail },
  { path: '/Admin/CMS', label: 'CMS — Page Content', icon: FileText },
  { path: '/Admin/SEOCMS', label: 'SEO & CMS', icon: FileText },
  { path: '/Admin/ImageStorage', label: 'Image Storage', icon: Image },
  { path: '/Admin/LoginProviders', label: 'Login Providers', icon: Shield },
  { path: '/Admin/AuthProviders', label: 'Auth Providers', icon: UserCheck },
  { path: '/Admin/FileUploadSettings', label: 'File Upload Settings', icon: Upload },
  { path: '/Admin/APISettings', label: 'API Settings', icon: Database },
  { path: '/Admin/PaymentSettings', label: 'Payment Settings', icon: CreditCard },
  { path: '/Admin/GeneralSettings', label: 'General Settings', icon: Settings },
  { path: '/Admin/Analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  { path: '/Admin/FinanceDashboard', label: 'Finance Dashboard', icon: DollarSign },
  { path: '/Admin/AuditLogs', label: 'Audit Logs', icon: FileText },
  { path: '/Admin/SuccessStories', label: 'Success Stories', icon: Trophy },
  { path: '/Admin/RecentProjects', label: 'Recent Projects', icon: Clock },
]

const navGroups = [
  { label: 'Main', items: ['/Admin'] },
  { label: 'User Management', items: ['/Admin/UserManagement', '/Admin/RolesPermissions', '/Admin/Invites'] },
  { label: 'Content Management', items: ['/Admin/Clients', '/Admin/Artists', '/Admin/Projects', '/Admin/Jobs', '/Admin/FeaturedWork', '/Admin/Categories', '/Admin/Ticker'] },
  { label: 'Shop', items: ['/Admin/Products', '/Admin/Orders', '/Admin/CardPayments', '/Admin/ShopSettings', '/Admin/Partners'] },
  { label: 'Content & Communication', items: ['/Admin/Articles', '/Admin/Newsletter', '/Admin/MailingList', '/Admin/Messages', '/Admin/CMS'] },
  { label: 'Integrations', items: ['/Admin/SEOCMS', '/Admin/ImageStorage', '/Admin/LoginProviders', '/Admin/APISettings', '/Admin/PaymentSettings'] },
  { label: 'System', items: ['/Admin/GeneralSettings', '/Admin/Analytics', '/Admin/FinanceDashboard', '/Admin/AuditLogs', '/Admin/SuccessStories', '/Admin/RecentProjects'] },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [searchQuery, setSearchQuery] = useState('')

  const isActive = (path, exact) => exact
    ? location.pathname === path
    : location.pathname === path || location.pathname.startsWith(path + '/')

  const getNavItem = (path) => navItems.find(n => n.path === path)

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(path => {
      const item = getNavItem(path)
      if (!item) return false
      return item.label.toLowerCase().includes(searchQuery.toLowerCase())
    })
  })).filter(group => group.items.length > 0)

  const sidebarWidth = collapsed ? 'w-16' : 'w-64'

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-white border-r border-gray-100 shadow-[2px_0_12px_rgba(0,0,0,0.03)] flex flex-col z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm tracking-tighter">SG</span>
            </div>
            {!collapsed && (
              <span className="text-sm font-bold text-gray-900">SmartGigs Admin</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        {!collapsed && (
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

        {/* Search */}
        {!collapsed && (
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
          {collapsed ? (
            navItems.map((item) => {
              const active = isActive(item.path, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center w-full p-2 rounded-lg transition-all mb-2 ${active
                    ? 'bg-gray-900 text-white font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </Link>
              )
            })
          ) : (
            filteredNavGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((path) => {
                    const item = getNavItem(path)
                    if (!item) return null
                    const Icon = item.icon
                    const active = isActive(path, item.exact)
                    return (
                      <Link
                        key={path}
                        to={path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active
                          ? 'bg-indigo-100 text-indigo-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          {!collapsed && filteredNavGroups.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No modules found
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-2">
          {collapsed ? (
            <button
              onClick={() => logout(true)}
              className="flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => logout(true)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex-shrink-0"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-sm font-semibold text-gray-700 truncate">
                {navItems.find(n => isActive(n.path, n.exact))?.label || 'Admin Panel'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors relative">
                <Bell className="w-4 h-4" />
              </button>
              <Link to="/" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                ← Back to site
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

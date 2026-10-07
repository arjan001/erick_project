import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Home, Search, Briefcase, FileText, Mail, User,
  Network, Bell, Wallet, Users, Star, Settings, Menu, X, ChevronLeft, ChevronRight,
  Shield, CreditCard, DollarSign, BarChart3, Clock
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Notification, Artist, Connection } from '@/lib/supabaseEntities';

// Navigation configuration for different user roles
const roleNavConfig = {
  creator: {
    label: 'Creator Dashboard',
    logoInitials: 'SG',
    navGroups: [
      {
        label: 'Main',
        items: [
          { path: '/artistdashboard', label: 'Dashboard', icon: Home },
          { path: '/Jobs', label: 'Find Work', icon: Search },
        ]
      },
      {
        label: 'Work',
        items: [
          { path: '/JobApplications', label: 'Applications', icon: Briefcase },
          { path: '/JobBoard', label: 'Projects from Clients', icon: FileText },
        ]
      },
      {
        label: 'Communication',
        items: [
          { path: '/Messages', label: 'Messages', icon: Mail, showBadge: true },
          { path: '/Network', label: 'Network', icon: Network, showConnectionBadge: true },
          { path: '/Notifications', label: 'Notifications', icon: Bell, showNotificationBadge: true },
        ]
      },
      {
        label: 'Finance',
        items: [
          { path: '/ArtistFinance', label: 'Finances', icon: Wallet },
        ]
      },
      {
        label: 'Account',
        items: [
          { path: '/ArtistProfile', label: 'My Profile & Settings', icon: User },
        ]
      },
    ]
  },
  team: {
    label: 'Team Dashboard',
    logoInitials: 'SG',
    navGroups: [
      {
        label: 'Main',
        items: [
          { path: '/teamdashboard', label: 'Dashboard', icon: Home },
          { path: '/Jobs', label: 'Find Work', icon: Search },
        ]
      },
      {
        label: 'Work',
        items: [
          { path: '/TeamProjects', label: 'Our Projects', icon: Briefcase },
          { path: '/TeamMembers', label: 'Team Members', icon: Users },
        ]
      },
      {
        label: 'Communication',
        items: [
          { path: '/TeamMessages', label: 'Messages', icon: Mail, showBadge: true },
          { path: '/Notifications', label: 'Notifications', icon: Bell, showNotificationBadge: true },
        ]
      },
      {
        label: 'Finance',
        items: [
          { path: '/TeamPayments', label: 'Payments', icon: Wallet },
        ]
      },
      {
        label: 'Account',
        items: [
          { path: '/TeamProfile', label: 'Team Profile & Settings', icon: User },
          { path: '/SupportTickets', label: 'Support Tickets', icon: Users },
        ]
      },
    ]
  },
  client: {
    label: 'Client Dashboard',
    logoInitials: 'SG',
    navGroups: [
      {
        label: 'Main',
        items: [
          { path: '/clientdashboard', label: 'Dashboard', icon: Home },
          { path: '/ClientPostProject', label: 'Post a Job', icon: Briefcase },
        ]
      },
      {
        label: 'Talent',
        items: [
          { path: '/BrowseTalent', label: 'Browse Talent', icon: Search },
          { path: '/SavedTalent', label: 'Saved Talent', icon: Star },
        ]
      },
      {
        label: 'Communication',
        items: [
          { path: '/ClientMessages', label: 'Messages', icon: Mail, showBadge: true },
          { path: '/ClientNotifications', label: 'Notifications', icon: Bell, showNotificationBadge: true },
        ]
      },
      {
        label: 'Projects',
        items: [
          { path: '/ClientProjects', label: 'Our Projects', icon: Briefcase },
          { path: '/ClientApplications', label: 'Applications', icon: FileText },
        ]
      },
      {
        label: 'Account',
        items: [
          { path: '/ClientProfile', label: 'Profile & Settings', icon: User },
        ]
      },
    ]
  },
  backer: {
    label: 'Backer Dashboard',
    logoInitials: 'SG',
    navGroups: [
      {
        label: 'Main',
        items: [
          { path: '/backerdashboard', label: 'Dashboard', icon: Home },
        ]
      },
      {
        label: 'Investments',
        items: [
          { path: '/BackerProjects', label: 'My Investments', icon: DollarSign },
          { path: '/BackerInvestments', label: 'Investment Portfolio', icon: Wallet },
          { path: '/BackerDeals', label: 'Investment Deals', icon: CreditCard },
          { path: '/BackerAnalytics', label: 'Analytics', icon: BarChart3 },
        ]
      },
      {
        label: 'Financial',
        items: [
          { path: '/BackerBanking', label: 'Banking', icon: CreditCard },
          { path: '/BackerInvestmentTiers', label: 'Investment Tiers', icon: DollarSign },
        ]
      },
      {
        label: 'Communication',
        items: [
          { path: '/Messages', label: 'Messages', icon: Mail, showBadge: true },
          { path: '/Notifications', label: 'Notifications', icon: Bell, showNotificationBadge: true },
          { path: '/SupportTickets', label: 'Support Tickets', icon: Users },
        ]
      },
      {
        label: 'Account',
        items: [
          { path: '/BackerProfile', label: 'Profile & Settings', icon: User },
          { path: '/BackerPartners', label: 'Partners', icon: Users },
          { path: '/BackerProjectUpdates', label: 'Project Updates', icon: Bell },
        ]
      },
    ]
  },
};

export default function UnifiedSidebar({ role = 'creator', mobileSidebarOpen, setMobileSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('smartgigs_sidebar_collapsed') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const config = roleNavConfig[role] || roleNavConfig.creator;
  const allNavItems = config.navGroups.flatMap(g => g.items);

  const handleCollapseToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('smartgigs_sidebar_collapsed', String(newState));
    // Emit event for DashboardLayout
    window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: { collapsed: newState } }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Fetch notification counts
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        setUnreadCount(0);
      } catch {
        setUnreadCount(0);
      }
    };

    const fetchPendingConnections = async () => {
      try {
        const connections = await Connection.filter({
          recipient_email: user.email,
          status: 'pending'
        }, '-created_date', 50);
        setPendingConnections((connections || []).length);
      } catch {
        setPendingConnections(0);
      }
    };

    const fetchNotifications = async () => {
      try {
        const notifs = await Notification.filter({ recipient_email: user.email });
        setNotificationCount((notifs || []).filter(n => !n.read).length);
      } catch {
        setNotificationCount(0);
      }
    };

    fetchUnread();
    fetchPendingConnections();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchUnread();
      fetchPendingConnections();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileSidebarOpen && setMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, mobileSidebarOpen, setMobileSidebarOpen]);

  const filteredNavGroups = config.navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';
  const isOpen = mobileSidebarOpen || false;

  return (
    <aside className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-white border-r border-gray-100 shadow-[2px_0_12px_rgba(0,0,0,0.03)] flex flex-col z-50 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm tracking-tighter">{config.logoInitials}</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-gray-900">{config.label}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCollapseToggle}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen && setMobileSidebarOpen(false)}
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
            onClick={() => navigate(config.navGroups[config.navGroups.length - 1].items[config.navGroups[config.navGroups.length - 1].items.length - 1].path)}
            className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-semibold text-gray-800 truncate">{user?.full_name || 'User'}</div>
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
          allNavItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
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
            );
          })
        ) : (
          filteredNavGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  const badgeCount = item.showBadge ? unreadCount :
                    item.showConnectionBadge ? pendingConnections :
                      item.showNotificationBadge ? notificationCount : 0;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                    </Link>
                  );
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
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DollarSign, Film, TrendingUp, User, Briefcase, BarChart3,
  CreditCard, Users, Layers, Bell, LogOut, ChevronLeft, ChevronRight, Share2, MessageSquare
} from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { Message, Notification } from '@/lib/supabaseEntities';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: DollarSign, href: 'BackerDashboard' },
  { label: 'Browse Projects', icon: Film, href: 'BackerProjects' },
  { label: 'Investments', icon: TrendingUp, href: 'BackerInvestments' },
  { label: 'Deals', icon: Briefcase, href: 'BackerDeals' },
  { label: 'Messages', icon: MessageSquare, href: 'Messages', showBadge: true },
  { label: 'Network', icon: Share2, href: 'Network' },
  { label: 'Analytics', icon: BarChart3, href: 'BackerAnalytics' },
  { label: 'Banking', icon: CreditCard, href: 'BackerBanking' },
  { label: 'Partners', icon: Users, href: 'BackerPartners' },
  { label: 'Investment Tiers', icon: Layers, href: 'BackerInvestmentTiers' },
  { label: 'Project Updates', icon: Bell, href: 'BackerProjectUpdates', showNotificationBadge: true },
  { label: 'Profile & Settings', icon: User, href: 'BackerProfile' }
];

export default function BackerSidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const { sidebarExpanded: expanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen } = useSidebar();
  const { logout } = useAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    let unsubscribe;

    const fetchUnreadMessages = async () => {
      try {
        // Messages table uses is_read, not read
        const msgs = await Message.filter({ recipient_email: user.email, is_read: false }, '-created_date', 50);
        setUnreadMessageCount((msgs || []).length);
      } catch {
        setUnreadMessageCount(0);
      }
    };

    const fetchUnreadNotifications = async () => {
      try {
        const notifs = await Notification.filter({ recipient_email: user.email });
        setUnreadNotificationCount((notifs || []).filter(n => !n.read).length);
      } catch {
        setUnreadNotificationCount(0);
      }
    };

    fetchUnreadMessages();
    fetchUnreadNotifications();

    (async () => {
      unsubscribe = Message.subscribe((event) => {
        if (event.data?.recipient_email === user.email) fetchUnreadMessages();
      });
    })();

    (async () => {
      const notifUnsubscribe = Notification.subscribe((event) => {
        if (event.data?.recipient_email === user.email) fetchUnreadNotifications();
      });
      return () => {
        unsubscribe && unsubscribe();
        notifUnsubscribe && notifUnsubscribe();
      };
    })();

    return () => unsubscribe && unsubscribe();
  }, [user]);

  const toggle = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarExpanded(!expanded);
    }
  };

  const handleLogout = () => { logout(true); };

  return (
    <aside
      className={`h-full bg-white shadow-[2px_0_12px_rgba(0,0,0,0.03)] flex flex-col transition-all duration-300 z-50 flex-shrink-0 fixed lg:relative ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${expanded ? 'w-64' : 'w-20'}`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100">
        <Link to="/" className="font-black text-xl bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          22.
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-gray-400"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase().includes(item.href.toLowerCase());
          return (
            <Link
              key={item.href}
              to={createPageUrl(item.href)}
              title={!expanded ? item.label : ''}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              {item.showBadge && unreadMessageCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
              {item.showNotificationBadge && unreadNotificationCount > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${expanded ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-indigo-100 ring-2 ring-indigo-50 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-indigo-700">
            {user?.full_name?.charAt(0) || 'B'}
          </div>
          {expanded && (
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{user?.full_name || 'Backer'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium ${expanded ? '' : 'justify-center'}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {expanded && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
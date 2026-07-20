import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DollarSign, Film, TrendingUp, User, Briefcase, BarChart3,
  CreditCard, Users, Layers, Bell, LogOut, ChevronLeft, ChevronRight, Share2, MessageSquare, Ticket
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
  { label: 'Support Tickets', icon: Ticket, href: 'SupportTickets' },
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
        const msgs = await Message.filter({ recipient_email: user.email, is_read: false }, '-created_at', 50);
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
        <Link to="/" className="font-black text-xl text-black">
          22
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-black transition-colors text-gray-400"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase().includes(item.href.toLowerCase());
          
          if (!expanded) {
            return (
              <div key={item.href} className="relative group">
                <Link
                  to={createPageUrl(item.href)}
                  className={`flex items-center justify-center w-full p-2 rounded-lg transition-all ${
                    isActive ? 'bg-gray-100 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </Link>
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={createPageUrl(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-gray-100 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap flex-1 text-left">{item.label}</span>
              {item.showBadge && unreadMessageCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
              {item.showNotificationBadge && unreadNotificationCount > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-1">
        {!expanded ? (
          <div className="relative group">
            <div className="flex items-center justify-center w-full p-2 rounded-xl">
              <div className="w-8 h-8 bg-gray-100 ring-2 ring-gray-50 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-700">
                {user?.full_name?.charAt(0) || 'B'}
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              {user?.full_name || 'Backer'}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 bg-gray-100 ring-2 ring-gray-50 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {user?.full_name?.charAt(0) || 'B'}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{user?.full_name || 'Backer'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
        )}
        {!expanded ? (
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              Logout
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
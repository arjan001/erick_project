import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Briefcase, FileText, Mail, User,
  Home as HomeIcon, Network, ChevronLeft, ChevronRight, LogOut, Wallet, Bell
} from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { Notification } from '@/lib/supabaseEntities';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: HomeIcon, href: 'artistdashboard' },
  { label: 'Find Work', icon: Search, href: 'Jobs' },
  { label: 'Projects from Clients', icon: Briefcase, href: 'JobBoard' },
  // { label: 'Applications', icon: FileText, href: 'JobApplications' }, // Hidden for now
  { label: 'Messages', icon: Mail, href: 'Messages', showBadge: true },
  { label: 'Network', icon: Network, href: 'Network', showConnectionBadge: true },
  { label: 'Notifications', icon: Bell, href: 'Notifications', showNotificationBadge: true },
  { label: 'Finances', icon: Wallet, href: 'ArtistFinance' },
  { label: 'My Profile & Settings', icon: User, href: 'ArtistProfile' }
];

export default function ArtistSidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const { sidebarExpanded: expanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen } = useSidebar();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let unsubscribe;
    const fetchUnread = async () => {
      try {
        const { Message } = await import('@/lib/supabaseEntities');
        const msgs = await Message.filter({ recipient_email: user.email, is_read: false }, '-created_date', 50);
        setUnreadCount((msgs || []).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();

    (async () => {
      const { Message } = await import('@/lib/supabaseEntities');
      unsubscribe = Message.subscribe((event) => {
        if (event.data?.recipient_email === user.email) fetchUnread();
      });
    })();

    return () => unsubscribe && unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe;
    const fetchPendingConnections = async () => {
      try {
        const { Connection } = await import('@/lib/supabaseEntities');
        const connections = await Connection.filter({ 
          recipient_email: user.email, 
          status: 'pending' 
        }, '-created_date', 50);
        setPendingConnections((connections || []).length);
      } catch {
        setPendingConnections(0);
      }
    };
    fetchPendingConnections();

    (async () => {
      const { Connection } = await import('@/lib/supabaseEntities');
      unsubscribe = Connection.subscribe((event) => {
        if (event.data?.recipient_email === user.email) fetchPendingConnections();
      });
    })();

    return () => unsubscribe && unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe;
    const fetchNotifications = async () => {
      try {
        const notifs = await Notification.filter({ recipient_email: user.email });
        setNotificationCount((notifs || []).filter(n => !n.read).length);
      } catch {
        setNotificationCount(0);
      }
    };
    fetchNotifications();

    (async () => {
      unsubscribe = Notification.subscribe((event) => {
        if (event.data?.recipient_email === user.email) fetchNotifications();
      });
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
                isActive ? 'bg-gray-100 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              {item.showBadge && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {item.showConnectionBadge && pendingConnections > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 animate-pulse">
                  {pendingConnections > 9 ? '9+' : pendingConnections}
                </span>
              )}
              {item.showNotificationBadge && notificationCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${expanded ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-gray-100 ring-2 ring-gray-50 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          {expanded && (
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{user?.full_name || 'Artist'}</div>
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
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Briefcase, FileText, Mail, User,
  Home as HomeIcon, Network, ChevronLeft, ChevronRight, LogOut, Wallet, Bell, Users, Ticket
} from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { Notification, Artist } from '@/lib/supabaseEntities';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: HomeIcon, href: 'artistdashboard' },
  { label: 'Find Work', icon: Search, href: 'Jobs' },
  // { label: 'Projects from Clients', icon: Briefcase, href: 'JobBoard' }, // Commented out - redundant with Jobs module
  // { label: 'Applications', icon: FileText, href: 'JobApplications' }, // Hidden for now
  { label: 'Messages', icon: Mail, href: 'Messages', showBadge: true },
  { label: 'Network', icon: Network, href: 'Network', showConnectionBadge: true },
  { label: 'Notifications', icon: Bell, href: 'Notifications', showNotificationBadge: true },
  { label: 'Support Tickets', icon: Ticket, href: 'SupportTickets' },
  { label: 'Finances', icon: Wallet, href: 'ArtistFinance' },
  { label: 'My Profile & Settings', icon: User, href: 'ArtistProfile' }
];

export default function ArtistSidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [artistProfile, setArtistProfile] = useState(null);
  const { sidebarExpanded: expanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen } = useSidebar();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        // Messages table uses conversation_id and sender_id, not recipient_email
        // For now, set to 0 until proper conversation-based messaging is implemented
        setUnreadCount(0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();

    // Poll for updates every 30 seconds instead of using subscribe
    const interval = setInterval(() => {
      fetchUnread();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
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

    // Poll for updates every 30 seconds instead of using subscribe
    const interval = setInterval(() => {
      fetchPendingConnections();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const notifs = await Notification.filter({ recipient_email: user.email });
        setNotificationCount((notifs || []).filter(n => !n.read).length);
      } catch {
        setNotificationCount(0);
      }
    };
    fetchNotifications();

    // Poll for updates every 30 seconds instead of using subscribe
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    const fetchArtistProfile = async () => {
      try {
        const artists = await Artist.filter({ email: user.email });
        if (artists?.[0]) {
          setArtistProfile(artists[0]);
        }
      } catch (err) {
        console.error('Error fetching artist profile:', err);
      }
    };
    fetchArtistProfile();
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
      className={`h-full bg-[#0A0A0A] shadow-[2px_0_12px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-300 z-50 flex-shrink-0 fixed lg:relative ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${expanded ? 'w-64' : 'w-20'}`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-[#1a1a1a]">
        <Link to="/" className="font-black text-xl text-[#C9A962]">
          22.
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-white/5 hover:text-[#C9A962] transition-colors text-gray-500"
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
                    isActive ? 'bg-[#C9A962]/10 text-[#C9A962] font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {item.showConnectionBadge && pendingConnections > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {pendingConnections > 9 ? '9+' : pendingConnections}
                    </span>
                  )}
                  {item.showNotificationBadge && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
                </div>
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={createPageUrl(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive ? 'bg-[#C9A962]/10 text-[#C9A962] font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap flex-1 text-left">{item.label}</span>
              {item.showBadge && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {item.showConnectionBadge && pendingConnections > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 animate-pulse">
                  {pendingConnections > 9 ? '9+' : pendingConnections}
                </span>
              )}
              {item.showNotificationBadge && notificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1a1a1a] p-2 space-y-1">
        {!expanded ? (
          <div className="relative group">
            <div className="flex items-center justify-center w-full p-2 rounded-xl">
              <div className="w-8 h-8 bg-[#1a1a1a] ring-2 ring-[#222] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                {artistProfile?.profile_photo_url ? (
                  <img src={artistProfile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              {artistProfile?.full_name || user?.full_name || 'Artist'}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 bg-[#1a1a1a] ring-2 ring-[#222] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
              {artistProfile?.profile_photo_url ? (
                <img src={artistProfile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-white text-xs truncate">{artistProfile?.full_name || user?.full_name || 'Artist'}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
        )}
        {!expanded ? (
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              Logout
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
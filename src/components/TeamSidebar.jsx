import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare,
  CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, Building2, Share2, Bell
} from 'lucide-react';
import { Message, Notification } from '@/lib/supabaseEntities';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'TeamDashboard' },
  { icon: Users, label: 'Team Members', path: 'TeamMembers' },
  { icon: Briefcase, label: 'Projects', path: 'TeamProjects' },
  { icon: MessageSquare, label: 'Messages', path: 'TeamMessages', showBadge: true },
  { icon: Share2, label: 'Network', path: 'Network' },
  { icon: Bell, label: 'Notifications', path: 'Notifications', showNotificationBadge: true },
  { icon: CreditCard, label: 'Payments', path: 'TeamPayments' },
  { icon: Settings, label: 'Profile & Settings', path: 'TeamProfile' },
];

export default function TeamSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const { sidebarExpanded: expanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen } = useSidebar();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    const fetchUnreadMessages = async () => {
      try {
        // Messages table uses conversation_id and sender_id, not recipient_email
        // For now, set to 0 until proper conversation-based messaging is implemented
        setUnreadMessageCount(0);
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

    // Poll for updates every 30 seconds instead of using subscribe
    const interval = setInterval(() => {
      fetchUnreadMessages();
      fetchUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    const fetchTeam = async () => {
      try {
        const { Team } = await import('@/lib/supabaseEntities');
        const teams = await Team.filter({ contact_email: user.email }, '-created_date', 1);
        if (teams?.[0]) setTeam(teams[0]);
      } catch {
        // team not found — leave null
      }
    };
    fetchTeam();
  }, []);

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
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {expanded && (
            <div>
              <div className="font-bold text-gray-900 text-sm">Studio22</div>
              <div className="text-xs text-gray-500">Team Portal</div>
            </div>
          )}
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors text-gray-400"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase().includes(item.path.toLowerCase());
          return (
            <button
              key={item.path}
              onClick={() => navigate(createPageUrl(item.path))}
              title={!expanded ? item.label : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-1">
        {team && (
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${expanded ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-gray-100 ring-2 ring-gray-50 rounded-full flex-shrink-0" />
            {expanded && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-xs truncate">{team.team_name}</div>
                <div className="text-xs text-gray-500">Team Admin</div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium ${expanded ? '' : 'justify-center'}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {expanded && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
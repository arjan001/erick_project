import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Settings, Search, HardDrive, Mail, Lock, Key, CreditCard, DollarSign, Activity, ChevronRight, LogOut, Briefcase, FolderKanban, Building, MessageSquare, Package, ShoppingCart, Store, Radio, LayoutGrid, BarChart3, Bell, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSidebar } from '@/layouts/DashboardLayout';
import { Message, Notification } from '@/lib/supabaseEntities';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useSidebar();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

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

  const menuItems = [
    {
      section: 'Main',
      items: [
        { path: '/Admin', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      section: 'User Management',
      items: [
        { path: '/Admin/UserManagement', label: 'System Admin Users', icon: Users },
        { path: '/Admin/RolesPermissions', label: 'Roles & Permissions', icon: Shield },
        { path: '/Admin/Invites', label: 'Invites', icon: Mail },
      ]
    },
    {
      section: 'Content Management',
      items: [
        { path: '/Admin/Artists', label: 'Artists', icon: Users },
        { path: '/Admin/Teams', label: 'Teams', icon: Building },
        { path: '/Admin/Backers', label: 'Backers', icon: DollarSign },
        { path: '/Admin/Clients', label: 'Clients', icon: Building },
        { path: '/Admin/Jobs', label: 'Jobs', icon: Briefcase },
        { path: '/Admin/Projects', label: 'Projects', icon: FolderKanban },
        { path: '/Admin/Categories', label: 'Categories', icon: LayoutGrid },
        { path: '/Admin/Ticker', label: 'Marquee / Ticker', icon: Radio },
      ]
    },
    {
      section: 'E-Commerce Shop',
      items: [
        { path: '/Admin/Products', label: 'Products', icon: Package },
        { path: '/Admin/Orders', label: 'Orders', icon: ShoppingCart },
        { path: '/Admin/ShopSettings', label: 'Shop Settings', icon: Store },
      ]
    },
    {
      section: 'Communication',
      items: [
        { path: '/Admin/Messages', label: 'Messages', icon: MessageSquare, showBadge: true },
        { path: '/Admin/Notifications', label: 'Notifications', icon: Bell, showNotificationBadge: true },
      ]
    },
    {
      section: 'System Settings',
      items: [
        { path: '/Admin/GeneralSettings', label: 'General Settings', icon: Settings },
        { path: '/Admin/SEOCMS', label: 'SEO & CMS', icon: Search },
        { path: '/Admin/ImageStorage', label: 'Image Storage', icon: HardDrive },
        { path: '/Admin/LoginProviders', label: 'Login Providers', icon: Lock },
      ]
    },
    {
      section: 'Integrations',
      items: [
        { path: '/Admin/APISettings', label: 'API Settings', icon: Key },
        { path: '/Admin/PaymentSettings', label: 'Payment Settings', icon: CreditCard },
      ]
    },
    {
      section: 'Analytics',
      items: [
        { path: '/Admin/Analytics', label: 'Analytics Dashboard', icon: BarChart3 },
        { path: '/Admin/FinanceDashboard', label: 'Finance Dashboard', icon: DollarSign },
        { path: '/Admin/AuditLogs', label: 'Audit Logs', icon: Activity },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const { logout } = useAuth();

  const handleLogout = () => { logout(true); };

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-[2px_0_12px_rgba(0,0,0,0.03)] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">Studio22</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.section}
              </span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
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
                  {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-xl"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Settings, Search, HardDrive, Mail, Lock, Key, CreditCard, DollarSign, FileText, Activity, ChevronRight, LogOut, Briefcase, FolderKanban, Building, MessageSquare, Package, ShoppingCart, Store } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
        { path: '/Admin/UserManagement', label: 'Users', icon: Users },
        { path: '/Admin/RolesPermissions', label: 'Roles & Permissions', icon: Shield },
        { path: '/Admin/Invites', label: 'Invites', icon: Mail },
      ]
    },
    {
      section: 'Content Management',
      items: [
        { path: '/Admin/Jobs', label: 'Jobs', icon: Briefcase },
        { path: '/Admin/Projects', label: 'Projects', icon: FolderKanban },
        { path: '/Admin/Clients', label: 'Clients', icon: Building },
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
        { path: '/Admin/Messages', label: 'Messages', icon: MessageSquare },
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
        { path: '/Admin/FinanceDashboard', label: 'Finance Dashboard', icon: DollarSign },
        { path: '/Admin/AuditLogs', label: 'Audit Logs', icon: Activity },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('studio22_user');
    navigate('/signin');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Studio22</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <div className="px-6 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.section}
              </span>
            </div>
            {section.items.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-black font-medium border-r-4 border-black'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FolderKanban, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2
} from 'lucide-react';

export default function TeamSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [team, setTeam] = useState(null);
  const { setSidebarExpanded } = useSidebar();

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (storedTeam) {
      setTeam(JSON.parse(storedTeam));
    }
  }, []);

  useEffect(() => {
    setSidebarExpanded(isExpanded);
  }, [isExpanded, setSidebarExpanded]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'TeamDashboard' },
    { icon: Users, label: 'Team Members', path: 'TeamMembers' },
    { icon: Briefcase, label: 'Projects', path: 'TeamProjects' },
    { icon: FolderKanban, label: 'Tasks', path: 'TeamTasks' },
    { icon: MessageSquare, label: 'Messages', path: 'TeamMessages' },
    { icon: CreditCard, label: 'Payments', path: 'TeamPayments' },
    { icon: Settings, label: 'Settings', path: 'TeamSettings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('studio22_team');
    navigate(createPageUrl('SignIn'));
  };

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-[45] shadow-xl ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {isExpanded && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="font-bold text-gray-900">Studio22</div>
                <div className="text-xs text-gray-500">Team Portal</div>
              </div>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path.toLowerCase());
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(createPageUrl(item.path))}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {team && (
            <div className="mb-4 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                {isExpanded && (
                  <div className="overflow-hidden whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-sm truncate">{team.team_name}</div>
                    <div className="text-xs text-gray-500">Team Admin</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
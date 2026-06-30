import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { useSidebar } from '@/layouts/DashboardLayout';
import { 
  LayoutDashboard, Users, Briefcase, FolderKanban, MessageSquare,
  CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, Building2
} from 'lucide-react';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'TeamDashboard' },
  { icon: Users, label: 'Team Members', path: 'TeamMembers' },
  { icon: Briefcase, label: 'Projects', path: 'TeamProjects' },
  { icon: FolderKanban, label: 'Tasks', path: 'TeamTasks' },
  { icon: MessageSquare, label: 'Messages', path: 'TeamMessages' },
  { icon: CreditCard, label: 'Payments', path: 'TeamPayments' },
  { icon: Settings, label: 'Settings', path: 'TeamSettings' },
];

export default function TeamSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [team, setTeam] = useState(null);
  const { setSidebarExpanded } = useSidebar();

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (storedTeam) setTeam(JSON.parse(storedTeam));
  }, []);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    setSidebarExpanded(next);
  };

  const handleLogout = () => {
    localStorage.removeItem('studio22_user');
    localStorage.removeItem('studio22_team');
    window.location.href = '/';
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#F8F8F8] border-r-2 border-gray-200 flex flex-col transition-all duration-300 z-40 ${
        expanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {expanded && (
            <div>
              <div className="font-bold text-gray-900 text-sm">Studio22</div>
              <div className="text-xs text-gray-500">Team Portal</div>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase().includes(item.path.toLowerCase());
          return (
            <button
              key={item.path}
              onClick={() => navigate(createPageUrl(item.path))}
              title={!expanded ? item.label : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        {team && (
          <div className={`flex items-center gap-3 px-3 py-2 ${expanded ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
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
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium ${expanded ? '' : 'justify-center'}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {expanded && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
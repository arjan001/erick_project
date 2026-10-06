import React, { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import UnifiedSidebar from '@/components/UnifiedSidebar';
import UnifiedTopbar from '@/components/UnifiedTopbar';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const SIDEBAR_COLLAPSED_WIDTH = 80;  // px  (w-20)
const SIDEBAR_EXPANDED_WIDTH = 256;  // px  (w-64)

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpandedState] = useState(() => localStorage.getItem('smartgigs_sidebar_expanded') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const setSidebarExpanded = (value) => {
    setSidebarExpandedState(value);
    localStorage.setItem('smartgigs_sidebar_expanded', String(value));
  };

  const isCreator = user?.role === 'artist' || user?.role === 'artist_admin';
  const isTeam = user?.role === 'team' || user?.role === 'team_admin';
  const isClient = user?.role === 'client' || user?.role === 'project_owner';
  const isBacker = user?.role === 'backer';
  const hasSidebar = isCreator || isTeam || isClient || isBacker;

  const userRole = isTeam ? 'team' : isClient ? 'client' : isBacker ? 'backer' : 'creator';
  const settingsPage = isTeam ? 'TeamProfile' : isClient ? 'ClientProfile' : isBacker ? 'BackerProfile' : 'CreatorProfile';

  // Handle sidebar toggle from UnifiedTopbar
  useEffect(() => {
    const handleToggle = () => setMobileSidebarOpen(!mobileSidebarOpen);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, [mobileSidebarOpen]);

  // Handle sidebar collapse from UnifiedSidebar
  useEffect(() => {
    const handleCollapse = (e) => setCollapsed(e.detail.collapsed);
    window.addEventListener('sidebar-collapse', handleCollapse);
    return () => window.removeEventListener('sidebar-collapse', handleCollapse);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen }}>
      <div className="min-h-screen bg-[#f5f6fa]">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {hasSidebar && <UnifiedSidebar role={userRole} mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />}

        <main className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}>
          {hasSidebar && <UnifiedTopbar settingsPage={settingsPage} />}
          <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ArtistSidebar from '@/components/ArtistSidebar';
import BackerSidebar from '@/components/BackerSidebar';
import ClientSidebar from '@/components/ClientSidebar';
import TeamSidebar from '@/components/TeamSidebar';
import DashboardTopbar from '@/components/DashboardTopbar';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const SIDEBAR_COLLAPSED_WIDTH = 80;  // px  (w-20)
const SIDEBAR_EXPANDED_WIDTH = 256;  // px  (w-64)

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  // Persisted so the sidebar doesn't flicker open/closed when navigating between pages
  // (this layout remounts on every route change).
  const [sidebarExpanded, setSidebarExpandedState] = useState(() => localStorage.getItem('ericrabar_sidebar_expanded') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const setSidebarExpanded = (value) => {
    setSidebarExpandedState(value);
    localStorage.setItem('ericrabar_sidebar_expanded', String(value));
  };

  const isArtist = user?.role === 'artist' || user?.role === 'artist_admin';
  const isTeam = user?.role === 'team' || user?.role === 'team_admin';
  const isClient = user?.role === 'client' || user?.role === 'project_owner';
  const isBacker = user?.role === 'backer';
  const hasSidebar = isArtist || isTeam || isClient || isBacker;

  const settingsPage = isTeam ? 'TeamProfile' : isClient ? 'ClientProfile' : isBacker ? 'BackerProfile' : 'ArtistProfile';

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen }}>
      <div className="h-screen bg-[#0A0A0A] flex overflow-hidden">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        {isArtist && <ArtistSidebar />}
        {isTeam && <TeamSidebar />}
        {isClient && <ClientSidebar />}
        {isBacker && <BackerSidebar />}
        <main className="flex-1 min-w-0 flex flex-col bg-[#0F0F0F] overflow-hidden lg:ml-4">
          {hasSidebar && <DashboardTopbar settingsPage={settingsPage} />}
          <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
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
  const [sidebarExpanded, setSidebarExpandedState] = useState(() => localStorage.getItem('studio22_sidebar_expanded') === 'true');
  const setSidebarExpanded = (value) => {
    setSidebarExpandedState(value);
    localStorage.setItem('studio22_sidebar_expanded', String(value));
  };

  const isArtist = user?.role === 'artist' || user?.role === 'artist_admin';
  const isTeam = user?.role === 'team' || user?.role === 'team_admin';
  const isClient = user?.role === 'client' || user?.role === 'project_owner';
  const isBacker = user?.role === 'backer';
  const hasSidebar = isArtist || isTeam || isClient || isBacker;

  const marginLeft = hasSidebar
    ? sidebarExpanded
      ? SIDEBAR_EXPANDED_WIDTH
      : SIDEBAR_COLLAPSED_WIDTH
    : 0;

  const settingsPage = isTeam ? 'TeamProfile' : isClient ? 'ClientProfile' : isBacker ? 'BackerProfile' : 'ArtistProfile';

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, setSidebarExpanded }}>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {isArtist && <ArtistSidebar />}
        {isTeam && <TeamSidebar />}
        {isClient && <ClientSidebar />}
        {isBacker && <BackerSidebar />}
        <main className="flex-1 transition-all duration-300 min-w-0 flex flex-col bg-gray-50 overflow-hidden">
          {hasSidebar && <DashboardTopbar settingsPage={settingsPage} />}
          <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
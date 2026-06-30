import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ArtistSidebar from '@/components/ArtistSidebar';
import BackerSidebar from '@/components/BackerSidebar';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const isArtist = user?.role === 'artist' || user?.role === 'artist_admin';
  const isTeam = user?.role === 'team' || user?.role === 'team_admin';
  const isClient = user?.role === 'client' || user?.role === 'project_owner';
  const isBacker = user?.role === 'backer';

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, setSidebarExpanded }}>
      <div className="min-h-screen bg-white">
        {isArtist && <ArtistSidebar />}
        {isTeam && <ArtistSidebar />}
        {isClient && <ArtistSidebar />}
        {isBacker && <BackerSidebar />}
        <main 
          className={`transition-all duration-300 ${
            isArtist || isTeam || isClient || isBacker 
              ? sidebarExpanded ? 'ml-64' : 'ml-20' 
              : ''
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
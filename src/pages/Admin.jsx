import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, FolderKanban, Users, UsersRound, Film, Link2 } from 'lucide-react';
import ProjectsQueue from '../components/admin/ProjectsQueue';
import ArtistsQueue from '../components/admin/ArtistsQueue';
import TeamsQueue from '../components/admin/TeamsQueue';
import PortfolioQueue from '../components/admin/PortfolioQueue';
import AssignmentManager from '../components/admin/AssignmentManager';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('projects');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Studio22 Admin</h1>
          <p className="text-gray-400">Manage projects, applications, and assignments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-8 overflow-x-auto">
            <TabsTrigger value="projects" className="data-[state=active]:bg-amber-600">
              <FolderKanban className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-amber-600">
              <Users className="w-4 h-4 mr-2" />
              Artists
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-amber-600">
              <UsersRound className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-amber-600">
              <Film className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-amber-600">
              <Link2 className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectsQueue />
          </TabsContent>

          <TabsContent value="artists">
            <ArtistsQueue />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsQueue />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioQueue />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
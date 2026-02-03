import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [artists, setArtists] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Check if admin
        if (currentUser?.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        // Fetch data
        const [projectsList, artistsList, teamsList] = await Promise.all([
          base44.entities.Project.list(),
          base44.entities.Artist.list(),
          base44.entities.Team.list()
        ]);

        setProjects(projectsList);
        setArtists(artistsList);
        setTeams(teamsList);
      } catch (error) {
        console.error('Admin access denied:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, []);

  const handleProjectApprove = async (projectId) => {
    try {
      await base44.entities.Project.update(projectId, { status: 'verified' });
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'verified' } : p));
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const handleProjectReject = async (projectId) => {
    try {
      await base44.entities.Project.update(projectId, { status: 'rejected' });
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'rejected' } : p));
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  const handleBackingApprove = async (projectId) => {
    try {
      await base44.entities.Project.update(projectId, { verified_only: false });
      setProjects(projects.map(p => p.id === projectId ? { ...p, verified_only: false } : p));
    } catch (error) {
      console.error('Error approving backing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600 font-semibold">Access denied. Admin only.</p>
      </div>
    );
  }

  const backedProjects = projects.filter(p => p.open_to_backing === true);
  const pendingProjects = projects.filter(p => p.status === 'submitted');
  const pendingArtists = artists.filter(a => a.status === 'pending');
  const pendingTeams = teams.filter(t => t.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2 text-black">Admin Panel</h1>
        <p className="text-gray-600 mb-8">Manage projects, creators, and teams. Approve backing initiatives.</p>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="backed">Backed ({backedProjects.length})</TabsTrigger>
            <TabsTrigger value="creators">Creators ({pendingArtists.length})</TabsTrigger>
            <TabsTrigger value="teams">Teams ({pendingTeams.length})</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4">
              {pendingProjects.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4 text-black">Pending Approval</h2>
                  {pendingProjects.map(project => (
                    <Card key={project.id} className="mb-4">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{project.project_owner_company || project.project_owner_name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-2">{project.notes}</p>
                          </div>
                          <Badge>{project.project_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleProjectApprove(project.id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleProjectReject(project.id)}
                            variant="outline"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <h2 className="text-lg font-semibold text-black">All Projects</h2>
              {projects.map(project => (
                <Card key={project.id} className="opacity-90">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{project.project_owner_company || project.project_owner_name}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{project.status}</Badge>
                          <Badge variant="outline">{project.project_type}</Badge>
                          {project.open_to_backing && <Badge className="bg-blue-100 text-blue-800">Backing</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Backed Projects Tab */}
          <TabsContent value="backed" className="space-y-4">
            <h2 className="text-lg font-semibold text-black">Projects Seeking Backing</h2>
            {backedProjects.length === 0 ? (
              <p className="text-gray-500">No projects marked as open to backing.</p>
            ) : (
              backedProjects.map(project => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{project.project_owner_company || project.project_owner_name}</CardTitle>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {project.backing_types?.map(type => (
                            <Badge key={type} className="bg-amber-100 text-amber-800">{type}</Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Backing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{project.backing_notes}</p>
                    <Button
                      onClick={() => handleBackingApprove(project.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve for Public Visibility
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-4">
            <h2 className="text-lg font-semibold text-black">Creator Applications</h2>
            {pendingArtists.length === 0 ? (
              <p className="text-gray-500">No pending creator applications.</p>
            ) : (
              pendingArtists.map(artist => (
                <Card key={artist.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{artist.full_name}</h3>
                        <p className="text-sm text-gray-600">{artist.role}</p>
                        <p className="text-sm text-gray-500 mt-1">{artist.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <h2 className="text-lg font-semibold text-black">Team Applications</h2>
            {pendingTeams.length === 0 ? (
              <p className="text-gray-500">No pending team applications.</p>
            ) : (
              pendingTeams.map(team => (
                <Card key={team.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{team.team_code}</h3>
                        <p className="text-sm text-gray-600">{team.city}, {team.country}</p>
                        <p className="text-sm text-gray-500 mt-1">{team.contact_email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
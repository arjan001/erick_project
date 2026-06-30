import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Eye, EyeOff, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [artists, setArtists] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tickerEntries, setTickerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTickerText, setNewTickerText] = useState('');
  const [newTickerAmount, setNewTickerAmount] = useState('');

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const storedUser = localStorage.getItem('studio22_user');
        const currentUser = { user: storedUser ? JSON.parse(storedUser) : null };
        setUser(currentUser?.user);

        // Check if admin
        if (currentUser?.user?.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        // Fetch data
        const [projectsList, artistsList, teamsList, tickerList] = await Promise.all([
          adminApi.projects.list(),
          adminApi.artists.list(),
          adminApi.teams.list(),
          adminApi.ticker.list()
        ]);

        setProjects(projectsList);
        setArtists(artistsList);
        setTeams(teamsList);
        setTickerEntries(tickerList.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
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
      await adminApi.projects.approve(projectId);
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'verified' } : p));
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const handleProjectReject = async (projectId) => {
    try {
      await adminApi.projects.reject(projectId);
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'rejected' } : p));
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  const handleBackingApprove = async (projectId) => {
    try {
      await adminApi.projects.enableBacking(projectId);
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
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 pl-20 md:pl-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2 text-black">Admin Panel</h1>
        <p className="text-gray-600 mb-8">Manage projects, creators, and teams. Approve backing initiatives.</p>

        <Tabs defaultValue="projects" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="backed">Backed ({backedProjects.length})</TabsTrigger>
            <TabsTrigger value="creators">Creators ({pendingArtists.length})</TabsTrigger>
            <TabsTrigger value="teams">Teams ({pendingTeams.length})</TabsTrigger>
            <TabsTrigger value="ticker">Ticker</TabsTrigger>
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

              {/* Ticker Tab */}
              <TabsContent value="ticker" className="space-y-4 pb-8">
            <div className="flex gap-2 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Message</label>
                <input
                  type="text"
                  placeholder="Documentary project received new cultural backing"
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-2">Amount (optional)</label>
                <input
                  type="text"
                  placeholder="€120k"
                  value={newTickerAmount}
                  onChange={(e) => setNewTickerAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={async () => {
                    if (!newTickerText.trim()) return;
                    try {
                      await adminApi.ticker.create({
                        text: newTickerText,
                        amount: newTickerAmount || null,
                        status: 'live',
                        display_order: tickerEntries.length
                      });
                      setNewTickerText('');
                      setNewTickerAmount('');
                      // Refresh
                      const updated = await adminApi.ticker.list();
                      setTickerEntries(updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
                    } catch (error) {
                      console.error('Error creating ticker entry:', error);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Entry
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-black">Live Entries</h3>
              {tickerEntries.filter(t => t.status === 'live').length === 0 ? (
                <p className="text-sm text-gray-500">No live ticker entries yet.</p>
              ) : (
                tickerEntries
                  .filter(t => t.status === 'live')
                  .map(entry => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">{entry.text}</p>
                        <p className="text-xs text-gray-500">{entry.amount ? `Amount: ${entry.amount}` : 'No amount'} • Order: {entry.display_order}</p>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            await adminApi.ticker.update(entry.id, { status: 'draft' });
                            const updated = await adminApi.ticker.list();
                            setTickerEntries(updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
                          } catch (error) {
                            console.error('Error updating entry:', error);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Hide
                      </Button>
                    </div>
                  ))
              )}
            </div>

            <div className="space-y-2 mt-6">
              <h3 className="font-semibold text-black">Draft Entries</h3>
              {tickerEntries.filter(t => t.status === 'draft').length === 0 ? (
                <p className="text-sm text-gray-500">No draft entries.</p>
              ) : (
                tickerEntries
                  .filter(t => t.status === 'draft')
                  .map(entry => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{entry.text}</p>
                        <p className="text-xs text-gray-500">{entry.amount ? `Amount: ${entry.amount}` : 'No amount'}</p>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            await adminApi.ticker.update(entry.id, { status: 'live' });
                            const updated = await adminApi.ticker.list();
                            setTickerEntries(updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
                          } catch (error) {
                            console.error('Error updating entry:', error);
                          }
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Publish
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  CheckCircle, Clock, AlertCircle, Briefcase, MessageSquare, 
  Eye, TrendingUp, Upload, Edit, Users, Mail, Phone, MapPin,
  Globe, Award, Film, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function TeamDashboard() {
  const [team, setTeam] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await base44.auth.me();
      const teams = await base44.entities.Team.filter({ contact_email: user.email });
      
      if (teams.length > 0) {
        const teamData = teams[0];
        setTeam(teamData);

        // Load portfolio clips
        const clips = await base44.entities.PortfolioClip.filter({ 
          uploaded_by_type: 'team',
          uploaded_by_id: teamData.id 
        });
        setPortfolioClips(clips);

        // Load applications (mock for now)
        setApplications([]);
        
        // Load messages (mock for now)
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Team.update(team.id, { team_logo_url: file_url });
      setTeam({ ...team, team_logo_url: file_url });
    } catch (error) {
      alert('Error uploading logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await base44.entities.Team.update(team.id, {
        team_name: team.team_name,
        contact_name: team.contact_name,
        contact_email: team.contact_email,
        phone: team.phone,
        availability: team.availability
      });
      setEditingProfile(false);
      await loadDashboardData();
      alert('Team profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating profile: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Team Profile Found</h2>
            <p className="text-gray-600 mb-6">You haven't submitted a team application yet.</p>
            <Link to={createPageUrl('ApplyTeam')}>
              <Button className="bg-black hover:bg-gray-800">Apply as Team</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    const config = statusConfig[team.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-2 px-4 py-2 text-sm`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </Badge>
    );
  };

  const getAvailabilityBadge = () => {
    const config = {
      available: { color: 'bg-green-100 text-green-800', label: 'Available' },
      limited: { color: 'bg-yellow-100 text-yellow-800', label: 'Limited Availability' },
      booked: { color: 'bg-red-100 text-red-800', label: 'Fully Booked' }
    };
    const avail = config[team.availability] || config.available;
    return (
      <Badge className={avail.color}>
        {avail.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Team Dashboard</h1>
          <p className="text-gray-600">Manage your team profile, track projects, and showcase your work</p>
        </div>

        {/* Team Profile Status Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Team Logo */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                    {team.team_logo_url ? (
                      <img src={team.team_logo_url} alt={team.team_name} className="w-full h-full object-cover" />
                    ) : (
                      team.team_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <input
                    type="file"
                    id="team-logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <label 
                    htmlFor="team-logo-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {uploadingLogo ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-gray-600" />
                    )}
                  </label>
                </div>

                {/* Team Info */}
                <div>
                  <h2 className="text-2xl font-bold text-black mb-1">{team.team_name}</h2>
                  <p className="text-gray-600 mb-2">Team Code: {team.team_code}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{team.city}, {team.country}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                {getStatusBadge()}
                {getAvailabilityBadge()}
                <Button
                  onClick={() => setEditingProfile(!editingProfile)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {editingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Section */}
        {editingProfile && (
          <Card className="mb-8 border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Edit Team Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Team Name</label>
                  <Input
                    value={team.team_name || ''}
                    onChange={(e) => setTeam({ ...team, team_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name</label>
                  <Input
                    value={team.contact_name || ''}
                    onChange={(e) => setTeam({ ...team, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <Input
                    value={team.contact_email || ''}
                    onChange={(e) => setTeam({ ...team, contact_email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={team.phone || ''}
                    onChange={(e) => setTeam({ ...team, phone: e.target.value })}
                    placeholder="+31 6 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select
                    value={team.availability || 'available'}
                    onChange={(e) => setTeam({ ...team, availability: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md px-3"
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited Availability</option>
                    <option value="booked">Fully Booked</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveProfile} className="bg-black hover:bg-gray-800">
                  Save Changes
                </Button>
                <Button onClick={() => setEditingProfile(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold text-black">0</p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Team Members</p>
                  <p className="text-3xl font-bold text-black">{team.team_members?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active crew</p>
                </div>
                <Users className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                  <p className="text-3xl font-bold text-black">{portfolioClips.reduce((sum, clip) => sum + (clip.view_count || 0), 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <Eye className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Portfolio</p>
                  <p className="text-3xl font-bold text-black">{portfolioClips.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Work samples</p>
                </div>
                <Film className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Current Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Contracts</span>
                <Link to={createPageUrl('Projects')}>
                  <Button size="sm" variant="outline">Browse</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No active contracts yet</p>
                <Link to={createPageUrl('Projects')}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Find Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No upcoming deadlines</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team Portfolio</span>
                <Link to={createPageUrl('ApplyTeam')}>
                  <Button size="sm" variant="outline">Manage</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioClips.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No portfolio clips yet</p>
                  <Link to={createPageUrl('ApplyTeam')}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Add Clips</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolioClips.slice(0, 3).map((clip) => (
                    <div key={clip.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                        {clip.thumbnail_url && (
                          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{clip.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-500">{clip.view_count || 0} views</p>
                      </div>
                      <Badge className={
                        clip.status === 'approved' ? 'bg-green-100 text-green-800' :
                        clip.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {clip.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Messages</span>
                <Link to={createPageUrl('Messages')}>
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 5).map((msg, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{msg.from}</p>
                      <p className="text-xs text-gray-600 truncate">{msg.preview}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {team.status === 'approved' && (
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Start Browsing Projects</h3>
                  <p className="text-blue-100">Your team profile is approved! Explore opportunities and apply to projects that match your expertise.</p>
                </div>
                <Link to={createPageUrl('Projects')}>
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                    Browse Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
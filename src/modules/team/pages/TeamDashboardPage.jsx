import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import { useAuth } from '@/lib/AuthContext';

import { createPageUrl } from '@/shared/utils/routing';

import { 

  CheckCircle, Clock, AlertCircle, Briefcase, MessageSquare, 

  Eye, TrendingUp, Upload, Edit, Users, Mail, Phone, MapPin,

  Globe, Award, Film, Calendar, Plus, X, Edit2, Play, Instagram, Linkedin

} from 'lucide-react';

import { Button } from '@/components/ui/button';
import DashboardStatCard from '@/components/DashboardStatCard';
import { PortfolioModal, MemberModal } from '@/modules/team/components/TeamDashboardModals';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';

import { notifyError, notifySuccess, confirmDialog } from '@/lib/sweetAlert';

import { base44 } from '@/api/base44Client';



export default function TeamDashboard() {

  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();

  const [team, setTeam] = useState(null);

  const [portfolioClips, setPortfolioClips] = useState([]);

  const [teamMembers, setTeamMembers] = useState([]);

  const [applications, setApplications] = useState([]);

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);

  const [editingPortfolio, setEditingPortfolio] = useState(null);

  const [editingMember, setEditingMember] = useState(null);

  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState({

    title: '',

    project_type: 'commercial',

    description: '',

    role: ''

  });

  const [memberForm, setMemberForm] = useState({

    name: '',

    role: '',

    email: '',

    skills: '',

    avatar_url: ''

  });

  const [editingBio, setEditingBio] = useState(false);

  const [editingSocial, setEditingSocial] = useState(false);

  const [profileBio, setProfileBio] = useState('');

  const [profileWebsite, setProfileWebsite] = useState('');

  const [profileInstagram, setProfileInstagram] = useState('');

  const [profileLinkedin, setProfileLinkedin] = useState('');

  const [profileSpecialties, setProfileSpecialties] = useState('');

  const videoInputRef = React.useRef(null);



  useEffect(() => {

    if (!isLoadingAuth && isAuthenticated && authUser) {
      loadDashboardData(authUser);
    } else if (!isLoadingAuth && !isAuthenticated) {
      window.location.href = '/SignIn';
    }

  }, [isLoadingAuth, isAuthenticated, authUser]);



  const loadDashboardData = async (currentUser) => {

    if (!currentUser) return;

    try {

      const { base44: b44 } = await import('@/api/base44Client');

      // Load real team profile
      const teams = await b44.entities.Team.filter({ contact_email: currentUser.email }, '-created_date', 1);
      const teamData = teams?.[0] || null;
      setTeam(teamData);

      if (teamData) {
        setProfileBio('');
        setProfileWebsite(teamData.website || '');
        setProfileInstagram('');
        setProfileLinkedin('');
        setProfileSpecialties(Array.isArray(teamData.specialties) ? teamData.specialties.join(', ') : '');

        // Load real portfolio clips
        const clips = await b44.entities.PortfolioClip.filter({ uploaded_by_id: teamData.id, uploaded_by_type: 'team' }, '-created_date', 20);
        setPortfolioClips(clips || []);

        // Load real team members from the team's team_members array (embedded)
        setTeamMembers(teamData.team_members || []);

        // Load real messages
        const msgs = await b44.entities.Message.filter({ recipient_email: teamData.contact_email }, '-created_date', 5);
        setMessages(msgs || []);
      }

      setApplications([]);

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

      // Mock upload - just set a placeholder URL
      const fileUrl = URL.createObjectURL(file);
      setTeam({ ...team, team_logo_url: fileUrl });

    } catch (error) {

      notifyError('Upload Failed', 'Error uploading logo');

    } finally {

      setUploadingLogo(false);

    }

  };



  const handleSaveProfile = async () => {

    try {

      if (team?.id) {
        const { base44: b44 } = await import('@/api/base44Client');
        await b44.entities.Team.update(team.id, {
          team_name: team.team_name,
          contact_name: team.contact_name,
          contact_email: team.contact_email,
          phone: team.phone,
          availability: team.availability,
        });
      }

      setEditingProfile(false);

    } catch (error) {

      console.error('Update error:', error);

    }

  };



  const handleSaveBio = async () => {

    if (!team) return;

    try {

      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.Team.update(team.id, { admin_notes: profileBio });
      setTeam(prev => ({ ...prev, bio: profileBio }));

      setEditingBio(false);

    } catch (err) {

      console.error('Error saving bio:', err);

      notifyError('Save Failed', 'Failed to save bio');

    }

  };



  const handleSaveSocial = async () => {

    if (!team) return;

    try {

      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.Team.update(team.id, {
        website: profileWebsite,
        instagram: profileInstagram,
        linkedin: profileLinkedin,
      });
      setTeam(prev => ({

        ...prev,

        website: profileWebsite,

        instagram: profileInstagram,

        linkedin: profileLinkedin

      }));

      setEditingSocial(false);

    } catch (err) {

      console.error('Error saving social links:', err);

      notifyError('Save Failed', 'Failed to save social links');

    }

  };



  const handleAddPortfolioClip = async () => {

    if (!team || !portfolioForm.title) {

      notifyError('Validation Error', 'Please fill in the required fields');

      return;

    }



    setUploadingVideo(true);

    try {

      let videoUrl = '';

      let thumbnailUrl = '';



      if (videoInputRef.current?.files?.[0]) {

        const videoFile = videoInputRef.current.files[0];

        videoUrl = URL.createObjectURL(videoFile);

      }



      const { base44: b44 } = await import('@/api/base44Client');
      const newClip = await b44.entities.PortfolioClip.create({
        uploaded_by_type: 'team',
        uploaded_by_id: team.id,
        title: portfolioForm.title,
        project_type: portfolioForm.project_type,
        description: portfolioForm.description,
        original_video_url: videoUrl || '',
        status: 'pending',
      });

      setPortfolioClips(prev => [...prev, newClip]);

      setShowPortfolioModal(false);

      setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '' });

    } catch (err) {

      console.error('Error adding portfolio clip:', err);

      notifyError('Upload Failed', 'Failed to add portfolio clip');

    } finally {

      setUploadingVideo(false);

    }

  };



  const handleDeletePortfolioClip = async (clipId) => {

    if (!(await confirmDialog('Delete portfolio clip?', 'This action cannot be undone'))) return;

    try {

      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.PortfolioClip.delete(clipId);
      setPortfolioClips(prev => prev.filter(clip => clip.id !== clipId));

    } catch (err) {

      console.error('Error deleting portfolio clip:', err);

      notifyError('Delete Failed', 'Failed to delete portfolio clip');

    }

  };



  const handleEditPortfolioClip = (clip) => {

    setEditingPortfolio(clip);

    setPortfolioForm({

      title: clip.title,

      project_type: clip.project_type || 'commercial',

      description: clip.description || '',

      role: clip.role || ''

    });

    setShowPortfolioModal(true);

  };



  const handleUpdatePortfolioClip = async () => {

    if (!editingPortfolio) return;

    try {

      let videoUrl = editingPortfolio.video_url;

      let thumbnailUrl = editingPortfolio.thumbnail_url;

      if (videoInputRef.current?.files?.[0]) {

        const videoFile = videoInputRef.current.files[0];

        videoUrl = URL.createObjectURL(videoFile);

      }

      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.PortfolioClip.update(editingPortfolio.id, {
        title: portfolioForm.title,
        project_type: portfolioForm.project_type,
        description: portfolioForm.description,
        original_video_url: videoUrl || '',
      });
      const updatedClip = {
        ...editingPortfolio,
        title: portfolioForm.title,
        project_type: portfolioForm.project_type,
        description: portfolioForm.description,
        original_video_url: videoUrl || '',
      };

      setPortfolioClips(prev => prev.map(clip => 
        clip.id === editingPortfolio.id ? updatedClip : clip
      ));

      setShowPortfolioModal(false);

      setEditingPortfolio(null);

      setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '' });

      if (videoInputRef.current) {

        videoInputRef.current.value = '';

      }

    } catch (err) {

      console.error('Error updating portfolio clip:', err);

      notifyError('Update Failed', 'Failed to update portfolio clip');

    }

  };



  const handleAddTeamMember = async () => {

    if (!team || !memberForm.name || !memberForm.role) {

      notifyError('Validation Error', 'Please fill in name and role');

      return;

    }

    try {

      const newMember = {
        id: Date.now().toString(),
        name: memberForm.name,
        role: memberForm.role,
        email: memberForm.email,
        skills: memberForm.skills.split(',').map(s => s.trim()).filter(s => s),
        avatar_url: memberForm.avatar_url
      };
      const updatedMembers = [...teamMembers, newMember];
      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.Team.update(team.id, { team_members: updatedMembers });
      setTeamMembers(updatedMembers);

      if (memberForm.email) {
        await b44.integrations.Core.SendEmail({
          to: memberForm.email,
          subject: `You've been added to ${team.team_name} on Studio22`,
          body: `Hi ${memberForm.name},\n\n${team.contact_name || team.team_name} added you as "${memberForm.role}" to the team "${team.team_name}" on Studio22.\n\nSign in or create an account with this email to get started: ${window.location.origin}/SignIn\n\n— Studio22`
        });
        notifySuccess('Member Added', `Invite email sent to ${memberForm.email}`);
      }

      setShowMemberModal(false);

      setMemberForm({ name: '', role: '', email: '', skills: '', avatar_url: '' });

    } catch (err) {

      console.error('Error adding team member:', err);

      notifyError('Add Failed', 'Failed to add team member: ' + err.message);

    }

  };



  const handleDeleteTeamMember = async (memberId) => {

    if (!(await confirmDialog('Remove team member?', 'This action cannot be undone'))) return;

    try {

      const updatedMembers = teamMembers.filter(member => member.id !== memberId);
      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.Team.update(team.id, { team_members: updatedMembers });
      setTeamMembers(updatedMembers);

    } catch (err) {

      console.error('Error deleting team member:', err);

      notifyError('Delete Failed', 'Failed to delete team member');

    }

  };



  const handleEditTeamMember = (member) => {

    setEditingMember(member);

    setMemberForm({

      name: member.name,

      role: member.role,

      email: member.email || '',

      skills: member.skills ? member.skills.join(', ') : '',

      avatar_url: member.avatar_url || ''

    });

    setShowMemberModal(true);

  };



  const handleUpdateTeamMember = async () => {

    if (!editingMember) return;

    try {

      const updatedMember = {
        ...editingMember,
        name: memberForm.name,
        role: memberForm.role,
        email: memberForm.email,
        skills: memberForm.skills.split(',').map(s => s.trim()).filter(s => s),
        avatar_url: memberForm.avatar_url
      };
      const updatedMembers = teamMembers.map(member =>
        member.id === editingMember.id ? updatedMember : member
      );
      const { base44: b44 } = await import('@/api/base44Client');
      await b44.entities.Team.update(team.id, { team_members: updatedMembers });
      setTeamMembers(updatedMembers);

      setShowMemberModal(false);

      setEditingMember(null);

      setMemberForm({ name: '', role: '', email: '', skills: '', avatar_url: '' });

    } catch (err) {

      console.error('Error updating team member:', err);

      notifyError('Update Failed', 'Failed to update team member: ' + err.message);

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

    <div className="min-h-screen bg-gray-50 py-6">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Team Dashboard</h1>

          <p className="text-gray-500 text-sm">Manage your team profile, track projects, and showcase your work</p>

        </div>



        {/* Team Profile Status Card */}
        <Card className="mb-8 bg-gray-50 border-2 border-gray-200">

          <CardContent className="pt-6">

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

              <div className="flex items-center gap-6">

                {/* Team Logo */}

                <div className="relative">

                  <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center text-gray-700 text-3xl font-bold overflow-hidden">

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

                <div className="flex-1">

                  <h2 className="text-2xl font-bold text-black mb-1">{team.team_name}</h2>

                  <p className="text-gray-600 mb-2">Team Code: {team.team_code}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">

                    <MapPin className="w-4 h-4" />

                    <span>{team.city}, {team.country}</span>

                  </div>



                  {/* Bio Section */}

                  {editingBio ? (

                    <div className="mb-3">

                      <textarea

                        value={profileBio}

                        onChange={(e) => setProfileBio(e.target.value)}

                        placeholder="Tell us about your team..."

                        rows={2}

                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"

                      />

                      <div className="flex gap-2 mt-2">

                        <Button size="sm" onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save</Button>

                        <Button size="sm" onClick={() => setEditingBio(false)} variant="outline">Cancel</Button>

                      </div>

                    </div>

                  ) : (

                    <div className="mb-3">

                      {team?.bio ? (

                        <p className="text-gray-700 text-sm leading-relaxed">{team.bio}</p>

                      ) : (

                        <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 text-sm">Add bio</button>

                      )}

                      {team?.bio && (

                        <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 ml-2">

                          <Edit2 className="w-3 h-3 inline" />

                        </button>

                      )}

                    </div>

                  )}



                  {/* Social Links */}

                  {editingSocial ? (

                    <div className="flex flex-col gap-2 mb-3">

                      <div className="flex gap-2 items-center">

                        <Globe className="w-4 h-4 text-gray-400" />

                        <input

                          type="text"

                          value={profileWebsite}

                          onChange={(e) => setProfileWebsite(e.target.value)}

                          placeholder="Website URL"

                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                        />

                      </div>

                      <div className="flex gap-2 items-center">

                        <Instagram className="w-4 h-4 text-gray-400" />

                        <input

                          type="text"

                          value={profileInstagram}

                          onChange={(e) => setProfileInstagram(e.target.value)}

                          placeholder="Instagram URL"

                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                        />

                      </div>

                      <div className="flex gap-2 items-center">

                        <Linkedin className="w-4 h-4 text-gray-400" />

                        <input

                          type="text"

                          value={profileLinkedin}

                          onChange={(e) => setProfileLinkedin(e.target.value)}

                          placeholder="LinkedIn URL"

                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"

                        />

                      </div>

                      <div className="flex gap-2 mt-2">

                        <Button size="sm" onClick={handleSaveSocial} className="bg-black text-white hover:bg-gray-800">Save</Button>

                        <Button size="sm" onClick={() => setEditingSocial(false)} variant="outline">Cancel</Button>

                      </div>

                    </div>

                  ) : (

                    <div className="flex items-center gap-3 mb-3">

                      {team?.website && (

                        <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Website">

                          <Globe className="w-5 h-5" />

                        </a>

                      )}

                      {team?.instagram && (

                        <a href={team.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Instagram">

                          <Instagram className="w-5 h-5" />

                        </a>

                      )}

                      {team?.linkedin && (

                        <a href={team.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="LinkedIn">

                          <Linkedin className="w-5 h-5" />

                        </a>

                      )}

                      <button onClick={() => setEditingSocial(true)} className="text-gray-400 hover:text-gray-600">

                        <Edit2 className="w-4 h-4" />

                      </button>

                    </div>

                  )}

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



        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

          <DashboardStatCard icon={Briefcase} label="In progress" value={0} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <DashboardStatCard icon={Users} label="Active crew" value={teamMembers.length} iconBg="bg-amber-50" iconColor="text-amber-600" />
          <DashboardStatCard icon={Eye} label="This month" value={portfolioClips.reduce((sum, clip) => sum + (clip.view_count || 0), 0)} iconBg="bg-green-50" iconColor="text-green-600" />
          <DashboardStatCard icon={Film} label="Work samples" value={portfolioClips.length} iconBg="bg-purple-50" iconColor="text-purple-600" />

        </div>



        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* Team Members */}

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center justify-between">

                <span>Team Members</span>

                <Button size="sm" onClick={() => setShowMemberModal(true)} className="bg-black text-white hover:bg-gray-800">

                  <Plus className="w-4 h-4 mr-2" />

                  Add Member

                </Button>

              </CardTitle>

            </CardHeader>

            <CardContent>

              {teamMembers.length === 0 ? (

                <div className="text-center py-8">

                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />

                  <p className="text-gray-600 mb-4">No team members yet</p>

                  <Button size="sm" onClick={() => setShowMemberModal(true)} className="bg-blue-600 hover:bg-blue-700">

                    Add Your First Member

                  </Button>

                </div>

              ) : (

                <div className="space-y-3">

                  {teamMembers.map((member) => (

                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">

                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">

                        {member.avatar_url ? (

                          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />

                        ) : (

                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">

                            {member.name?.charAt(0).toUpperCase()}

                          </div>

                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="font-medium text-sm truncate">{member.name}</p>

                        <p className="text-xs text-gray-500">{member.role}</p>

                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button

                          onClick={() => handleEditTeamMember(member)}

                          className="p-1 hover:bg-gray-200 rounded"

                        >

                          <Edit2 className="w-4 h-4 text-gray-600" />

                        </button>

                        <button

                          onClick={() => handleDeleteTeamMember(member.id)}

                          className="p-1 hover:bg-red-100 rounded"

                        >

                          <X className="w-4 h-4 text-red-600" />

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </CardContent>

          </Card>



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

        </div>



        <div className="grid md:grid-cols-2 gap-8">

          {/* Portfolio Section */}

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center justify-between">

                <span>Team Portfolio</span>

                <Button size="sm" onClick={() => setShowPortfolioModal(true)} className="bg-black text-white hover:bg-gray-800">

                  <Plus className="w-4 h-4 mr-2" />

                  Add Clip

                </Button>

              </CardTitle>

            </CardHeader>

            <CardContent>

              {portfolioClips.length === 0 ? (

                <div className="text-center py-8">

                  <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />

                  <p className="text-gray-600 mb-4">No portfolio clips yet</p>

                  <Button size="sm" onClick={() => setShowPortfolioModal(true)} className="bg-blue-600 hover:bg-blue-700">

                    Add Your First Clip

                  </Button>

                </div>

              ) : (

                <div className="space-y-3">

                  {portfolioClips.slice(0, 3).map((clip) => (

                    <div key={clip.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">

                      <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0 relative">

                        {clip.thumbnail_url ? (

                          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />

                        ) : (

                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">

                            <Play className="w-6 h-6 text-white opacity-60" />

                          </div>

                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="font-medium text-sm truncate">{clip.title || 'Untitled'}</p>

                        <p className="text-xs text-gray-500">{clip.view_count || 0} views</p>

                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button

                          onClick={() => handleEditPortfolioClip(clip)}

                          className="p-1 hover:bg-gray-200 rounded"

                        >

                          <Edit2 className="w-4 h-4 text-gray-600" />

                        </button>

                        <button

                          onClick={() => handleDeletePortfolioClip(clip.id)}

                          className="p-1 hover:bg-red-100 rounded"

                        >

                          <X className="w-4 h-4 text-red-600" />

                        </button>

                      </div>

                    </div>

                  ))}

                  {portfolioClips.length > 3 && (

                    <p className="text-xs text-gray-500 text-center pt-2">

                      +{portfolioClips.length - 3} more clips

                    </p>

                  )}

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

          <Card className="mt-8 bg-gray-900 text-white border-0">

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



        <PortfolioModal
          show={showPortfolioModal}
          editing={editingPortfolio}
          form={portfolioForm}
          setForm={setPortfolioForm}
          videoInputRef={videoInputRef}
          uploading={uploadingVideo}
          onClose={() => { setShowPortfolioModal(false); setEditingPortfolio(null); setPortfolioForm({ title: '', project_type: 'commercial', description: '', role: '' }); }}
          onSave={editingPortfolio ? handleUpdatePortfolioClip : handleAddPortfolioClip}
        />

        <MemberModal
          show={showMemberModal}
          editing={editingMember}
          form={memberForm}
          setForm={setMemberForm}
          onClose={() => { setShowMemberModal(false); setEditingMember(null); setMemberForm({ name: '', role: '', email: '', skills: '', avatar_url: '' }); }}
          onSave={editingMember ? handleUpdateTeamMember : handleAddTeamMember}
        />

      </div>

    </div>

  );

}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Team } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Mail, Search, MoreVertical, Crown, Shield, User, X, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';
import { useAuth } from '@/lib/AuthContext';
import { createTeamInvitation, revokeInvitation, resendInvitation } from '@/lib/teamInvitationService';
import skillsAndRolesData from '@/lib/skillsAndRoles.json';

export default function TeamMembersPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New fields for enhanced invitation
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [showRolesDropdown, setShowRolesDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    loadTeamData();
  }, [isAuthenticated]);

  const loadTeamData = async () => {
    try {
      let teamData = null;
      if (authUser?.team_id) {
        teamData = await Team.filter({ id: authUser.team_id }, '-created_date', 1).then(r => r?.[0] || null);
      } else {
        const teams = await Team.filter({ contact_email: authUser?.email }, '-created_date', 1);
        teamData = teams?.[0] || null;
      }
      setTeam(teamData);
      if (teamData) {
        fetchMembers(teamData.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading team:', err);
      toastError('Load Failed', 'Failed to load team data');
      setLoading(false);
    }
  };

  const fetchMembers = async (teamId) => {
    try {
      const teamMembers = await base44.entities.TeamMember.filter({ team_id: teamId });
      const teamInvitations = await base44.entities.TeamInvitation.filter({ team_id: teamId, status: 'pending' });
      setMembers(teamMembers);
      setInvitations(teamInvitations);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !team) return;
    try {
      const inviterName = `${authUser?.first_name || ''} ${authUser?.last_name || ''}`.trim() || 'Team Admin';
      
      // Handle image upload if present
      let imageUrl = profileImageUrl;
      if (profileImage) {
        // In a real implementation, you would upload the image to a storage service
        // For now, we'll use a placeholder or the URL if provided
        imageUrl = URL.createObjectURL(profileImage);
      }
      
      const result = await createTeamInvitation(
        team.id,
        inviteEmail,
        inviteRole,
        inviterName,
        {
          roles: selectedRoles,
          skills: selectedSkills,
          profile_image: imageUrl
        }
      );
      
      if (result.success) {
        success('Invitation Sent', `Invitation sent to ${inviteEmail}. They will receive an email to join your team.`);
        setInviteEmail('');
        setInviteRole('member');
        setSelectedRoles([]);
        setSelectedSkills([]);
        setProfileImage(null);
        setProfileImageUrl('');
        setShowInviteModal(false);
        
        // Refresh members list
        fetchMembers(team.id);
      } else {
        toastError('Invitation Failed', result.error || 'Failed to send invitation. Please try again.');
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      toastError('Invitation Failed', 'Failed to send invitation. Please try again.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImageUrl('');
    }
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const removeRole = (role) => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleResendInvite = async (invitationId, email) => {
    try {
      const inviterName = `${authUser?.first_name || ''} ${authUser?.last_name || ''}`.trim() || 'Team Admin';
      const result = await resendInvitation(invitationId, team.team_name, inviterName);
      
      if (result.success) {
        success('Invitation Resent', `Invitation resent to ${email}`);
      } else {
        toastError('Resend Failed', result.error || 'Failed to resend invitation');
      }
    } catch (err) {
      console.error('Error resending invitation:', err);
      toastError('Resend Failed', 'Failed to resend invitation');
    }
  };

  const handleCancelInvite = async (invitationId) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;
    try {
      const result = await revokeInvitation(invitationId);
      
      if (result.success) {
        success('Invitation Cancelled', 'Invitation has been cancelled');
        fetchMembers(team.id);
      } else {
        toastError('Cancel Failed', result.error || 'Failed to cancel invitation');
      }
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      toastError('Cancel Failed', 'Failed to cancel invitation');
      fetchMembers(team.id);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await base44.entities.TeamMember.delete(memberId);
      setMembers(members.filter(m => m.id !== memberId));
      success('Member Removed', 'Member has been removed from the team');
    } catch (err) {
      console.error('Error removing member:', err);
      toastError('Removal Failed', 'Failed to remove member');
    }
  };

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <Button onClick={() => setShowInviteModal(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pending Invitations */}
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{invitation.email}</div>
                      <div className="text-sm text-yellow-700">Pending Invitation</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResendInvite(invitation.id, invitation.email)}
                    className="flex-1"
                  >
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelInvite(invitation.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}

            {/* Active Members */}
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  {member.role === 'admin' && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">{member.role}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Profile
                  </Button>
                  {member.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-600 mb-4">Invite team members to get started</p>
              <Button onClick={() => setShowInviteModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Profile Image</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </label>
                    {profileImage && (
                      <span className="text-xs text-gray-600">{profileImage.name}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">or</div>
                  <Input
                    type="text"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="Or paste image URL"
                  />
                </div>
                {(profileImage || profileImageUrl) && (
                  <div className="mt-2">
                    <img
                      src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* Roles Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Film Industry Roles</label>
                <div className="relative">
                  <button
                    onClick={() => setShowRolesDropdown(!showRolesDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black flex items-center justify-between text-left"
                  >
                    <span className="text-gray-700">
                      {selectedRoles.length > 0 ? `${selectedRoles.length} selected` : 'Select roles...'}
                    </span>
                    {showRolesDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showRolesDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {Object.entries(skillsAndRolesData.film_roles_by_category).map(([category, roles]) => (
                        <div key={category}>
                          <div className="px-3 py-2 bg-gray-100 font-medium text-xs text-gray-700 sticky top-0">
                            {category}
                          </div>
                          {roles.map((role) => (
                            <label
                              key={role}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(role)}
                                onChange={() => toggleRole(role)}
                                className="mr-2"
                              />
                              {role}
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Roles Tags */}
                {selectedRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full"
                      >
                        {role}
                        <button
                          onClick={() => removeRole(role)}
                          className="hover:text-gray-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Skills</label>
                <div className="relative">
                  <button
                    onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black flex items-center justify-between text-left"
                  >
                    <span className="text-gray-700">
                      {selectedSkills.length > 0 ? `${selectedSkills.length} selected` : 'Select skills...'}
                    </span>
                    {showSkillsDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showSkillsDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {Object.entries(skillsAndRolesData.skills_by_category).map(([category, skills]) => (
                        <div key={category}>
                          <div className="px-3 py-2 bg-gray-100 font-medium text-xs text-gray-700 sticky top-0">
                            {category}
                          </div>
                          {skills.map((skill) => (
                            <label
                              key={skill}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSkills.includes(skill)}
                                onChange={() => toggleSkill(skill)}
                                className="mr-2"
                              />
                              {skill}
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Skills Tags */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleInvite} className="flex-1 bg-black text-white hover:bg-gray-800">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowInviteModal(false);
                    setSelectedRoles([]);
                    setSelectedSkills([]);
                    setProfileImage(null);
                    setProfileImageUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

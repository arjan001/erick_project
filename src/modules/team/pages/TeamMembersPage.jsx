import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TeamSidebar from '@/components/TeamSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Mail, Search, MoreVertical, Crown, Shield, User } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function TeamMembersPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedTeam = localStorage.getItem('studio22_team');
    if (!storedTeam) {
      window.location.href = '/';
      return;
    }
    setTeam(JSON.parse(storedTeam));
    fetchMembers(JSON.parse(storedTeam).id);
  }, []);

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
      // Create invitation in base44 (for demo purposes)
      // In production with Clerk, this would use:
      // await clerk.organization().createInvitation({ email: inviteEmail, role: inviteRole })
      await base44.entities.TeamInvitation.create({
        team_id: team.id,
        team_name: team.team_name,
        email: inviteEmail,
        status: 'pending',
        role: inviteRole,
        created_at: new Date().toISOString()
      });
      
      // Simulate sending email (in production, Clerk handles this automatically)
      success('Invitation Sent', `Invitation sent to ${inviteEmail}. They will receive an email to join your team.`);
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      
      // Refresh members list
      fetchMembers(team.id);
    } catch (err) {
      console.error('Error sending invitation:', err);
      toastError('Invitation Failed', 'Failed to send invitation. Please try again.');
    }
  };

  const handleResendInvite = async (invitationId, email) => {
    try {
      await base44.entities.TeamInvitation.update(invitationId, {
        resent_at: new Date().toISOString()
      });
      success('Invitation Resent', `Invitation resent to ${email}`);
    } catch (err) {
      console.error('Error resending invitation:', err);
      toastError('Resend Failed', 'Failed to resend invitation');
    }
  };

  const handleCancelInvite = async (invitationId) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;
    try {
      await base44.entities.TeamInvitation.delete(invitationId);
      success('Invitation Cancelled', 'Invitation has been cancelled');
      fetchMembers(team.id);
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      toastError('Cancel Failed', 'Failed to cancel invitation');
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
      <div className="h-screen bg-white">
        <TeamSidebar />
        <main className="w-full h-full flex items-center justify-center pl-20">
          <div className="text-gray-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <TeamSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
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
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
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
              <div className="flex gap-4">
                <Button onClick={handleInvite} className="flex-1 bg-black text-white hover:bg-gray-800">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
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

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Invite, AuditLog } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Mail, Plus, Trash2, Send, Clock, CheckCircle, Users } from 'lucide-react';

const ROLES = ['admin', 'artist', 'team', 'client', 'project_owner', 'backer'];

export default function AdminInvitesManagementPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'artist', expiresIn: 7 });

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const rows = await Invite.list('-created_date', 200);
      setInvites(rows || []);
    } catch (err) {
      console.error('Error fetching invites:', err);
      error('Error', 'Failed to fetch invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvites(); }, []);

  const logAction = (action, entityId, details) => {
    AuditLog.create({ actor_email: user?.email, action, entity_type: 'Invite', entity_id: entityId, details }).catch(() => {});
  };

  const handleCreateInvite = async () => {
    if (!inviteForm.email) {
      error('Missing email', 'Please enter an email address');
      return;
    }
    setCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + inviteForm.expiresIn);

      await base44.users.inviteUser(inviteForm.email, inviteForm.role === 'admin' ? 'admin' : 'user');
      const created = await Invite.create({
        email: inviteForm.email,
        role: inviteForm.role,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        invited_by_email: user?.email,
      });

      setInvites(prev => [created, ...prev]);
      logAction('invite.create', created.id, `Invited ${inviteForm.email} as ${inviteForm.role}`);
      success('Sent', `Invitation sent to ${inviteForm.email}`);
      setShowModal(false);
      setInviteForm({ email: '', role: 'artist', expiresIn: 7 });
    } catch (err) {
      console.error('Error creating invite:', err);
      error('Failed', 'Failed to send invite');
    } finally {
      setCreating(false);
    }
  };

  const handleResendInvite = async (invite) => {
    try {
      await base44.users.inviteUser(invite.email, invite.role === 'admin' ? 'admin' : 'user');
      success('Sent', 'Invite resent successfully');
      logAction('invite.resend', invite.id, `Resent invite to ${invite.email}`);
    } catch (err) {
      console.error('Error resending invite:', err);
      error('Failed', 'Failed to resend invite');
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    try {
      await Invite.delete(inviteId);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      logAction('invite.delete', inviteId, 'Deleted invite');
      success('Deleted', 'Invite deleted successfully');
    } catch (err) {
      console.error('Error deleting invite:', err);
      error('Failed', 'Failed to delete invite');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invites Management</h1>
          <p className="text-gray-600 mt-1">Manage user invitations</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Create Invite
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Total Invites: {invites.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Accepted: {invites.filter(i => i.status === 'accepted').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Pending: {invites.filter(i => i.status === 'pending').length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invites.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No invites yet</td></tr>
              )}
              {invites.map(invite => (
                <tr key={invite.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">{invite.role}</span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(invite.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invite.created_date ? new Date(invite.created_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : 'N/A'}
                    {isExpired(invite.expires_at) && <span className="ml-2 text-xs text-red-600">(Expired)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {invite.status === 'pending' && !isExpired(invite.expires_at) && (
                        <Button variant="ghost" size="sm" onClick={() => handleResendInvite(invite)} title="Resend Invite" className="p-1">
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteInvite(invite.id)} title="Delete Invite" className="p-1">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Invite</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (Days)</label>
                <input
                  type="number"
                  value={inviteForm.expiresIn}
                  onChange={(e) => setInviteForm({ ...inviteForm, expiresIn: parseInt(e.target.value) || 7 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreateInvite} disabled={creating} className="bg-black text-white hover:bg-gray-800">
                {creating ? 'Sending...' : 'Create Invite'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Mail, Plus, Copy, Trash2, Send, Clock, CheckCircle, XCircle, Users, Filter } from 'lucide-react';

export default function AdminInvitesManagementPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'artist',
    expiresIn: 7
  });

  const roles = ['admin', 'artist', 'team', 'client', 'project_owner', 'backer'];

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchInvites = async () => {
      try {
        // In a real app, fetch from Invites entity
        const mockInvites = [
          { id: 1, email: 'newuser@example.com', role: 'artist', status: 'pending', createdAt: '2026-06-28T10:00:00', expiresAt: '2026-07-05T10:00:00', token: 'abc123xyz' },
          { id: 2, email: 'client@company.com', role: 'client', status: 'pending', createdAt: '2026-06-27T15:30:00', expiresAt: '2026-07-04T15:30:00', token: 'def456uvw' },
          { id: 3, email: 'team@studio.com', role: 'team', status: 'accepted', createdAt: '2026-06-26T09:00:00', expiresAt: '2026-07-03T09:00:00', token: 'ghi789rst' },
          { id: 4, email: 'expired@test.com', role: 'artist', status: 'expired', createdAt: '2026-06-15T10:00:00', expiresAt: '2026-06-22T10:00:00', token: 'jkl012opq' }
        ];
        setInvites(mockInvites);
      } catch (err) {
        console.error('Error fetching invites:', err);
        error('Error', 'Failed to fetch invites');
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, [user]);

  const handleCreateInvite = async () => {
    try {
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + inviteForm.expiresIn);

      const newInvite = {
        id: Date.now(),
        email: inviteForm.email,
        role: inviteForm.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        token
      };

      setInvites([...invites, newInvite]);
      success('Created', 'Invite created successfully');
      setShowModal(false);
      setInviteForm({ email: '', role: 'artist', expiresIn: 7 });
    } catch (err) {
      console.error('Error creating invite:', err);
      error('Failed', 'Failed to create invite');
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      success('Sent', 'Invite resent successfully');
    } catch (err) {
      console.error('Error resending invite:', err);
      error('Failed', 'Failed to resend invite');
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    try {
      setInvites(invites.filter(i => i.id !== inviteId));
      success('Deleted', 'Invite deleted successfully');
    } catch (err) {
      console.error('Error deleting invite:', err);
      error('Failed', 'Failed to delete invite');
    }
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    success('Copied', 'Invite link copied to clipboard');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'accepted':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Accepted</span>;
      case 'expired':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Expired</span>;
      case 'revoked':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Revoked</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const isExpired = (expiresAt) => new Date(expiresAt) < new Date();

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Invites Management</h1>
          <p className="text-gray-600 mt-1">Manage user invitations and access codes</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
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
              <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Create Invite
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invites.map(invite => (
                    <tr key={invite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                            <div className="text-sm text-gray-500 font-mono">{invite.token}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {invite.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invite.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invite.expiresAt).toLocaleDateString()}
                        {isExpired(invite.expiresAt) && (
                          <span className="ml-2 text-xs text-red-600">(Expired)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(invite.token)}
                            title="Copy Invite Link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {invite.status === 'pending' && !isExpired(invite.expiresAt) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendInvite(invite.id)}
                              title="Resend Invite"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvite(invite.id)}
                            title="Delete Invite"
                          >
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
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (Days)</label>
                <input
                  type="number"
                  value={inviteForm.expiresIn}
                  onChange={(e) => setInviteForm({ ...inviteForm, expiresIn: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreateInvite} className="bg-black text-white hover:bg-gray-800">Create Invite</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

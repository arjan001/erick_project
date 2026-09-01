import React, { useState, useEffect } from 'react';
import { Invite } from '@/lib/supabaseEntities';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Copy, Mail, Plus, Trash2, Send, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminInvitesPage() {
  const { success, error: toastError } = useToast();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewInvite, setViewInvite] = useState(null);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'artist' });

  const fetchInvites = async () => {
    try {
      const all = await Invite.list('-created_at', 100);
      setInvites(all || []);
    } catch (err) {
      console.error('Error fetching invites:', err);
      toastError('Load Failed', 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvites(); }, []);

  const handleCreateInvite = async () => {
    if (!newInvite.email) { toastError('Validation', 'Email is required'); return; }
    try {
      const generateInviteCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      
      const inviteCode = generateInviteCode();
      const invite = {
        email: newInvite.email,
        role: newInvite.role,
        status: 'pending',
        invite_code: inviteCode,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      await Invite.create(invite);
      success('Sent', `Invite sent successfully. Code: ${inviteCode}`);
      setNewInvite({ email: '', role: 'artist' });
      setShowModal(false);
      fetchInvites();
    } catch (err) {
      console.error('Error creating invite:', err);
      toastError('Failed', 'Failed to create invite');
    }
  };

  const handleResend = async (invite) => {
    try {
      await Invite.update(invite.id, { status: 'pending', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
      success('Resent', 'Invite resent successfully');
      fetchInvites();
    } catch (err) {
      toastError('Failed', 'Failed to resend invite');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this invite?')) return;
    try {
      await Invite.delete(id);
      success('Deleted', 'Invite deleted');
      fetchInvites();
    } catch (err) {
      toastError('Failed', 'Failed to delete invite');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invites</h1>
          <p className="text-gray-600">Manage user invitations and access</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Create Invite
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Public Invite Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value="https://ericrabar.com/invite/abc123"
                  readOnly
                  className="rounded-lg"
                />
                <Button variant="outline" size="icon" className="rounded-lg">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Share this link to allow users to sign up with default permissions.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Invite Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{invites.filter(i => i.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{invites.filter(i => i.status === 'accepted').length}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{invites.filter(i => i.status === 'expired').length}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invites.length === 0 && <div className="text-center py-8 text-gray-500">No invites yet</div>}
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-gray-600">
                      Role: {invite.role} • Expires: {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(invite.status)}>
                    {invite.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setViewInvite(invite)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {invite.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => handleResend(invite)}>
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(invite.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Invite</h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={newInvite.role}
                  onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="artist">Artist</option>
                  <option value="team">Team</option>
                  <option value="project_owner">Project Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleCreateInvite} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
                <Send className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Invite Details</h2>
              <button onClick={() => setViewInvite(null)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><span className="font-medium text-gray-500">Email:</span> {viewInvite.email}</div>
              <div><span className="font-medium text-gray-500">Role:</span> {viewInvite.role}</div>
              <div><span className="font-medium text-gray-500">Status:</span> <Badge className={getStatusColor(viewInvite.status)}>{viewInvite.status}</Badge></div>
              <div><span className="font-medium text-gray-500">Expires:</span> {viewInvite.expires_at ? new Date(viewInvite.expires_at).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Created:</span> {viewInvite.created_at ? new Date(viewInvite.created_at).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setViewInvite(null)} className="rounded-lg">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

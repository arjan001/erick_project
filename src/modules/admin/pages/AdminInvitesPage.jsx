import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Copy, Mail, Plus, Trash2, Send } from 'lucide-react';

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState([
    { id: 1, email: 'john@example.com', role: 'artist', status: 'pending', expires: '2024-02-15' },
    { id: 2, email: 'jane@example.com', role: 'team', status: 'accepted', expires: '2024-02-10' },
    { id: 3, email: 'mike@example.com', role: 'project_owner', status: 'expired', expires: '2024-01-10' },
  ]);

  const [newInvite, setNewInvite] = useState({ email: '', role: 'artist' });

  const handleCreateInvite = () => {
    if (!newInvite.email) return;
    const invite = {
      id: Date.now(),
      email: newInvite.email,
      role: newInvite.role,
      status: 'pending',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setInvites([...invites, invite]);
    setNewInvite({ email: '', role: 'artist' });
  };

  const handleResend = (id) => {
    console.log('Resending invite:', id);
  };

  const handleDelete = (id) => {
    setInvites(invites.filter(i => i.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invites</h1>
          <p className="text-gray-600">Manage user invitations and access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Invite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Invite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={newInvite.role}
                onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="artist">Artist</option>
                <option value="team">Team</option>
                <option value="project_owner">Project Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button onClick={handleCreateInvite} className="w-full bg-black text-white hover:bg-gray-800">
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </CardContent>
        </Card>

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
                  value="https://studio22.com/invite/abc123"
                  readOnly
                />
                <Button variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Share this link to allow users to sign up with default permissions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Invites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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
                      Role: {invite.role} • Expires: {invite.expires}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(invite.status)}>
                    {invite.status}
                  </Badge>
                  {invite.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => handleResend(invite.id)}>
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
    </div>
  );
}

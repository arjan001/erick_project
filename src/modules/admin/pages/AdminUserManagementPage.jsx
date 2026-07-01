import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Artist, Team, ProjectOwner, Backer, AuditLog } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, Eye, Mail, Star, Building, Users as UsersIcon, DollarSign, X } from 'lucide-react';

const ROLES = ['admin', 'artist', 'team', 'client', 'project_owner', 'backer'];

export default function AdminUserManagementPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'artist' });
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await base44.entities.User.list('-created_date');

      const enrichedUsers = await Promise.all(
        allUsers.map(async (u) => {
          let roleData = null;
          try {
            if (u.role === 'artist' || u.role === 'artist_admin') {
              const rows = await Artist.filter({ email: u.email });
              roleData = rows[0] || null;
            } else if (u.role === 'team' || u.role === 'team_admin') {
              const rows = await Team.filter({ contact_email: u.email });
              roleData = rows[0] || null;
            } else if (u.role === 'client' || u.role === 'project_owner') {
              const rows = await ProjectOwner.filter({ email: u.email });
              roleData = rows[0] || null;
            } else if (u.role === 'backer') {
              const rows = await Backer.filter({ contact_email: u.email });
              roleData = rows[0] || null;
            }
          } catch (err) {
            console.error('Error fetching role data:', err);
          }
          return { ...u, roleData };
        })
      );

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      error('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInviteUser = async () => {
    if (!inviteForm.email) {
      error('Missing email', 'Please enter an email address');
      return;
    }
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteForm.email, inviteForm.role === 'admin' ? 'admin' : 'user');
      success('Invited', `Invitation sent to ${inviteForm.email}`);
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'artist' });
      fetchUsers();
    } catch (err) {
      console.error('Error inviting user:', err);
      error('Failed', 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await base44.entities.User.update(userId, { role: newRole });
      success('Updated', 'User role updated');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      AuditLog.create({ actor_email: user?.email, action: 'user.role_update', entity_type: 'User', entity_id: userId, details: `Changed role to ${newRole}` }).catch(() => {});
    } catch (err) {
      console.error('Error updating role:', err);
      error('Failed', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await base44.entities.User.delete(userId);
      success('Deleted', 'User deleted successfully');
      setUsers(prev => prev.filter(u => u.id !== userId));
      AuditLog.create({ actor_email: user?.email, action: 'user.delete', entity_type: 'User', entity_id: userId, details: 'Deleted user' }).catch(() => {});
    } catch (err) {
      console.error('Error deleting user:', err);
      error('Failed', 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users and their roles</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <span>Total Users: <strong>{users.length}</strong></span>
            <span>Artists: <strong>{users.filter(u => u.role === 'artist').length}</strong></span>
            <span>Clients: <strong>{users.filter(u => u.role === 'client' || u.role === 'project_owner').length}</strong></span>
            <span>Teams: <strong>{users.filter(u => u.role === 'team').length}</strong></span>
            <span>Backers: <strong>{users.filter(u => u.role === 'backer').length}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">No users found</td>
                </tr>
              )}
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {u.full_name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.full_name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      disabled={u.id === user?.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.created_date ? new Date(u.created_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedUser(u); setShowDetailModal(true); }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={u.id === user?.id}
                        onClick={() => handleDeleteUser(u.id)}
                        title="Delete"
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

      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {selectedUser.full_name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900">{selectedUser.full_name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email}</div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 bg-indigo-100 text-indigo-800 capitalize">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <div className="text-sm font-medium text-gray-900">{selectedUser.created_date ? new Date(selectedUser.created_date).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {(selectedUser.role === 'artist' || selectedUser.role === 'artist_admin') && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center"><Star className="w-4 h-4 mr-2" />Artist Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Specialty</label><div className="text-sm text-gray-900 capitalize">{selectedUser.roleData.role || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Based In</label><div className="text-sm text-gray-900">{[selectedUser.roleData.based_in_city, selectedUser.roleData.based_in_country].filter(Boolean).join(', ') || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><div className="text-sm text-gray-900 capitalize">{selectedUser.roleData.status || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Website</label><div className="text-sm text-gray-900">{selectedUser.roleData.website || 'N/A'}</div></div>
                  </div>
                </div>
              )}

              {(selectedUser.role === 'client' || selectedUser.role === 'project_owner') && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center"><Building className="w-4 h-4 mr-2" />Client Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Company</label><div className="text-sm text-gray-900">{selectedUser.roleData.company || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Phone</label><div className="text-sm text-gray-900">{selectedUser.roleData.phone || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Website</label><div className="text-sm text-gray-900">{selectedUser.roleData.website || 'N/A'}</div></div>
                  </div>
                </div>
              )}

              {(selectedUser.role === 'team' || selectedUser.role === 'team_admin') && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center"><UsersIcon className="w-4 h-4 mr-2" />Team Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Team Name</label><div className="text-sm text-gray-900">{selectedUser.roleData.team_name || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Team Size</label><div className="text-sm text-gray-900">{selectedUser.roleData.team_size || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Based In</label><div className="text-sm text-gray-900">{[selectedUser.roleData.city, selectedUser.roleData.country].filter(Boolean).join(', ') || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><div className="text-sm text-gray-900 capitalize">{selectedUser.roleData.status || 'N/A'}</div></div>
                  </div>
                </div>
              )}

              {selectedUser.role === 'backer' && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center"><DollarSign className="w-4 h-4 mr-2" />Backer Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Organization</label><div className="text-sm text-gray-900">{selectedUser.roleData.organization_name || 'N/A'}</div></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><div className="text-sm text-gray-900 capitalize">{selectedUser.roleData.status || 'N/A'}</div></div>
                  </div>
                </div>
              )}

              {!selectedUser.roleData && selectedUser.role !== 'admin' && (
                <div className="pt-4 border-t text-sm text-gray-500">No profile record found for this user yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Mail className="w-5 h-5" />Invite User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button onClick={handleInviteUser} disabled={inviting} className="bg-black text-white hover:bg-gray-800">
                {inviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
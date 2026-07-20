import React, { useState, useEffect } from 'react';
import { adminUsersApi } from '../api/adminUsers.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Shield, User, Mail, Eye, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-gray-200 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700'
};

const ROLE_STYLES = {
  admin: 'bg-red-100 text-red-800',
  artist_admin: 'bg-blue-100 text-blue-800',
  team_admin: 'bg-green-100 text-green-800',
  project_admin: 'bg-purple-100 text-purple-800',
  content_manager: 'bg-orange-100 text-orange-800',
  finance_manager: 'bg-yellow-100 text-yellow-800',
  support: 'bg-gray-100 text-gray-800'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_key: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        adminUsersApi.getAllUsers(),
        adminUsersApi.getAllRoles()
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setSaving(true);
    try {
      await adminUsersApi.createUser(newUserForm);
      setShowAddDialog(false);
      setNewUserForm({ email: '', password: '', first_name: '', last_name: '', role_key: '' });
      await fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      await adminUsersApi.updateUser(editingUser.id, editingUser);
      setShowEditDialog(false);
      setEditingUser(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminUsersApi.deleteUser(userId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const userRoleKey = user.user_roles?.[0]?.roles?.role_key;
    const matchesRole = filterRole === 'all' || userRoleKey === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getUserRole = (user) => {
    return user.user_roles?.[0]?.roles?.role_key || 'admin';
  };

  const getUserRoleName = (user) => {
    return user.user_roles?.[0]?.roles?.role_name || 'Administrator';
  };

  const getRoleBadge = (roleKey) => {
    return ROLE_STYLES[roleKey] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System User Management</h1>
          <p className="text-gray-600">Create and manage system admin users with role-based permissions</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.role_key} value={role.role_key}>{role.role_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No users found</td></tr>
              )}
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(getUserRole(user))}`}>
                      {getUserRoleName(user)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[user.is_active ? 'active' : 'inactive']}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)} className="p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setShowEditDialog(true); }} className="p-1">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{filteredUsers.length} total · page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New System User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={newUserForm.first_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={newUserForm.last_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUserForm.role_key} onValueChange={(value) => setNewUserForm({ ...newUserForm, role_key: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.role_key} value={role.role_key}>{role.role_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={editingUser?.first_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={editingUser?.last_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editingUser?.user_roles?.[0]?.roles?.role_key || ''} onValueChange={(value) => setEditingUser({ ...editingUser, role_key: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.role_key} value={role.role_key}>{role.role_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={editingUser?.is_active || false}
                onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</div>
                  <div className="text-gray-500">{selectedUser.email}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleBadge(getUserRole(selectedUser))}`}>
                    {getUserRoleName(selectedUser)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium text-gray-500">Status:</span> {selectedUser.is_active ? 'Active' : 'Inactive'}</div>
                <div><span className="font-medium text-gray-500">Joined:</span> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)} className="rounded-lg">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

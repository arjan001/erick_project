import React, { useState, useEffect } from 'react';
import { adminUsersApi } from '../api/adminUsers.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Shield, User, Mail, Eye, X, ChevronLeft, ChevronRight, Loader2, MoreVertical, Ban, CheckCircle, AlertTriangle } from 'lucide-react';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  suspended: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Ban },
  inactive: { bg: 'bg-red-100', text: 'text-red-700', icon: X }
};

const ROLE_STYLES = {
  admin: 'bg-indigo-100 text-indigo-700',
  artist_admin: 'bg-blue-100 text-blue-700',
  team_admin: 'bg-emerald-100 text-emerald-700',
  project_admin: 'bg-purple-100 text-purple-700',
  content_manager: 'bg-orange-100 text-orange-700',
  finance_manager: 'bg-amber-100 text-amber-700',
  support: 'bg-gray-100 text-gray-700'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
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

  const handleDeleteUser = async () => {
    setSaving(true);
    try {
      await adminUsersApi.deleteUser(selectedUser.id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendUser = async () => {
    setSaving(true);
    try {
      await adminUsersApi.updateUser(selectedUser.id, { is_active: !selectedUser.is_active });
      setShowSuspendDialog(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const userRoleKey = user.user_roles?.[0]?.roles?.role_key;
    const matchesRole = filterRole === 'all' || userRoleKey === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && user.is_active) ||
                          (filterStatus === 'suspended' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
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
    return ROLE_STYLES[roleKey] || 'bg-gray-100 text-gray-700';
  };

  const getStatusStyle = (isActive) => {
    return isActive ? STATUS_STYLES.active : STATUS_STYLES.suspended;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Admin Users</h1>
            <p className="text-gray-600 mt-1">Create and manage system admin users with role-based permissions</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Suspended</p>
                <p className="text-xl font-bold text-amber-600">{users.filter(u => !u.is_active).length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Ban className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Roles</p>
                <p className="text-xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-sm"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.role_key} value={role.role_key}>{role.role_name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">No users found</td></tr>
              )}
              {paginatedUsers.map((user) => {
                const statusStyle = getStatusStyle(user.is_active);
                const StatusIcon = statusStyle.icon;
                const hasDeletionRequest = user.deletion_requested_at || user.scheduled_deletion_date;
                return (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${hasDeletionRequest ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.first_name?.[0] || user.email?.[0] || 'U'}
                          </div>
                          {hasDeletionRequest && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                              <AlertTriangle className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                            {hasDeletionRequest && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Deletion Requested
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {hasDeletionRequest && user.scheduled_deletion_date && (
                            <p className="text-xs text-red-600 mt-1">
                              Deleting on {new Date(user.scheduled_deletion_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(getUserRole(user))}`}>
                        {getUserRoleName(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)} className="p-2 hover:bg-gray-100">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setShowEditDialog(true); }} className="p-2 hover:bg-gray-100">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowSuspendDialog(true); }} className="p-2 hover:bg-amber-50">
                          <Ban className="w-4 h-4 text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }} className="p-2 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">{filteredUsers.length} total · page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
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
            <DialogTitle className="text-xl">Create New System User</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={newUserForm.first_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={newUserForm.last_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUserForm.role_key} onValueChange={(value) => setNewUserForm({ ...newUserForm, role_key: value })}>
                <SelectTrigger className="rounded-xl">
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
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
            <DialogTitle className="text-xl">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={editingUser?.first_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={editingUser?.last_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editingUser?.user_roles?.[0]?.roles?.role_key || ''} onValueChange={(value) => setEditingUser({ ...editingUser, role_key: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.role_key} value={role.role_key}>{role.role_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="active"
                checked={editingUser?.is_active || false}
                onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Are you sure you want to delete <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleDeleteUser} disabled={saving} className="bg-red-600 hover:bg-red-700 rounded-xl">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedUser?.is_active ? 'Suspend User' : 'Activate User'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              {selectedUser?.is_active 
                ? <>Are you sure you want to suspend <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>? They will not be able to access the system.</>
                : <>Are you sure you want to activate <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>? They will regain access to the system.</>
              }
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSuspendUser} disabled={saving} className={selectedUser?.is_active ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {selectedUser?.is_active ? 'Suspend' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.first_name?.[0] || selectedUser.email?.[0] || 'U'}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</div>
                  <div className="text-gray-500">{selectedUser.email}</div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full mt-2 ${getRoleBadge(getUserRole(selectedUser))}`}>
                    {getUserRoleName(selectedUser)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">{selectedUser.is_active ? 'Active' : 'Suspended'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-semibold text-gray-900">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)} className="rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






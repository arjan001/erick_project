import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Shield, UserCheck, UserX, Filter, Download, Mail, Calendar, Activity, Eye, Briefcase, Users as UsersIcon, Building, DollarSign, Star } from 'lucide-react';

export default function AdminUserManagementPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewUserType, setViewUserType] = useState('all');
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    role: 'artist',
    status: 'active'
  });

  const roles = ['admin', 'artist', 'team', 'client', 'project_owner', 'backer'];
  const statuses = ['active', 'inactive', 'suspended', 'pending'];

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

    const fetchUsers = async () => {
      try {
        const allUsers = await base44.entities.User.list();
        
        const enrichedUsers = await Promise.all(
          allUsers.map(async (u) => {
            let roleData = null;
            try {
              if (u.role === 'artist') {
                const artist = await base44.entities.Artist.filter({ email: u.email });
                roleData = artist[0] || null;
              } else if (u.role === 'team') {
                const team = await base44.entities.Team.filter({ email: u.email });
                roleData = team[0] || null;
              } else if (u.role === 'client' || u.role === 'project_owner') {
                const client = await base44.entities.ProjectOwner.filter({ email: u.email });
                roleData = client[0] || null;
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

    fetchUsers();
  }, [user]);

  const handleCreateUser = async () => {
    try {
      await base44.entities.User.create({
        email: userForm.email,
        full_name: userForm.full_name,
        role: userForm.role,
        status: userForm.status,
        created_at: new Date().toISOString()
      });

      success('Success', 'User created successfully');
      setShowModal(false);
      setUserForm({ email: '', full_name: '', role: 'artist', status: 'active' });
      
      const allUsers = await base44.entities.User.list();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error creating user:', err);
      error('Failed', 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await base44.entities.User.update(userId, updates);
      success('Success', 'User updated successfully');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    } catch (err) {
      console.error('Error updating user:', err);
      error('Failed', 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await base44.entities.User.delete(userId);
      success('Deleted', 'User deleted successfully');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      error('Failed', 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await handleUpdateUser(userId, { status: newStatus });
  };

  const handleRoleChange = async (userId, newRole) => {
    await handleUpdateUser(userId, { role: newRole });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users, roles, and permissions</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
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
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={viewUserType}
                    onChange={(e) => setViewUserType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="artist">Artists</option>
                    <option value="client">Clients</option>
                    <option value="team">Teams</option>
                    <option value="backer">Backers</option>
                  </select>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span>Total Users: <strong>{users.length}</strong></span>
                <span>Active: <strong>{users.filter(u => u.status === 'active').length}</strong></span>
                <span>Inactive: <strong>{users.filter(u => u.status === 'inactive').length}</strong></span>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {u.full_name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{u.full_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                            {u.role === 'artist' && u.roleData && (
                              <div className="text-xs text-gray-400">Skills: {u.roleData.skills?.slice(0, 2).join(', ') || 'N/A'}</div>
                            )}
                            {u.role === 'client' && u.roleData && (
                              <div className="text-xs text-gray-400">Company: {u.roleData.company_name || 'N/A'}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          u.status === 'active' ? 'bg-green-100 text-green-800' :
                          u.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          u.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
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
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
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
        </div>
      </main>

      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>✕</Button>
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
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedUser.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <div className="text-sm font-medium text-gray-900 capitalize">{selectedUser.role}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="text-sm font-medium text-gray-900">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {selectedUser.role === 'artist' && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Artist Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Skills</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.skills?.join(', ') || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.experience_years || 'N/A'} years</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Portfolio URL</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.portfolio_url || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                      <div className="text-sm text-gray-900">${selectedUser.roleData.hourly_rate || 'N/A'}/hr</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === 'client' && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Client Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.company_name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.industry || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Projects Posted</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.projects_count || 0}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Budget Range</label>
                      <div className="text-sm text-gray-900">${selectedUser.roleData.min_budget || 0} - ${selectedUser.roleData.max_budget || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === 'team' && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Team Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Team Name</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.team_name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Team Size</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.team_size || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialization</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.specialization || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === 'backer' && selectedUser.roleData && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Backer Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Backed</label>
                      <div className="text-sm text-gray-900">${selectedUser.roleData.total_backed || 0}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Projects Backed</label>
                      <div className="text-sm text-gray-900">{selectedUser.roleData.projects_backed_count || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreateUser} className="bg-black text-white hover:bg-gray-800">Create User</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

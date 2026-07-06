import React, { useState, useEffect } from 'react';
import { Artist, Team, ProjectOwner, Backer } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Shield, User, Mail, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-gray-200 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700'
};

const ROLE_STYLES = {
  admin: 'bg-red-100 text-red-800',
  artist: 'bg-blue-100 text-blue-800',
  team: 'bg-green-100 text-green-800',
  project_owner: 'bg-purple-100 text-purple-800',
  backer: 'bg-yellow-100 text-yellow-800'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch from all role tables
      const [artists, teams, projectOwners, backers] = await Promise.all([
        Artist.list('-created_at', 100),
        Team.list('-created_at', 100),
        ProjectOwner.list('-created_at', 100),
        Backer.list('-created_at', 100)
      ]);

      // Map to user-like structure
      const allUsers = [
        ...artists.map(a => ({ ...a, role: 'artist', displayName: a.full_name, displayEmail: a.email })),
        ...teams.map(t => ({ ...t, role: 'team', displayName: t.team_name, displayEmail: t.contact_email })),
        ...projectOwners.map(p => ({ ...p, role: 'project_owner', displayName: p.full_name, displayEmail: p.email })),
        ...backers.map(b => ({ ...b, role: 'backer', displayName: b.organization_name, displayEmail: b.contact_email }))
      ];

      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getRoleBadge = (role) => {
    return ROLE_STYLES[role] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
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
              <option value="admin">Admin</option>
              <option value="artist">Artist</option>
              <option value="team">Team</option>
              <option value="project_owner">Project Owner</option>
              <option value="backer">Backer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">No users found</td></tr>
              )}
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'Unknown'}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.displayEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[user.status] || 'bg-gray-100 text-gray-700'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
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
                  <div className="text-lg font-medium text-gray-900">{selectedUser.displayName || 'Unknown'}</div>
                  <div className="text-gray-500">{selectedUser.displayEmail}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium text-gray-500">Status:</span> {selectedUser.status || 'active'}</div>
                <div><span className="font-medium text-gray-500">Joined:</span> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</div>
              </div>
              {selectedUser.role === 'artist' && (
                <>
                  <div><span className="font-medium text-gray-500">Specialty:</span> {selectedUser.skills || 'N/A'}</div>
                  <div><span className="font-medium text-gray-500">Location:</span> {[selectedUser.based_in_city, selectedUser.based_in_country].filter(Boolean).join(', ') || 'N/A'}</div>
                </>
              )}
              {selectedUser.role === 'team' && (
                <>
                  <div><span className="font-medium text-gray-500">Team Size:</span> {selectedUser.team_size || 'N/A'}</div>
                  <div><span className="font-medium text-gray-500">Location:</span> {[selectedUser.location, selectedUser.country].filter(Boolean).join(', ') || 'N/A'}</div>
                </>
              )}
              {selectedUser.role === 'project_owner' && (
                <>
                  <div><span className="font-medium text-gray-500">Company:</span> {selectedUser.company || 'N/A'}</div>
                  <div><span className="font-medium text-gray-500">Phone:</span> {selectedUser.phone || 'N/A'}</div>
                </>
              )}
              {selectedUser.role === 'backer' && (
                <>
                  <div><span className="font-medium text-gray-500">Organization:</span> {selectedUser.organization_name || 'N/A'}</div>
                  <div><span className="font-medium text-gray-500">Budget Range:</span> {selectedUser.budget_range || 'N/A'}</div>
                </>
              )}
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

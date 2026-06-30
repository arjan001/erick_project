import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Unlock, Plus, Save, RefreshCw, Users, Settings, AlertTriangle } from 'lucide-react';

export default function AdminRolesPermissionsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Define comprehensive permissions for the system
  const permissionCategories = {
    'User Management': [
      { id: 'users.view', name: 'View Users', description: 'Can view user list and details' },
      { id: 'users.create', name: 'Create Users', description: 'Can create new users' },
      { id: 'users.edit', name: 'Edit Users', description: 'Can edit user information' },
      { id: 'users.delete', name: 'Delete Users', description: 'Can delete users' },
      { id: 'users.impersonate', name: 'Impersonate Users', description: 'Can login as other users' }
    ],
    'Role Management': [
      { id: 'roles.view', name: 'View Roles', description: 'Can view roles and permissions' },
      { id: 'roles.create', name: 'Create Roles', description: 'Can create new roles' },
      { id: 'roles.edit', name: 'Edit Roles', description: 'Can edit role permissions' },
      { id: 'roles.delete', name: 'Delete Roles', description: 'Can delete roles' }
    ],
    'Content Management': [
      { id: 'content.view', name: 'View Content', description: 'Can view all content' },
      { id: 'content.create', name: 'Create Content', description: 'Can create content' },
      { id: 'content.edit', name: 'Edit Content', description: 'Can edit content' },
      { id: 'content.delete', name: 'Delete Content', description: 'Can delete content' },
      { id: 'content.publish', name: 'Publish Content', description: 'Can publish content' },
      { id: 'content.moderate', name: 'Moderate Content', description: 'Can moderate and approve content' }
    ],
    'Jobs & Projects': [
      { id: 'jobs.view', name: 'View Jobs', description: 'Can view job postings' },
      { id: 'jobs.create', name: 'Create Jobs', description: 'Can create job postings' },
      { id: 'jobs.edit', name: 'Edit Jobs', description: 'Can edit job postings' },
      { id: 'jobs.delete', name: 'Delete Jobs', description: 'Can delete job postings' },
      { id: 'applications.view', name: 'View Applications', description: 'Can view job applications' },
      { id: 'applications.manage', name: 'Manage Applications', description: 'Can approve/reject applications' }
    ],
    'Messaging & Network': [
      { id: 'messages.view', name: 'View Messages', description: 'Can view messages' },
      { id: 'messages.send', name: 'Send Messages', description: 'Can send messages' },
      { id: 'connections.view', name: 'View Connections', description: 'Can view user connections' },
      { id: 'connections.manage', name: 'Manage Connections', description: 'Can manage connection requests' }
    ],
    'Financial': [
      { id: 'finance.view', name: 'View Financials', description: 'Can view financial data' },
      { id: 'finance.manage', name: 'Manage Financials', description: 'Can manage payments and transactions' },
      { id: 'finance.reports', name: 'Financial Reports', description: 'Can generate financial reports' }
    ],
    'Settings & Configuration': [
      { id: 'settings.general', name: 'General Settings', description: 'Can modify general settings' },
      { id: 'settings.seo', name: 'SEO Settings', description: 'Can modify SEO settings' },
      { id: 'settings.api', name: 'API Settings', description: 'Can modify API settings' },
      { id: 'settings.payment', name: 'Payment Settings', description: 'Can modify payment gateway settings' },
      { id: 'settings.email', name: 'Email Settings', description: 'Can modify email configuration' }
    ],
    'Audit & Logs': [
      { id: 'audit.view', name: 'View Audit Logs', description: 'Can view audit logs' },
      { id: 'audit.export', name: 'Export Logs', description: 'Can export audit logs' },
      { id: 'audit.delete', name: 'Delete Logs', description: 'Can delete audit logs' }
    ]
  };

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

    const fetchRoles = async () => {
      try {
        // In a real app, this would fetch from a Roles entity
        // For now, we'll use default roles
        const defaultRoles = [
          {
            id: 'admin',
            name: 'Administrator',
            description: 'Full system access',
            permissions: Object.values(permissionCategories).flat().map(p => p.id),
            userCount: 0
          },
          {
            id: 'artist_admin',
            name: 'Artist Admin',
            description: 'Manage artists and content',
            permissions: [
              'users.view', 'users.edit',
              'roles.view',
              'content.view', 'content.create', 'content.edit', 'content.publish', 'content.moderate',
              'jobs.view', 'jobs.create', 'jobs.edit',
              'applications.view', 'applications.manage',
              'messages.view', 'connections.view',
              'settings.general', 'settings.seo',
              'audit.view'
            ],
            userCount: 0
          },
          {
            id: 'artist',
            name: 'Artist',
            description: 'Standard artist access',
            permissions: [
              'content.view', 'content.create', 'content.edit',
              'jobs.view', 'jobs.create',
              'applications.view',
              'messages.view', 'messages.send',
              'connections.view', 'connections.manage'
            ],
            userCount: 0
          },
          {
            id: 'client',
            name: 'Client',
            description: 'Client/Project Owner access',
            permissions: [
              'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.delete',
              'applications.view', 'applications.manage',
              'messages.view', 'messages.send',
              'connections.view', 'connections.manage',
              'finance.view'
            ],
            userCount: 0
          },
          {
            id: 'team',
            name: 'Team',
            description: 'Team/Studio access',
            permissions: [
              'content.view', 'content.create', 'content.edit',
              'jobs.view', 'jobs.create',
              'applications.view',
              'messages.view', 'messages.send',
              'connections.view', 'connections.manage'
            ],
            userCount: 0
          },
          {
            id: 'backer',
            name: 'Backer',
            description: 'Backer/Investor access',
            permissions: [
              'jobs.view',
              'finance.view',
              'finance.reports'
            ],
            userCount: 0
          }
        ];

        // Count users per role
        try {
          const allUsers = await base44.entities.User.list();
          const rolesWithCounts = defaultRoles.map(role => ({
            ...role,
            userCount: allUsers.filter(u => u.role === role.id).length
          }));
          setRoles(rolesWithCounts);
        } catch (err) {
          setRoles(defaultRoles);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        error('Error', 'Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      const newRole = {
        id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
        name: newRoleName,
        description: 'Custom role',
        permissions: [],
        userCount: 0
      };

      setRoles([...roles, newRole]);
      success('Success', 'Role created successfully');
      setShowAddRoleModal(false);
      setNewRoleName('');
    } catch (err) {
      console.error('Error creating role:', err);
      error('Failed', 'Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (roleId === 'admin' || roleId === 'artist') {
      error('Cannot Delete', 'Cannot delete default system roles');
      return;
    }

    try {
      setRoles(roles.filter(r => r.id !== roleId));
      success('Deleted', 'Role deleted successfully');
    } catch (err) {
      console.error('Error deleting role:', err);
      error('Failed', 'Failed to delete role');
    }
  };

  const handleTogglePermission = (roleId, permissionId) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
        };
      }
      return role;
    }));
  };

  const handleSavePermissions = async (roleId) => {
    try {
      const role = roles.find(r => r.id === roleId);
      // In a real app, this would save to database
      success('Saved', `Permissions for ${role.name} saved successfully`);
    } catch (err) {
      console.error('Error saving permissions:', err);
      error('Failed', 'Failed to save permissions');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and their system permissions</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Roles List */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Roles</h2>
                  <Button size="sm" onClick={() => setShowAddRoleModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Role
                  </Button>
                </div>
                <div className="divide-y divide-gray-200">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedRole?.id === role.id ? 'bg-gray-50 border-l-4 border-black' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{role.name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.userCount} users
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="col-span-8">
              {selectedRole ? (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedRole.name} Permissions</h2>
                      <p className="text-sm text-gray-500">{selectedRole.permissions.length} permissions granted</p>
                    </div>
                    <Button onClick={() => handleSavePermissions(selectedRole.id)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                  <div className="p-4 space-y-6">
                    {Object.entries(permissionCategories).map(([category, perms]) => (
                      <div key={category}>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          {category}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {perms.map(perm => (
                            <div
                              key={perm.id}
                              className={`p-3 border rounded-lg ${
                                selectedRole.permissions.includes(perm.id)
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedRole.permissions.includes(perm.id)}
                                      onChange={() => handleTogglePermission(selectedRole.id, perm.id)}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="font-medium text-sm">{perm.name}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{perm.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
                  <p className="text-gray-500">Choose a role from the list to view and edit its permissions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Content Moderator"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddRoleModal(false)}>Cancel</Button>
              <Button onClick={handleCreateRole} className="bg-black text-white hover:bg-gray-800">Create Role</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

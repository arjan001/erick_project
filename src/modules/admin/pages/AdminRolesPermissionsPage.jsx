import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RolePermission } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Save, Trash2 } from 'lucide-react';

const PERMISSION_CATEGORIES = {
  'User Management': [
    { id: 'users.view', name: 'View Users', description: 'Can view user list and details' },
    { id: 'users.create', name: 'Create Users', description: 'Can invite new users' },
    { id: 'users.edit', name: 'Edit Users', description: 'Can edit user information' },
    { id: 'users.delete', name: 'Delete Users', description: 'Can delete users' },
  ],
  'Role Management': [
    { id: 'roles.view', name: 'View Roles', description: 'Can view roles and permissions' },
    { id: 'roles.edit', name: 'Edit Roles', description: 'Can edit role permissions' },
    { id: 'roles.delete', name: 'Delete Roles', description: 'Can delete roles' },
  ],
  'Content Management': [
    { id: 'content.view', name: 'View Content', description: 'Can view all content' },
    { id: 'content.edit', name: 'Edit Content', description: 'Can edit content' },
    { id: 'content.delete', name: 'Delete Content', description: 'Can delete content' },
    { id: 'content.moderate', name: 'Moderate Content', description: 'Can moderate and approve content' },
  ],
  'Jobs & Projects': [
    { id: 'jobs.view', name: 'View Jobs', description: 'Can view job postings' },
    { id: 'jobs.edit', name: 'Edit Jobs', description: 'Can edit job postings' },
    { id: 'jobs.delete', name: 'Delete Jobs', description: 'Can delete job postings' },
    { id: 'applications.manage', name: 'Manage Applications', description: 'Can approve/reject applications' },
  ],
  'Messaging & Network': [
    { id: 'messages.view', name: 'View Messages', description: 'Can view messages' },
    { id: 'connections.manage', name: 'Manage Connections', description: 'Can manage connection requests' },
  ],
  'Financial': [
    { id: 'finance.view', name: 'View Financials', description: 'Can view financial data' },
    { id: 'finance.manage', name: 'Manage Financials', description: 'Can manage payments and transactions' },
  ],
  'Settings & Configuration': [
    { id: 'settings.general', name: 'General Settings', description: 'Can modify general settings' },
    { id: 'settings.payment', name: 'Payment Settings', description: 'Can modify payment gateway settings' },
  ],
  'Audit & Logs': [
    { id: 'audit.view', name: 'View Audit Logs', description: 'Can view audit logs' },
    { id: 'audit.delete', name: 'Delete Logs', description: 'Can delete audit logs' },
  ],
};

const DEFAULT_ROLES = [
  { role_id: 'admin', role_name: 'Administrator', description: 'Full system access', is_system_role: true, permissions: Object.values(PERMISSION_CATEGORIES).flat().map(p => p.id) },
  { role_id: 'artist', role_name: 'Artist', description: 'Standard artist access', is_system_role: true, permissions: ['content.view', 'content.edit', 'jobs.view', 'messages.view'] },
  { role_id: 'client', role_name: 'Client', description: 'Client / project owner access', is_system_role: true, permissions: ['jobs.view', 'jobs.edit', 'jobs.delete', 'applications.manage', 'messages.view', 'finance.view'] },
  { role_id: 'team', role_name: 'Team', description: 'Team / studio access', is_system_role: true, permissions: ['content.view', 'content.edit', 'jobs.view', 'messages.view'] },
  { role_id: 'backer', role_name: 'Backer', description: 'Backer / investor access', is_system_role: true, permissions: ['jobs.view', 'finance.view'] },
];

export default function AdminRolesPermissionsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      let rows = await RolePermission.list();
      if (!rows || rows.length === 0) {
        rows = await Promise.all(DEFAULT_ROLES.map(r => RolePermission.create(r)));
      }
      const allUsers = await base44.entities.User.list();
      const withCounts = rows.map(role => ({
        ...role,
        userCount: allUsers.filter(u => u.role === role.role_id).length,
      }));
      setRoles(withCounts);
    } catch (err) {
      console.error('Error fetching roles:', err);
      error('Error', 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const created = await RolePermission.create({
        role_id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
        role_name: newRoleName,
        description: 'Custom role',
        permissions: [],
        is_system_role: false,
      });
      setRoles(prev => [...prev, { ...created, userCount: 0 }]);
      success('Success', 'Role created successfully');
      setShowAddRoleModal(false);
      setNewRoleName('');
    } catch (err) {
      console.error('Error creating role:', err);
      error('Failed', 'Failed to create role');
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.is_system_role) {
      error('Cannot Delete', 'Cannot delete default system roles');
      return;
    }
    if (!window.confirm(`Delete the "${role.role_name}" role?`)) return;
    try {
      await RolePermission.delete(role.id);
      setRoles(prev => prev.filter(r => r.id !== role.id));
      if (selectedRole?.id === role.id) setSelectedRole(null);
      success('Deleted', 'Role deleted successfully');
    } catch (err) {
      console.error('Error deleting role:', err);
      error('Failed', 'Failed to delete role');
    }
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedRole(prev => {
      const hasPermission = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: hasPermission ? prev.permissions.filter(p => p !== permissionId) : [...prev.permissions, permissionId],
      };
    });
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await RolePermission.update(selectedRole.id, { permissions: selectedRole.permissions });
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: selectedRole.permissions } : r));
      success('Saved', `Permissions for ${selectedRole.role_name} saved successfully`);
    } catch (err) {
      console.error('Error saving permissions:', err);
      error('Failed', 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-600 mt-1">Manage user roles and their system permissions</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
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
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedRole?.id === role.id ? 'bg-gray-50 border-l-4 border-black' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{role.role_name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">{role.userCount} users</div>
                      {!role.is_system_role && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }} className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          {selectedRole ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedRole.role_name} Permissions</h2>
                  <p className="text-sm text-gray-500">{selectedRole.permissions.length} permissions granted</p>
                </div>
                <Button onClick={handleSavePermissions} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
              <div className="p-4 space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {perms.map(perm => (
                        <div
                          key={perm.id}
                          className={`p-3 border rounded-lg ${selectedRole.permissions.includes(perm.id) ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRole.permissions.includes(perm.id)}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="font-medium text-sm">{perm.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{perm.description}</p>
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

      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Role</h2>
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
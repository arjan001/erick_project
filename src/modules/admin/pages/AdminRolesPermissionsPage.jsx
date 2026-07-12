import React, { useState, useEffect } from 'react';
import { Role, Permission, RolePermission, UserRole } from '@/lib/supabaseEntities';
import { permissionsService } from '@/lib/permissionsService';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Save, Trash2, X, Users, Search, Settings as SettingsIcon, Lock, Unlock, Copy, Check } from 'lucide-react';

export default function AdminRolesPermissionsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [roles, setRoles] = useState([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedPermissions, setCopiedPermissions] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await Role.list();
      
      // Get user counts for each role
      const rolesWithCounts = await Promise.all(
        rolesData.map(async (role) => {
          try {
            const userRoles = await UserRole.filter({ role_id: role.id, is_active: true });
            return {
              ...role,
              userCount: userRoles.length
            };
          } catch (err) {
            // If user_roles table doesn't exist yet, return 0
            return {
              ...role,
              userCount: 0
            };
          }
        })
      );
      
      setRoles(rolesWithCounts);
    } catch (err) {
      console.error('Error fetching roles:', err);
      // If roles table doesn't exist yet, show empty state
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const grouped = await permissionsService.getAllPermissions();
      setPermissionsByCategory(grouped);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      // If permissions tables don't exist yet, show empty state
      setPermissionsByCategory({});
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const roleKey = newRoleName.toLowerCase().replace(/\s+/g, '_');
      const created = await Role.create({
        role_key: roleKey,
        role_name: newRoleName,
        description: newRoleDescription || 'Custom role',
        is_system_role: false,
        is_active: true
      });
      setRoles(prev => [...prev, { ...created, userCount: 0 }]);
      success('Success', 'Role created successfully');
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
    } catch (err) {
      console.error('Error creating role:', err);
      error('Failed', 'Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!editRoleName.trim()) return;
    try {
      const updated = await Role.update(selectedRole.id, {
        role_name: editRoleName,
        description: editRoleDescription
      });
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, ...updated } : r));
      setSelectedRole({ ...selectedRole, ...updated });
      success('Success', 'Role updated successfully');
      setShowEditRoleModal(false);
    } catch (err) {
      console.error('Error updating role:', err);
      error('Failed', 'Failed to update role');
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.is_system_role) {
      error('Cannot Delete', 'Cannot delete system roles');
      return;
    }
    if (role.userCount > 0) {
      error('Cannot Delete', 'Cannot delete role with assigned users. Please reassign users first.');
      return;
    }
    if (!window.confirm(`Delete the "${role.role_name}" role?`)) return;
    try {
      await permissionsService.deleteRole(role.id);
      setRoles(prev => prev.filter(r => r.id !== role.id));
      if (selectedRole?.id === role.id) setSelectedRole(null);
      success('Deleted', 'Role deleted successfully');
    } catch (err) {
      console.error('Error deleting role:', err);
      error('Failed', 'Failed to delete role');
    }
  };

  const handleTogglePermission = (permissionKey) => {
    setSelectedRole(prev => {
      const hasPermission = prev.permissions?.includes(permissionKey);
      return {
        ...prev,
        permissions: hasPermission 
          ? prev.permissions.filter(p => p !== permissionKey) 
          : [...(prev.permissions || []), permissionKey],
      };
    });
  };

  const handleSelectAllInCategory = (category, select) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const permissionKeys = categoryPermissions.map(p => p.permission_key);
    
    setSelectedRole(prev => {
      const currentPermissions = prev.permissions || [];
      let newPermissions;
      
      if (select) {
        newPermissions = [...new Set([...currentPermissions, ...permissionKeys])];
      } else {
        newPermissions = currentPermissions.filter(p => !permissionKeys.includes(p));
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleCopyPermissions = () => {
    if (selectedRole?.permissions) {
      setCopiedPermissions([...selectedRole.permissions]);
      success('Copied', 'Permissions copied to clipboard');
    }
  };

  const handlePastePermissions = async () => {
    if (copiedPermissions && selectedRole) {
      setSelectedRole(prev => ({ ...prev, permissions: [...copiedPermissions] }));
      success('Pasted', 'Permissions pasted successfully');
    }
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await permissionsService.assignPermissionsToRole(selectedRole.id, selectedRole.permissions);
      success('Saved', `Permissions for ${selectedRole.role_name} saved successfully`);
    } catch (err) {
      console.error('Error saving permissions:', err);
      error('Failed', 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    const permissions = await permissionsService.getRolePermissions(role.id);
    setSelectedRole({ ...role, permissions });
  };

  const filteredRoles = roles.filter(role => 
    role.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.role_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', ...Object.keys(permissionsByCategory)];
  const displayedPermissions = selectedCategory === 'all' 
    ? permissionsByCategory 
    
    : { [selectedCategory]: permissionsByCategory[selectedCategory] };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-1">Manage user roles and their system permissions</p>
          </div>
          <Button onClick={() => setShowAddRoleModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredRoles.map(role => (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRole?.id === role.id ? 'bg-gray-50 border-l-4 border-gray-900' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          {role.is_system_role ? (
                            <Lock className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Unlock className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{role.role_name}</div>
                          <div className="text-xs text-gray-500">{role.role_key}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{role.description}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {role.userCount}
                      </div>
                      {!role.is_system_role && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }} 
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedRole.role_name}</h2>
                    <p className="text-sm text-gray-500">{selectedRole.permissions?.length || 0} permissions granted</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditRoleName(selectedRole.role_name);
                      setEditRoleDescription(selectedRole.description);
                      setShowEditRoleModal(true);
                    }}
                    disabled={selectedRole.is_system_role}
                  >
                    Edit Role
                  </Button>
                  <Button onClick={handleSavePermissions} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyPermissions}
                    disabled={!selectedRole.permissions?.length}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePastePermissions}
                    disabled={!copiedPermissions}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Paste
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                {Object.entries(displayedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        {category}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectAllInCategory(category, true)}
                          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleSelectAllInCategory(category, false)}
                          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map(perm => (
                        <div
                          key={perm.id}
                          className={`p-3 border rounded-lg transition-all ${
                            selectedRole.permissions?.includes(perm.permission_key) 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRole.permissions?.includes(perm.permission_key)}
                              onChange={() => handleTogglePermission(perm.permission_key)}
                              className="w-4 h-4 rounded border-gray-300 mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="font-medium text-sm text-gray-900">{perm.permission_name}</span>
                              <p className="text-xs text-gray-500 mt-1">{perm.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{perm.module}</span>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{perm.action}</span>
                              </div>
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
              <p className="text-gray-500">Choose a role from the list to view and edit its permissions</p>
            </div>
          )}
        </div>
      </div>

      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Create New Role</h2>
              <button onClick={() => setShowAddRoleModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="e.g., Content Moderator"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe the role's purpose..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAddRoleModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleCreateRole} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">Create Role</Button>
            </div>
          </div>
        </div>
      )}

      {showEditRoleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Edit Role</h2>
              <button onClick={() => setShowEditRoleModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editRoleDescription}
                  onChange={(e) => setEditRoleDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowEditRoleModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleUpdateRole} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
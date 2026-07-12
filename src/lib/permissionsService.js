import { supabase } from '@/lib/supabase';

class PermissionsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all permissions for a user
   * @param {string} userId - User ID
   * @returns {Promise<string[]>} Array of permission keys
   */
  async getUserPermissions(userId) {
    if (!userId) return [];

    // Check cache
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.permissions;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            role_key
          ),
          role_permissions (
            permission_id,
            permissions (
              permission_key
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        // If table doesn't exist (migration not run yet), return empty array
        if (error.code === '42P01') {
          console.warn('Permissions tables not yet created, returning empty permissions');
          return [];
        }
        throw error;
      }

      // Extract all permission keys
      const permissions = new Set();
      data.forEach(userRole => {
        if (userRole.role_permissions) {
          userRole.role_permissions.forEach(rp => {
            if (rp.permissions) {
              permissions.add(rp.permissions.permission_key);
            }
          });
        }
      });

      const permissionArray = Array.from(permissions);

      // Cache the result
      this.cache.set(userId, {
        permissions: permissionArray,
        timestamp: Date.now()
      });

      return permissionArray;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // Return empty array on error to prevent blocking
      return [];
    }
  }

  /**
   * Check if user has a specific permission
   * @param {string} userId - User ID
   * @param {string} permissionKey - Permission key to check
   * @returns {Promise<boolean>}
   */
  async hasPermission(userId, permissionKey) {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionKey);
  }

  /**
   * Check if user has any of the specified permissions
   * @param {string} userId - User ID
   * @param {string[]} permissionKeys - Array of permission keys
   * @returns {Promise<boolean>}
   */
  async hasAnyPermission(userId, permissionKeys) {
    const permissions = await this.getUserPermissions(userId);
    return permissionKeys.some(key => permissions.includes(key));
  }

  /**
   * Check if user has all of the specified permissions
   * @param {string} userId - User ID
   * @param {string[]} permissionKeys - Array of permission keys
   * @returns {Promise<boolean>}
   */
  async hasAllPermissions(userId, permissionKeys) {
    const permissions = await this.getUserPermissions(userId);
    return permissionKeys.every(key => permissions.includes(key));
  }

  /**
   * Get user roles
   * @param {string} userId - User ID
   * @returns {Promise<string[]>} Array of role keys
   */
  async getUserRoles(userId) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            role_key
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return data.map(ur => ur.roles?.role_key).filter(Boolean);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * Check if user has a specific role
   * @param {string} userId - User ID
   * @param {string} roleKey - Role key to check
   * @returns {Promise<boolean>}
   */
  async hasRole(userId, roleKey) {
    const roles = await this.getUserRoles(userId);
    return roles.includes(roleKey);
  }

  /**
   * Check if user has any of the specified roles
   * @param {string} userId - User ID
   * @param {string[]} roleKeys - Array of role keys
   * @returns {Promise<boolean>}
   */
  async hasAnyRole(userId, roleKeys) {
    const roles = await this.getUserRoles(userId);
    return roleKeys.some(key => roles.includes(key));
  }

  /**
   * Clear cache for a specific user or all users
   * @param {string} userId - Optional user ID to clear cache for
   */
  clearCache(userId) {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get all available permissions grouped by category
   * @returns {Promise<Object>} Permissions grouped by category
   */
  async getAllPermissions() {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('module', { ascending: true });

      if (error) throw error;

      // Group by category
      const grouped = {};
      data.forEach(perm => {
        if (!grouped[perm.category]) {
          grouped[perm.category] = [];
        }
        grouped[perm.category].push(perm);
      });

      return grouped;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return {};
    }
  }

  /**
   * Get all roles
   * @returns {Promise<Array>} Array of roles
   */
  async getAllRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('is_system_role', { ascending: false })
        .order('role_name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  /**
   * Get permissions for a specific role
   * @param {string} roleId - Role ID
   * @returns {Promise<string[]>} Array of permission keys
   */
  async getRolePermissions(roleId) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions (
            permission_key
          )
        `)
        .eq('role_id', roleId);

      if (error) throw error;

      return data.map(rp => rp.permissions?.permission_key).filter(Boolean);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  }

  /**
   * Assign permissions to a role
   * @param {string} roleId - Role ID
   * @param {string[]} permissionKeys - Array of permission keys
   * @returns {Promise<boolean>}
   */
  async assignPermissionsToRole(roleId, permissionKeys) {
    try {
      // First, remove all existing permissions for this role
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Get permission IDs from permission keys
      const { data: permissionsData, error: permError } = await supabase
        .from('permissions')
        .select('id')
        .in('permission_key', permissionKeys);

      if (permError) throw permError;

      // Insert new role permissions
      if (permissionsData && permissionsData.length > 0) {
        const rolePermissions = permissionsData.map(p => ({
          role_id: roleId,
          permission_id: p.id
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (insertError) throw insertError;
      }

      // Clear cache for all users with this role
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error assigning permissions to role:', error);
      return false;
    }
  }

  /**
   * Assign a role to a user
   * @param {string} userId - User ID
   * @param {string} roleKey - Role key
   * @param {string} assignedBy - User ID of who is assigning
   * @returns {Promise<boolean>}
   */
  async assignRoleToUser(userId, roleKey, assignedBy) {
    try {
      // Get role ID from role key
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_key', roleKey)
        .single();

      if (roleError) throw roleError;

      // Assign role to user
      const { error: assignError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleData.id,
          assigned_by: assignedBy,
          is_active: true
        }, {
          onConflict: 'user_id,role_id'
        });

      if (assignError) throw assignError;

      // Clear cache for this user
      this.clearCache(userId);

      return true;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return false;
    }
  }

  /**
   * Remove a role from a user
   * @param {string} userId - User ID
   * @param {string} roleKey - Role key
   * @returns {Promise<boolean>}
   */
  async removeRoleFromUser(userId, roleKey) {
    try {
      // Get role ID from role key
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_key', roleKey)
        .single();

      if (roleError) throw roleError;

      // Remove role from user
      const { error: removeError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleData.id);

      if (removeError) throw removeError;

      // Clear cache for this user
      this.clearCache(userId);

      return true;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData) {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          role_key: roleData.role_key,
          role_name: roleData.role_name,
          description: roleData.description,
          is_system_role: false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update a role
   * @param {string} roleId - Role ID
   * @param {Object} roleData - Role data to update
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(roleId, roleData) {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update({
          role_name: roleData.role_name,
          description: roleData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   * @param {string} roleId - Role ID
   * @returns {Promise<boolean>}
   */
  async deleteRole(roleId) {
    try {
      // Check if it's a system role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('is_system_role')
        .eq('id', roleId)
        .single();

      if (roleError) throw roleError;

      if (roleData.is_system_role) {
        throw new Error('Cannot delete system roles');
      }

      // Delete role (cascade will handle role_permissions and user_roles)
      const { error: deleteError } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (deleteError) throw deleteError;

      // Clear all cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const permissionsService = new PermissionsService();

// Export convenience functions
export const hasPermission = (userId, permissionKey) => 
  permissionsService.hasPermission(userId, permissionKey);

export const hasAnyPermission = (userId, permissionKeys) => 
  permissionsService.hasAnyPermission(userId, permissionKeys);

export const hasAllPermissions = (userId, permissionKeys) => 
  permissionsService.hasAllPermissions(userId, permissionKeys);

export const hasRole = (userId, roleKey) => 
  permissionsService.hasRole(userId, roleKey);

export const hasAnyRole = (userId, roleKeys) => 
  permissionsService.hasAnyRole(userId, roleKeys);

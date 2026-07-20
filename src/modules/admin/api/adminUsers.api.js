import { supabase } from '@/lib/supabase';

export const adminUsersApi = {
  // Get all system users (not entity users like artists/teams)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (
          role_id,
          roles (
            id,
            role_key,
            role_name,
            is_system_role
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create a new system user
  createUser: async (userData) => {
    const { email, password, first_name, last_name, role_key } = userData;
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role: 'admin', // All system users are admins in the old schema sense
          is_system_user: true
        }
      }
    });

    if (authError) throw authError;

    // 2. Create user record in users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        password_hash: 'managed_by_supabase',
        first_name,
        last_name,
        role: 'admin', // Legacy role field
        is_active: true
      })
      .select()
      .single();

    if (userError) throw userError;

    // 3. Assign role from roles/permissions system
    if (role_key) {
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('role_key', role_key)
        .single();

      if (role) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: userRecord.id,
            role_id: role.id,
            assigned_by: null, // Will be set by current admin
            is_active: true
          });
      }
    }

    return userRecord;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const { first_name, last_name, is_active, role_key } = userData;
    
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update role if provided
    if (role_key) {
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('role_key', role_key)
        .single();

      if (role) {
        // Remove existing roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Assign new role
        await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: role.id,
            assigned_by: null,
            is_active: true
          });
      }
    }

    return data;
  },

  // Delete user
  deleteUser: async (userId) => {
    // Delete from Supabase Auth
    await supabase.auth.admin.deleteUser(userId);
    
    // Delete from users table (cascade will handle user_roles)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          role_permissions (
            permissions (
              permission_key,
              permission_name,
              module,
              action,
              resource
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    // Flatten permissions
    const permissions = [];
    data.forEach(userRole => {
      if (userRole.roles?.role_permissions) {
        userRole.roles.role_permissions.forEach(rp => {
          if (rp.permissions) {
            permissions.push(rp.permissions);
          }
        });
      }
    });

    return permissions;
  },

  // Get all available roles
  getAllRoles: async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('role_name');

    if (error) throw error;
    return data;
  }
};

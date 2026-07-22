import { supabase } from '@/lib/supabase';
import auditLogger from '@/lib/auditLogger';

export const adminUsersApi = {
  // Get all system users (not entity users like artists/teams)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles!fk_user_roles_user (
          role_id,
          roles (
            id,
            role_key,
            role_name,
            is_system_role
          )
        )
      `)
      .eq('role', 'admin') // Only fetch system admin users
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    console.log('Fetched users:', data);
    console.log('Number of users:', data?.length);
    return data;
  },

  // Create a new system user
  createUser: async (userData) => {
    const { email, password, first_name, last_name, role_key } = userData;

    console.log('Creating user with data:', { email, first_name, last_name, role_key });

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

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('Auth user created:', authData.user?.id);

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

    if (userError) {
      console.error('User record error:', userError);
      throw userError;
    }

    console.log('User record created:', userRecord);

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

    // Log audit event
    await auditLogger.users.create(userRecord.id, email);

    console.log('User creation complete');
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

    // Log audit event
    await auditLogger.users.update(userId, data.email, userData);

    return data;
  },

  // Delete user
  deleteUser: async (userId) => {
    console.log('Deleting user:', userId);

    // Get user email before deletion for audit log
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    // Delete from users table (cascade will handle user_roles)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user from database:', error);
      throw error;
    }

    // Delete from Supabase Auth (after database delete to avoid auth errors)
    try {
      await supabase.auth.admin.deleteUser(userId);
    } catch (authError) {
      console.error('Error deleting user from auth:', authError);
      // Continue even if auth deletion fails - database record is deleted
    }

    // Log audit event
    if (user) {
      await auditLogger.users.delete(userId, user.email);
    }

    console.log('User deleted successfully');
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
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('role_name');

      if (error) {
        console.error('Error fetching roles:', error);
        console.error('Error details:', error.message, error.code, error.hint);
        throw error;
      }
      
      console.log('Fetched roles:', data);
      console.log('Number of roles:', data?.length);
      return data || [];
    } catch (error) {
      console.error('getAllRoles error:', error);
      console.error('Error message:', error.message);
      return [];
    }
  }
};

import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
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
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) throw error;

        // Flatten permissions
        const userPermissions = [];
        data.forEach(userRole => {
          if (userRole.roles?.role_permissions) {
            userRole.roles.role_permissions.forEach(rp => {
              if (rp.permissions) {
                userPermissions.push(rp.permissions.permission_key);
              }
            });
          }
        });

        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id]);

  const hasPermission = (permissionKey) => {
    return permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys) => {
    return permissionKeys.some(key => permissions.includes(key));
  };

  const hasAllPermissions = (permissionKeys) => {
    return permissionKeys.every(key => permissions.includes(key));
  };

  const hasModuleAccess = (module) => {
    return permissions.some(p => p.startsWith(`${module}.`));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess
  };
};

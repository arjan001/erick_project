import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function RoleGuard({ roles, children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!isLoadingAuth && user && !roles.includes(user.role)) {
      navigate('/');
    }
  }, [isAuthenticated, isLoadingAuth, user, roles, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return children;
}

// Factory function to create guard components with specific roles
export function createRoleGuard(roles) {
  return function RoleGuardWrapper({ children }) {
    return <RoleGuard roles={roles}>{children}</RoleGuard>;
  };
}

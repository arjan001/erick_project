import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export function GuestGuard({ children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      const redirects = {
        artist: '/artistdashboard',
        artist_admin: '/artistdashboard',
        team: '/teamdashboard',
        team_admin: '/teamdashboard',
        client: '/clientdashboard',
        project_owner: '/clientdashboard',
        backer: '/backerdashboard',
        admin: '/Admin'
      };
      const targetRoute = redirects[user.role] || '/';
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, user, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
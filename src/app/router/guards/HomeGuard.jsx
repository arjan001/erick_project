import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_REDIRECTS = {
  artist: '/artistdashboard',
  artist_admin: '/artistdashboard',
  team: '/teamdashboard',
  team_admin: '/teamdashboard',
  client: '/clientdashboard',
  project_owner: '/clientdashboard',
  backer: '/backerdashboard',
  admin: '/Admin'
};

// Wraps the "/" landing page: logged-in users get sent straight to their dashboard,
// guests (and roles with no dashboard) see the landing page as normal.
export function HomeGuard({ children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user) {
      const target = ROLE_REDIRECTS[user.role];
      if (target) navigate(target, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, user, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated && user && ROLE_REDIRECTS[user.role]) {
    return null;
  }

  return children;
}
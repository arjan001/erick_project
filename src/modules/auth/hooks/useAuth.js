import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export function useAuth() {
  const [session, setSession] = useState(authService.session);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe(setSession);
    return unsubscribe;
  }, []);

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading,
    session,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    redirectToLogin: authService.redirectToLogin.bind(authService)
  };
}

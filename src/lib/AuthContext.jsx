import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

function buildUserFromSupabase(session) {
  if (!session?.user) return null;
  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    email: session.user.email,
    full_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
    role: meta.role || 'artist',
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check Supabase session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = buildUserFromSupabase(session);
        setUser(u);
        setIsAuthenticated(true);
        localStorage.setItem('studio22_user', JSON.stringify(u));
      } else {
        // Fallback to localStorage demo session
        const stored = localStorage.getItem('studio22_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('studio22_user');
          }
        }
      }
      setIsLoadingAuth(false);
    });

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const u = buildUserFromSupabase(session);
        setUser(u);
        setIsAuthenticated(true);
        localStorage.setItem('studio22_user', JSON.stringify(u));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('studio22_user', JSON.stringify(userData));
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('studio22_user');
    localStorage.removeItem('studio22_team');
    if (shouldRedirect) window.location.href = '/SignIn';
  };

  const navigateToLogin = () => { window.location.href = '/SignIn'; };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, login, logout, navigateToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
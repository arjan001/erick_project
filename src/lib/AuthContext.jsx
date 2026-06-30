import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

function buildUserFromSupabase(supaUser) {
  if (!supaUser) return null;
  const meta = supaUser.user_metadata || {};
  return {
    id: supaUser.id,
    email: supaUser.email,
    full_name: meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'User',
    role: meta.role || 'artist',
  };
}

// Ensure an entity profile exists for new Supabase users
async function ensureProfile(supaUser) {
  if (!supaUser) return;
  const role = supaUser.user_metadata?.role || 'artist';
  const full_name = supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User';
  try {
    if (role === 'artist') {
      const existing = await base44.entities.Artist.filter({ email: supaUser.email });
      if (!existing || existing.length === 0) {
        await base44.entities.Artist.create({
          email: supaUser.email,
          full_name,
          role: 'director', // default specialty
          status: 'pending',
        });
      }
    } else if (role === 'team') {
      const existing = await base44.entities.Team.filter({ contact_email: supaUser.email });
      if (!existing || existing.length === 0) {
        await base44.entities.Team.create({
          team_name: full_name,
          team_code: 'TM' + Date.now().toString().slice(-4),
          contact_email: supaUser.email,
          contact_name: full_name,
          city: '',
          country: '',
          status: 'pending',
        });
      }
    } else if (role === 'client' || role === 'project_owner') {
      const existing = await base44.entities.ProjectOwner.filter({ email: supaUser.email });
      if (!existing || existing.length === 0) {
        await base44.entities.ProjectOwner.create({
          email: supaUser.email,
          full_name,
        });
      }
    }
  } catch (err) {
    console.error('ensureProfile error:', err);
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const applySession = (supaUser) => {
    const u = buildUserFromSupabase(supaUser);
    if (u) {
      setUser(u);
      setIsAuthenticated(true);
      localStorage.setItem('studio22_user', JSON.stringify(u));
    }
    return u;
  };

  useEffect(() => {
    // Check Supabase session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applySession(session.user);
        ensureProfile(session.user);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        applySession(session.user);
        if (event === 'SIGNED_IN') {
          ensureProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('studio22_user');
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
import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { Artist, Team, ProjectOwner, Backer } from '@/lib/supabaseEntities';

const AuthContext = createContext();

function buildUserFromSupabase(supaUser) {
  if (!supaUser) return null;
  const meta = supaUser.user_metadata || {};
  return {
    id: supaUser.id,
    email: supaUser.email,
    full_name: meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'User',
    role: meta.role || 'artist',
    // Present only for invited team members — links them to their team's workspace
    // instead of the team owner's own account (matched by contact_email).
    team_id: meta.team_id || null,
  };
}

// Generate a unique invite/referral code for each new user
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'S22-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Ensure an entity profile exists for new Supabase users
async function ensureProfile(supaUser) {
  if (!supaUser) return;
  const role = supaUser.user_metadata?.role || 'artist';
  const full_name = supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User';
  const referredBy = supaUser.user_metadata?.referred_by || null;
  try {
    if (role === 'artist') {
      const existing = await Artist.filter({ email: supaUser.email });
      if (!existing || existing.length === 0) {
        await Artist.create({
          email: supaUser.email,
          full_name,
          role: 'director',
          status: 'pending',
          invite_code: generateInviteCode(),
          referred_by: referredBy,
          onboarding_completed: false,
        });
      }
    } else if (role === 'team') {
      if (supaUser.user_metadata?.team_id) return;
      const existing = await Team.filter({ contact_email: supaUser.email });
      if (!existing || existing.length === 0) {
        await Team.create({
          team_name: supaUser.user_metadata?.team_name || full_name,
          team_code: 'TM' + Date.now().toString().slice(-4),
          contact_email: supaUser.email,
          contact_name: full_name,
          phone: supaUser.user_metadata?.phone || '',
          city: '',
          country: '',
          status: 'pending',
          invite_code: generateInviteCode(),
          referred_by: referredBy,
          onboarding_completed: false,
        });
      }
    } else if (role === 'backer') {
      const existing = await Backer.filter({ contact_email: supaUser.email });
      if (!existing || existing.length === 0) {
        await Backer.create({
          organization_name: full_name,
          contact_email: supaUser.email,
          invite_code: generateInviteCode(),
          referred_by: referredBy,
        });
      }
    } else if (role === 'client' || role === 'project_owner') {
      const existing = await ProjectOwner.filter({ email: supaUser.email });
      if (!existing || existing.length === 0) {
        await ProjectOwner.create({
          email: supaUser.email,
          full_name,
          invite_code: generateInviteCode(),
          referred_by: referredBy,
        });
      }
    }
  } catch (err) {
    console.error('ensureProfile error:', err);
  }
}

// Update the current user's own profile record with a fresh timestamp so others can see them as online
async function updatePresence(u) {
  if (!u?.email) return;
  const now = new Date().toISOString();
  try {
    if (u.role === 'team') {
      if (u.team_id) {
        await Team.update(u.team_id, { last_active: now });
      } else {
        const teams = await Team.filter({ contact_email: u.email });
        if (teams[0]) await Team.update(teams[0].id, { last_active: now });
      }
    } else if (u.role === 'client' || u.role === 'project_owner') {
      const owners = await ProjectOwner.filter({ email: u.email });
      if (owners[0]) await ProjectOwner.update(owners[0].id, { last_active: now });
    } else if (u.role === 'backer') {
      const backers = await Backer.filter({ contact_email: u.email });
      if (backers[0]) await Backer.update(backers[0].id, { last_active: now });
    } else {
      const artists = await Artist.filter({ email: u.email });
      if (artists[0]) await Artist.update(artists[0].id, { last_active: now });
    }
  } catch (err) {
    console.error('presence update error:', err);
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Heartbeat: mark this user active periodically so others see live online status
  useEffect(() => {
    if (!user?.email) return;
    updatePresence(user);
    const interval = setInterval(() => updatePresence(user), 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

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
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.error('signOut error:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('studio22_user');
    localStorage.removeItem('studio22_team');
    localStorage.removeItem('studio22_sidebar_expanded');
    sessionStorage.removeItem('studio22_just_logged_in');
    sessionStorage.removeItem('studio22_onboarding_seen');
    if (shouldRedirect) {
      window.location.href = '/';
    }
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
import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Artist, Team, ProjectOwner, Backer, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';
import auditLogger from '@/lib/auditLogger';

const AuthContext = createContext();

/**
 * Build the app-level user object from a Base44 auth user.
 * Base44 users expose email / full_name / role plus any custom schema fields.
 * The app-specific role (artist/team/client/backer) is resolved from the
 * linked entity records when available; otherwise we fall back to metadata
 * stored on the user or a sensible default.
 */
function buildUser(base44User, appRole) {
  if (!base44User) return null;
  return {
    id: base44User.id,
    email: base44User.email,
    full_name: base44User.full_name || base44User.email?.split('@')[0] || 'User',
    role: appRole || base44User.role || 'artist',
    is_system_user: base44User._app_role === 'admin' || base44User.role === 'admin',
    team_id: base44User.team_id || null,
  };
}

// Resolve the app role (artist/team/client/backer) for a logged-in Base44
// user by checking which entity profile exists for their email.
async function resolveAppRole(email) {
  if (!email) return 'artist';
  try {
    const artists = await Artist.filter({ email });
    if (artists && artists.length > 0) return 'artist';
  } catch { /* ignore */ }
  try {
    const teams = await Team.filter({ contact_email: email });
    if (teams && teams.length > 0) return 'team';
  } catch { /* ignore */ }
  try {
    const owners = await ProjectOwner.filter({ email });
    if (owners && owners.length > 0) return 'client';
  } catch { /* ignore */ }
  try {
    const backers = await Backer.filter({ contact_email: email });
    if (backers && backers.length > 0) return 'backer';
  } catch { /* ignore */ }
  return 'artist';
}

// Generate a unique invite/referral code for each new user
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ER-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Grant free Pro subscription to users who were referred by an invite code
async function grantProSubscription(email) {
  if (!email) return;
  try {
    const pkgs = await SubscriptionPackage.filter({ name: 'Pro' });
    if (!pkgs || pkgs.length === 0) return;
    const proPkg = pkgs[0];
    const existing = await Subscription.filter({ user_email: email, status: 'active' });
    if (existing && existing.length > 0) return;
    await Subscription.create({
      user_email: email,
      package_id: proPkg.id,
      package_name: proPkg.name,
      status: 'active',
      started_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('grantProSubscription error:', err);
  }
}

// Ensure an entity profile exists for new users
async function ensureProfile(user) {
  if (!user?.email) return;
  const role = user.role || 'artist';
  const full_name = user.full_name || user.email?.split('@')[0] || 'User';
  const referredBy = user.referred_by || null;
  try {
    if (role === 'artist') {
      const existing = await Artist.filter({ email: user.email });
      if (!existing || existing.length === 0) {
        await Artist.create({
          email: user.email,
          full_name,
          role: 'director',
          status: 'pending',
          invite_code: generateInviteCode(),
          referred_by: referredBy,
          onboarding_completed: false,
        });
      }
    } else if (role === 'team') {
      if (user.team_id) return;
      const existing = await Team.filter({ contact_email: user.email });
      if (!existing || existing.length === 0) {
        await Team.create({
          team_name: user.team_name || full_name,
          team_code: 'TM' + Date.now().toString().slice(-4),
          contact_email: user.email,
          contact_name: full_name,
          phone: user.phone || '',
          city: '',
          country: '',
          status: 'pending',
          invite_code: generateInviteCode(),
          referred_by: referredBy,
          onboarding_completed: false,
        });
      }
    } else if (role === 'backer') {
      const existing = await Backer.filter({ contact_email: user.email });
      if (!existing || existing.length === 0) {
        await Backer.create({
          organization_name: full_name,
          contact_email: user.email,
          invite_code: generateInviteCode(),
          referred_by: referredBy,
        });
      }
    } else if (role === 'client' || role === 'project_owner') {
      const existing = await ProjectOwner.filter({ email: user.email });
      if (!existing || existing.length === 0) {
        await ProjectOwner.create({
          email: user.email,
          full_name,
          invite_code: generateInviteCode(),
          referred_by: referredBy,
        });
      }
    }

    if (referredBy) {
      await grantProSubscription(user.email);
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
  const [permissions, setPermissions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Heartbeat: mark this user active periodically so others see live online status
  useEffect(() => {
    if (!user?.email) return;
    updatePresence(user);
    const interval = setInterval(() => updatePresence(user), 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  useEffect(() => {
    // 1. Fallback to localStorage demo session first (works without a Base44 login)
    const stored = localStorage.getItem('ericrabar_user');
    let demoUser = null;
    if (stored) {
      try {
        demoUser = JSON.parse(stored);
        setUser(demoUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('ericrabar_user');
      }
    }

    // 2. Check for a real Base44 auth session
    (async () => {
      // Safety timeout: never let the auth check block the app from rendering
      const timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 5000));
      try {
        const result = await Promise.race([
          (async () => {
            const authed = await base44.auth.isAuthenticated();
            if (authed) {
              const me = await base44.auth.me();
              const appRole = demoUser?.role || await resolveAppRole(me.email);
              const u = buildUser(me, appRole);
              setUser(u);
              setIsAuthenticated(true);
              localStorage.setItem('ericrabar_user', JSON.stringify(u));
              if (me._app_role === 'admin' || me.role === 'admin') {
                setPermissions(['*']);
              }
            }
            return 'done';
          })(),
          timeout,
        ]);
        if (result === 'timeout') {
          console.warn('Auth check timed out after 5s — continuing without auth');
        }
      } catch (err) {
        console.error('Base44 auth check failed:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    })();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('ericrabar_user', JSON.stringify(userData));
    await auditLogger.auth.login(userData.email);
  };

  const updateUser = async (newName) => {
    if (!user) return;
    const updatedUser = { ...user, full_name: newName };
    setUser(updatedUser);
    localStorage.setItem('ericrabar_user', JSON.stringify(updatedUser));
    try {
      await base44.auth.updateMe({ full_name: newName });
    } catch (err) {
      console.error('Error updating Base44 user metadata:', err);
    }
  };

  const hasPermission = (permissionKey) => permissions.includes('*') || permissions.includes(permissionKey);
  const hasAnyPermission = (permissionKeys) => permissions.includes('*') || permissionKeys.some(key => permissions.includes(key));
  const hasAllPermissions = (permissionKeys) => permissions.includes('*') || permissionKeys.every(key => permissions.includes(key));
  const hasModuleAccess = (module) => permissions.includes('*') || permissions.some(p => p.startsWith(`${module}.`));

  const logout = async (shouldRedirect = true) => {
    const userEmail = user?.email;
    // 1. Sign out from Base44 (clears the stored token + auth header)
    try {
      base44.auth.logout();
    } catch (e) {
      console.error('base44 logout error:', e);
    }
    // 2. Clear all React state
    setUser(null);
    setPermissions([]);
    setIsAuthenticated(false);
    // 3. Clear every piece of stored auth/session data
    localStorage.removeItem('ericrabar_user');
    localStorage.removeItem('ericrabar_team');
    localStorage.removeItem('ericrabar_sidebar_expanded');
    localStorage.removeItem('smartgigs_sidebar_expanded');
    localStorage.removeItem('smartgigs_sidebar_collapsed');
    sessionStorage.removeItem('ericrabar_just_logged_in');
    sessionStorage.removeItem('ericrabar_onboarding_seen');
    // Nuke any lingering Supabase keys in localStorage/sessionStorage
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
    Object.keys(sessionStorage).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k); });
    // 4. Expire cookies we can reach
    document.cookie.split(';').forEach(c => {
      const eq = c.indexOf('=');
      const name = eq > -1 ? c.slice(0, eq).trim() : c.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
    });
    // 5. Log logout event
    if (userEmail) {
      try { await auditLogger.auth.logout(userEmail); } catch { /* ignore */ }
    }
    // 6. Redirect to landing page
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => { window.location.href = '/SignIn'; };

  return (
    <AuthContext.Provider value={{ user, permissions, isAuthenticated, isLoadingAuth, login, logout, navigateToLogin, updateUser, hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess }}>
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

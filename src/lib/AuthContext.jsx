import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Artist, Team, ProjectOwner, Backer, Subscription, SubscriptionPackage, UserSession } from '@/lib/supabaseEntities'
import auditLogger from '@/lib/auditLogger'

// Auth Provider Configuration
// Primary: Supabase -> Clerk (optional, configured in admin)
const AUTH_PROVIDER = 'supabase'; // Options: 'supabase', 'clerk'

const AuthContext = createContext()

/**
 * Build the app-level user object from a Supabase auth user.
 * Supabase users expose email / user_metadata.
 * The app-specific role (artist/team/client/backer) is resolved from the
 * linked entity records when available.
 */
function buildUser(supabaseUser, appRole) {
  if (!supabaseUser) return null
  const metadata = supabaseUser.user_metadata || {}
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0] || 'User',
    role: appRole || metadata.role || 'artist',
    is_system_user: metadata.is_system_user || metadata.role === 'admin',
    team_id: metadata.team_id || null,
  }
}

// Resolve the app role (artist/team/client/backer) for a logged-in Supabase
// user by checking which entity profile exists for their email.
async function resolveAppRole(email) {
  if (!email) return 'artist'
  try {
    const artists = await Artist.filter({ email })
    if (artists && artists.length > 0) return 'artist'
  } catch { /* ignore */ }
  try {
    const teams = await Team.filter({ contact_email: email })
    if (teams && teams.length > 0) return 'team'
  } catch { /* ignore */ }
  try {
    const owners = await ProjectOwner.filter({ email })
    if (owners && owners.length > 0) return 'client'
  } catch { /* ignore */ }
  try {
    const backers = await Backer.filter({ contact_email: email })
    if (backers && backers.length > 0) return 'backer'
  } catch { /* ignore */ }
  return 'artist'
}

// Generate a unique invite/referral code for each new user
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'ER-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// Grant free Pro subscription to users who were referred by an invite code
async function grantProSubscription(email) {
  if (!email) return
  try {
    const pkgs = await SubscriptionPackage.filter({ name: 'Pro' })
    if (!pkgs || pkgs.length === 0) return
    const proPkg = pkgs[0]
    const existing = await Subscription.filter({ user_email: email, status: 'active' })
    if (existing && existing.length > 0) return
    await Subscription.create({
      user_email: email,
      package_id: proPkg.id,
      package_name: proPkg.name,
      status: 'active',
      started_at: new Date().toISOString(),
    })
  } catch (err) {
    
  }
}

// Ensure an entity profile exists for new users
async function ensureProfile(user) {
  if (!user?.email) return
  const role = user.role || 'artist'
  const full_name = user.full_name || user.email?.split('@')[0] || 'User'
  const referredBy = user.referred_by || null
  try {
    if (role === 'artist') {
      const existing = await Artist.filter({ email: user.email })
      if (!existing || existing.length === 0) {
        await Artist.create({
          email: user.email,
          full_name,
          role: 'director',
          status: 'pending',
          invite_code: generateInviteCode(),
          referred_by: referredBy,
          onboarding_completed: false,
        })
      }
    } else if (role === 'team') {
      if (user.team_id) return
      const existing = await Team.filter({ contact_email: user.email })
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
        })
      }
    } else if (role === 'backer') {
      const existing = await Backer.filter({ contact_email: user.email })
      if (!existing || existing.length === 0) {
        await Backer.create({
          organization_name: full_name,
          contact_email: user.email,
          invite_code: generateInviteCode(),
          referred_by: referredBy,
        })
      }
    } else if (role === 'client' || role === 'project_owner') {
      const existing = await ProjectOwner.filter({ email: user.email })
      if (!existing || existing.length === 0) {
        await ProjectOwner.create({
          email: user.email,
          full_name,
          invite_code: generateInviteCode(),
          referred_by: referredBy,
        })
      }
    }

    if (referredBy) {
      await grantProSubscription(user.email)
    }
  } catch (err) {
    
  }
}

// Update the current user's own profile record with a fresh timestamp so others can see them as online
async function updatePresence(u) {
  if (!u?.email) return
  const now = new Date().toISOString()
  try {
    if (u.role === 'team') {
      if (u.team_id) {
        await Team.update(u.team_id, { last_active: now })
      } else {
        const teams = await Team.filter({ contact_email: u.email })
        if (teams[0]) await Team.update(teams[0].id, { last_active: now })
      }
    } else if (u.role === 'client' || u.role === 'project_owner') {
      const owners = await ProjectOwner.filter({ email: u.email })
      if (owners[0]) await ProjectOwner.update(owners[0].id, { last_active: now })
    } else if (u.role === 'backer') {
      const backers = await Backer.filter({ contact_email: u.email })
      if (backers[0]) await Backer.update(backers[0].id, { last_active: now })
    } else {
      const artists = await Artist.filter({ email: u.email })
      if (artists[0]) await Artist.update(artists[0].id, { last_active: now })
    }
  } catch (err) {
    
  }
}

// Track user session with IP address and device info
async function trackUserSession(user) {
  if (!user?.id) return

  try {
    // Get IP address from ipify API
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const { ip } = await ipResponse.json()

    // Get device info from user agent
    const userAgent = navigator.userAgent
    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)
    const os = getOS(userAgent)

    // Create or update session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if session already exists
    const existingSessions = await UserSession.filter({ user_id: user.id, ip_address: ip })
    if (existingSessions && existingSessions.length > 0) {
      // Update existing session
      await UserSession.update(existingSessions[0].id, {
        last_activity: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
    } else {
      // Create new session
      await UserSession.create({
        user_id: user.id,
        session_token: sessionToken,
        ip_address: ip,
        user_agent: userAgent,
        device_type: deviceType,
        browser: browser,
        os: os,
        expires_at: expiresAt.toISOString(),
      })
    }
  } catch (err) {
    
  }
}

function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function getDeviceType(userAgent) {
  if (/Mobile|Android|iP(ad|hone)/i.test(userAgent)) return 'mobile'
  if (/Tablet|iPad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

function getBrowser(userAgent) {
  if (/Chrome/i.test(userAgent)) return 'Chrome'
  if (/Firefox/i.test(userAgent)) return 'Firefox'
  if (/Safari/i.test(userAgent)) return 'Safari'
  if (/Edge/i.test(userAgent)) return 'Edge'
  return 'Unknown'
}

function getOS(userAgent) {
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Mac/i.test(userAgent)) return 'MacOS'
  if (/Linux/i.test(userAgent)) return 'Linux'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/iOS/i.test(userAgent)) return 'iOS'
  return 'Unknown'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Heartbeat: mark this user active periodically so others see live online status
  useEffect(() => {
    if (!user?.email) return
    updatePresence(user)
    const interval = setInterval(() => updatePresence(user), 30000)
    return () => clearInterval(interval)
  }, [user?.email])

  useEffect(() => {
    // Check for Supabase auth session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const appRole = await resolveAppRole(session.user.email)
          const u = buildUser(session.user, appRole)
          setUser(u)
          setIsAuthenticated(true)

          // Track user session with IP and device info
          await trackUserSession(u)

          if (u.is_system_user) {
            setPermissions(['*'])
          }
        }
      } catch (err) {
        
      } finally {
        setIsLoadingAuth(false)
      }
    })()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const appRole = await resolveAppRole(session.user.email)
        const u = buildUser(session.user, appRole)
        setUser(u)
        setIsAuthenticated(true)
        await trackUserSession(u)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
        setPermissions([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    const appRole = await resolveAppRole(data.user.email)
    const u = buildUser(data.user, appRole)
    setUser(u)
    setIsAuthenticated(true)
    await trackUserSession(u)
    await auditLogger.auth.login(email)

    // Ensure profile exists
    await ensureProfile(u)

    return u
  }

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) throw error

    if (data.user) {
      const appRole = metadata.role || 'artist'
      const u = buildUser(data.user, appRole)
      setUser(u)
      setIsAuthenticated(true)
      await trackUserSession(u)
      await ensureProfile(u)
    }

    return data
  }

  const updateUser = async (newName) => {
    if (!user) return
    const { error } = await supabase.auth.updateUser({
      data: { full_name: newName },
    })

    if (error) throw error

    const updatedUser = { ...user, full_name: newName }
    setUser(updatedUser)
  }

  const hasPermission = (permissionKey) => permissions.includes('*') || permissions.includes(permissionKey)
  const hasAnyPermission = (permissionKeys) => permissions.includes('*') || permissionKeys.some(key => permissions.includes(key))
  const hasAllPermissions = (permissionKeys) => permissions.includes('*') || permissionKeys.every(key => permissions.includes(key))
  const hasModuleAccess = (module) => permissions.includes('*') || permissions.some(p => p.startsWith(`${module}.`))

  const logout = async (shouldRedirect = true) => {
    const userEmail = user?.email
    // 1. Clear all React state first
    setUser(null)
    setPermissions([])
    setIsAuthenticated(false)
    // 2. Sign out from Supabase
    await supabase.auth.signOut()
    // 3. Clear every piece of stored auth/session data
    localStorage.removeItem('ericrabar_user')
    localStorage.removeItem('ericrabar_team')
    localStorage.removeItem('ericrabar_sidebar_expanded')
    localStorage.removeItem('smartgigs_sidebar_expanded')
    localStorage.removeItem('smartgigs_sidebar_collapsed')
    sessionStorage.removeItem('ericrabar_just_logged_in')
    sessionStorage.removeItem('ericrabar_onboarding_seen')
    // 4. Log logout event
    if (userEmail) {
      try { await auditLogger.auth.logout(userEmail); } catch { /* ignore */ }
    }
    // 5. Redirect to landing page
    if (shouldRedirect) {
      window.location.href = '/'
    }
  }

  const navigateToLogin = () => { window.location.href = '/SignIn'; }

  return (
    <AuthContext.Provider value={{ user, permissions, isAuthenticated, isLoadingAuth, login, signUp, logout, navigateToLogin, updateUser, hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

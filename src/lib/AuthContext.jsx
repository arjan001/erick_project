import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Artist, Team, Client, Backer, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities'
import auditLogger from '@/lib/auditLogger'
import { useToast } from '@/hooks/useToast'

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
// user by checking which entity profile exists for their user_id.
// PRIORITY: user metadata role > which profile exists > default to artist
async function resolveAppRole(userId, metadataRole = null) {
  if (!userId) return 'artist'

  // First, check if role is in user metadata (from signup/OAuth)
  if (metadataRole && ['artist', 'team', 'client', 'backer'].includes(metadataRole)) {
    return metadataRole
  }

  // Fallback: check which profile exists (for existing users without metadata role)
  // Use email to query artists table (artists doesn't have user_id)
  try {
    const artists = await Artist.filter({ email: userId })
    if (artists && artists.length > 0) return 'artist'
  } catch { /* ignore - return default */ }
  try {
    const teams = await Team.filter({ user_id: userId })
    if (teams && teams.length > 0) return 'team'
  } catch { /* ignore - return default */ }
  try {
    const owners = await ProjectOwner.filter({ user_id: userId })
    if (owners && owners.length > 0) return 'client'
  } catch { /* ignore - return default */ }
  try {
    const backers = await Backer.filter({ user_id: userId })
    if (backers && backers.length > 0) return 'backer'
  } catch { /* ignore - return default */ }
  return 'artist'
}

// Generate a unique invite/referral code for each new user
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SG-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// Grant free Pro subscription to users who were referred by an invite code
async function grantProSubscription(userId) {
  if (!userId) return
  try {
    const pkgs = await SubscriptionPackage.filter({ name: 'Pro' })
    if (!pkgs || pkgs.length === 0) return
    const proPkg = pkgs[0]
    const existing = await Subscription.filter({ user_id: userId, status: 'active' })
    if (existing && existing.length > 0) return
    await Subscription.create({
      user_id: userId,
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
  if (!user?.id) return
  // Get role from user metadata first (primary source), fallback to session storage
  const roleIntent = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_role_intent') : null
  const metadataRole = user.role || user.user_metadata?.role
  const role = roleIntent || metadataRole || 'artist'
  const full_name = user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const referredBy = user.referred_by || user.user_metadata?.referred_by || null

  // Clear role intent after use
  if (roleIntent && typeof window !== 'undefined') {
    sessionStorage.removeItem('oauth_role_intent')
  }

  try {
    if (role === 'artist') {
      // Production schema uses email as identifier, not user_id
      const existing = await Artist.filter({ email: user.email })
      if (!existing || existing.length === 0) {
        await Artist.create({
          email: user.email,
          display_name: full_name,
          stage_name: full_name,
          skills: [],
          years_experience: 0,
          hourly_rate: 0,
          availability_status: 'available',
          admin_approval_status: 'pending',
        })
      }
    } else if (role === 'team') {
      if (user.team_id) return
      const existing = await Team.filter({ user_id: user.id })
      if (!existing || existing.length === 0) {
        await Team.create({
          user_id: user.id,
          team_name: user.team_name || user.user_metadata?.team_name || full_name,
          team_size: 1,
          availability_status: 'available',
          admin_approval_status: 'pending',
        })
      }
    } else if (role === 'backer') {
      const existing = await Backer.filter({ user_id: user.id })
      if (!existing || existing.length === 0) {
        await Backer.create({
          user_id: user.id,
          organization_name: full_name,
          total_invested: 0,
          investment_count: 0,
        })
      }
    } else if (role === 'client' || role === 'project_owner') {
      const existing = await Client.filter({ user_id: user.id })
      if (!existing || existing.length === 0) {
        await Client.create({
          user_id: user.id,
          display_name: full_name,
          company_name: full_name,
          contact_email: user.email,
        })
      }
    }

    if (referredBy) {
      await grantProSubscription(user.id)
    }
  } catch (err) {
    // If profile creation fails (e.g., Supabase not configured), log but don't block
    console.warn('Profile creation failed:', err)
  }
}

// Update the current user's own profile record with a fresh timestamp so others can see them as online
async function updatePresence(u) {
  if (!u?.id) return
  const now = new Date().toISOString()
  try {
    if (u.role === 'team') {
      if (u.team_id) {
        await Team.update(u.team_id, { last_active: now })
      } else {
        const teams = await Team.filter({ user_id: u.id })
        if (teams[0]) await Team.update(teams[0].id, { last_active: now })
      }
    } else if (u.role === 'client' || u.role === 'project_owner') {
      const owners = await Client.filter({ user_id: u.id })
      if (owners[0]) await Client.update(owners[0].id, { last_active: now })
    } else if (u.role === 'backer') {
      const backers = await Backer.filter({ user_id: u.id })
      if (backers[0]) await Backer.update(backers[0].id, { last_active: now })
    } else {
      // For artists and others, skip last_active update if column doesn't exist
      // const artists = await Artist.filter({ email: u.email })
      // if (artists[0]) await Artist.update(artists[0].id, { last_active: now })
    }
  } catch (err) {
    // Silently ignore errors - presence tracking is non-critical
    console.warn('Presence update failed:', err)
  }
}

// Track user session with IP address and device info
async function trackUserSession(user) {
  if (!user?.id) return

  try {
    // User sessions table not implemented - skip for now
    // Get IP address from ipify API
    // const ipResponse = await fetch('https://api.ipify.org?format=json')
    // const { ip } = await ipResponse.json()

    // Get device info from user agent
    // const userAgent = navigator.userAgent
    // const deviceType = getDeviceType(userAgent)
    // const browser = getBrowser(userAgent)
    // const os = getOS(userAgent)

    // Create or update session
    // const sessionToken = generateSessionToken()
    // const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if session already exists
    // const existingSessions = await UserSession.filter({ user_id: user.id, ip_address: ip })
    // if (existingSessions && existingSessions.length > 0) {
    //   // Update existing session
    //   await UserSession.update(existingSessions[0].id, {
    //     last_activity: new Date().toISOString(),
    //     expires_at: expiresAt.toISOString(),
    //   })
    // } else {
    //   // Create new session
    //   await UserSession.create({
    //     user_id: user.id,
    //     session_token: sessionToken,
    //     ip_address: ip,
    //     user_agent: userAgent,
    //     device_type: deviceType,
    //     browser: browser,
    //     os: os,
    //     expires_at: expiresAt.toISOString(),
    //   })
    // }
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
  const [authNotification, setAuthNotification] = useState(null)
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

  // Show notification (legacy - kept for backward compatibility)
  const showNotification = (message, type = 'info') => {
    setAuthNotification({ message, type })
    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('SmartGigs Kenya', { body: message, icon: '/favicon.ico' })
    }
    // Auto-clear after 3 seconds
    setTimeout(() => setAuthNotification(null), 3000)
  }

  // Heartbeat: mark this user active periodically so others see live online status
  useEffect(() => {
    if (!user?.email) return
    updatePresence(user)
    const interval = setInterval(() => updatePresence(user), 30000)
    return () => clearInterval(interval)
  }, [user?.email])

  useEffect(() => {
    // Check for Supabase auth session or demo user
    (async () => {
      try {
        // First check for demo user (for development/testing without Supabase)
        const demoUserStr = localStorage.getItem('smartgigs_demo_user')
        if (demoUserStr) {
          const demoUser = JSON.parse(demoUserStr)
          const u = buildUser(demoUser, demoUser.role)
          setUser(u)
          setIsAuthenticated(true)
          if (u.is_system_user) {
            setPermissions(['*'])
          }
          setIsLoadingAuth(false)
          return
        }

        // Otherwise check Supabase auth session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const metadataRole = session.user.user_metadata?.role
          const appRole = await resolveAppRole(session.user.id, metadataRole)
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
        // If Supabase is not configured, allow the app to load without auth
        console.warn('Auth initialization failed, allowing guest access:', err)
      } finally {
        setIsLoadingAuth(false)
      }
    })()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const metadataRole = session.user.user_metadata?.role
        const appRole = await resolveAppRole(session.user.id, metadataRole)
        const u = buildUser(session.user, appRole)
        setUser(u)
        setIsAuthenticated(true)
        await trackUserSession(u)
        await ensureProfile(u)

        // Handle OAuth redirect after sign in
        const oauthRedirect = sessionStorage.getItem('oauth_redirect')
        if (oauthRedirect) {
          sessionStorage.removeItem('oauth_redirect')
          // Store for use by router - will be used by AuthGuard
          sessionStorage.setItem('auth_redirect', oauthRedirect)
        } else {
          // Default redirect based on role
          const roleRedirects = {
            artist: '/artistdashboard',
            team: '/teamdashboard',
            client: '/clientdashboard',
            project_owner: '/clientdashboard',
            backer: '/backerdashboard',
            admin: '/Admin',
          }
          const defaultRedirect = roleRedirects[appRole] || '/artistdashboard'
          sessionStorage.setItem('auth_redirect', defaultRedirect)
        }
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

    const metadataRole = data.user.user_metadata?.role
    const appRole = await resolveAppRole(data.user.id, metadataRole)
    const u = buildUser(data.user, appRole)
    setUser(u)
    setIsAuthenticated(true)
    await trackUserSession(u)
    await auditLogger.auth.login(email)

    // Ensure profile exists
    await ensureProfile(u)

    // Show login notification
    toastSuccess('Welcome Back', `Welcome back, ${u.full_name}!`)

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

      // Ensure user is saved to public.users table
      try {
        const { User } = await import('@/lib/supabaseEntities')
        const existingUser = await User.filter({ id: data.user.id })
        if (!existingUser || existingUser.length === 0) {
          await User.create({
            id: data.user.id,
            email: data.user.email,
            full_name: metadata.full_name || metadata.name || data.user.email?.split('@')[0] || 'User',
            role: appRole,
            is_verified: false
          })
        }
      } catch (err) {
        console.error('Error saving user to public.users:', err)
      }

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
    const userName = user?.full_name || 'User'
    // 1. Clear all React state first
    setUser(null)
    setPermissions([])
    setIsAuthenticated(false)
    // 2. Sign out from Supabase
    await supabase.auth.signOut()
    // 3. Clear demo user data
    localStorage.removeItem('smartgigs_demo_user')
    localStorage.removeItem('smartgigs_auth')
    // 4. Clear every piece of stored auth/session data
    localStorage.removeItem('smartgigs_user')
    localStorage.removeItem('smartgigs_team')
    localStorage.removeItem('smartgigs_sidebar_expanded')
    localStorage.removeItem('smartgigs_sidebar_collapsed')
    sessionStorage.removeItem('smartgigs_just_logged_in')
    sessionStorage.removeItem('smartgigs_onboarding_seen')
    // 5. Log logout event
    if (userEmail) {
      try { await auditLogger.auth.logout(userEmail); } catch { /* ignore */ }
    }
    // 6. Show logout notification
    toastInfo('Logged Out', `Goodbye, ${userName}!`)
    // 7. Redirect to landing page
    if (shouldRedirect) {
      window.location.href = '/'
    }
  }

  const navigateToLogin = () => { window.location.href = '/SignIn'; }

  return (
    <AuthContext.Provider value={{ user, permissions, isAuthenticated, isLoadingAuth, login, signUp, logout, navigateToLogin, updateUser, hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess, authNotification, setAuthNotification }}>
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

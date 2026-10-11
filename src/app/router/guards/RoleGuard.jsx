import { useAuth } from '@/lib/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function RoleGuard({ roles, children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/SignIn')
      return
    }

    // Only redirect if user is authenticated but doesn't have the required role
    // AND they're not already on their dashboard (to prevent redirect loops)
    if (!isLoadingAuth && user && !roles.includes(user.role)) {
      // admin can access everything — never redirect an admin
      if (user.role === 'admin') return

      // Check if user is already on their correct dashboard
      const roleRedirects = {
        artist: '/artistdashboard',
        artist_admin: '/artistdashboard',
        team: '/teamdashboard',
        team_admin: '/teamdashboard',
        client: '/clientdashboard',
        project_owner: '/clientdashboard',
        backer: '/backerdashboard',
      }
      const userDashboard = roleRedirects[user.role]

      // Only redirect if not already on their dashboard
      if (location.pathname !== userDashboard) {
        navigate(userDashboard || '/')
      }
    }
  }, [isAuthenticated, isLoadingAuth, user, roles, navigate, location])

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // admin bypasses all role checks
  if (user?.role === 'admin') return children

  if (!user || !roles.includes(user.role)) {
    return null
  }

  return children
}

// Factory function to create guard components with specific roles
export function createRoleGuard(roles) {
  return function RoleGuardWrapper({ children }) {
    return <RoleGuard roles={roles}>{children}</RoleGuard>
  }
}
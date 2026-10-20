import { useAuth } from '@/lib/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function RoleGuard({ roles, children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      // If trying to access admin routes, redirect to /erick
      if (location.pathname.startsWith('/Admin') || location.pathname.startsWith('/admin')) {
        navigate('/erick')
      } else {
        navigate('/SignIn')
      }
      return
    }

    // If authenticated but trying to access admin routes without admin role
    if (!isLoadingAuth && isAuthenticated && (location.pathname.startsWith('/Admin') || location.pathname.startsWith('/admin'))) {
      if (user?.role !== 'admin') {
        navigate('/erick')
        return
      }
    }
  }, [isAuthenticated, isLoadingAuth, navigate, location, user])

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

  // If trying to access admin routes, must be admin
  if ((location.pathname.startsWith('/Admin') || location.pathname.startsWith('/admin')) && user?.role !== 'admin') {
    return null
  }

  // admin bypasses all role checks
  if (user?.role === 'admin') return children

  // Check if user has the required role
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
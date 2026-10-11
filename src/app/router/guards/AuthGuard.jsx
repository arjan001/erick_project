import { useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export function AuthGuard({ children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', location.pathname)
      navigate('/SignIn')
    } else if (!isLoadingAuth && isAuthenticated) {
      // Check if there's a stored redirect from login
      const authRedirect = sessionStorage.getItem('auth_redirect')
      if (authRedirect && location.pathname === '/SignIn') {
        sessionStorage.removeItem('auth_redirect')
        navigate(authRedirect)
      }
    }
  }, [isAuthenticated, isLoadingAuth, navigate, location])

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

  return children
}
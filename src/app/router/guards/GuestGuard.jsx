import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// Auth pages — redirect to login if trying to access signup
export function GuestGuard({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Redirect signup to login
    if (location.pathname === '/SignUp') {
      navigate('/SignIn', { replace: true })
    }
  }, [location.pathname, navigate])

  // Allow access to all other auth pages
  return children
}
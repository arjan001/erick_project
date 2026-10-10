import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * AuthRedirectHandler
 *
 * This component handles OAuth redirects by reading the redirect path from sessionStorage
 * and using React Router's navigate() instead of window.location.href.
 * This prevents full page reloads and fixes the "jinxed" navigation issue.
 */
export default function AuthRedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('auth_redirect')
    if (redirectPath) {
      sessionStorage.removeItem('auth_redirect')
      navigate(redirectPath, { replace: true })
    }
  }, [navigate])

  return null
}

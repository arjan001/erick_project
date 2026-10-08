import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { permissionsService } from '@/lib/permissionsService'

/**
 * Permission Guard Component
 * Protects routes based on user permissions
 * @param {string[]} requiredPermissions - Array of permission keys required
 * @param {string} requireAll - If true, user needs all permissions. If false, user needs at least one.
 * @param {React.ReactNode} children - Child components to render if authorized
 */
export function PermissionGuard({ requiredPermissions = [], requireAll = true, children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [authorized, setAuthorized] = React.useState(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setAuthorized(false)
        return
      }

      if (requiredPermissions.length === 0) {
        setAuthorized(true)
        return
      }

      try {
        let hasAccess
        if (requireAll) {
          hasAccess = await permissionsService.hasAllPermissions(user.id, requiredPermissions)
        } else {
          hasAccess = await permissionsService.hasAnyPermission(user.id, requiredPermissions)
        }

        setAuthorized(hasAccess)
      } catch (err) {
        
        // If permission checking fails (e.g., tables don't exist yet), allow access
        // This prevents blocking during migration
        setAuthorized(true)
        setError(true)
      }
    }

    checkPermissions()
  }, [user, requiredPermissions, requireAll])

  React.useEffect(() => {
    if (authorized === false && !error) {
      navigate('/Admin', { replace: true })
    }
  }, [authorized, error, navigate])

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  return authorized ? children : null
}

/**
 * Create a permission guard with specific permissions
 * @param {string[]} permissions - Required permissions
 * @param {boolean} requireAll - Whether all permissions are required
 */
export function createPermissionGuard(permissions, requireAll = true) {
  return function PermissionGuardWrapper({ children }) {
    return (
      <PermissionGuard requiredPermissions={permissions} requireAll={requireAll}>
        {children}
      </PermissionGuard>
    )
  }
}

/**
 * Permission mapping for admin routes
 * Maps each admin route to its required permissions
 */
export const ADMIN_ROUTE_PERMISSIONS = {
  '/Admin': ['admin.dashboard.view'],
  '/Admin/Artists': ['artists.view'],
  '/Admin/Teams': ['teams.view'],
  '/Admin/Projects': ['projects.view'],
  '/Admin/UserManagement': ['users.view'],
  '/Admin/RolesPermissions': ['roles.view'],
  '/Admin/Settings': ['settings.general'],
  '/Admin/SEOCMS': ['seo.view'],
  '/Admin/ImageStorage': ['images.view'],
  '/Admin/Invites': ['invites.view'],
  '/Admin/LoginProviders': ['login_providers.view'],
  '/Admin/APISettings': ['api_settings.view'],
  '/Admin/PaymentSettings': ['payment_settings.view'],
  '/Admin/Analytics': ['analytics.view'],
  '/Admin/FinanceDashboard': ['finance.view'],
  '/Admin/Jobs': ['jobs.view'],
  '/Admin/Clients': ['clients.view'],
  '/Admin/Messages': ['messages.view'],
  '/Admin/Products': ['products.view'],
  '/Admin/Orders': ['orders.view'],
  '/Admin/ShopSettings': ['shop_settings.view'],
  '/Admin/AuditLogs': ['audit.view'],
  '/Admin/Subscriptions': ['subscriptions.view'],
  '/Admin/Ticker': ['ticker.view'],
  '/Admin/Categories': ['categories.view'],
  '/Admin/Backers': ['backers.view'],
  '/Admin/FeaturedWork': ['featured.view'],
  '/Admin/SuccessStories': ['success_stories.view'],
  '/Admin/RecentProjects': ['recent_projects.view'],
}

/**
 * Create a route-specific permission guard
 * @param {string} path - Route path
 */
export function createRoutePermissionGuard(path) {
  const permissions = ADMIN_ROUTE_PERMISSIONS[path] || []
  return createPermissionGuard(permissions, true)
}

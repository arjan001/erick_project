import { useAuth } from './useAuth'

export function useRole() {
  const { user, isAuthenticated } = useAuth()

  const hasRole = (role) => {
    if (!isAuthenticated || !user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  const isAdmin = hasRole('admin')
  const isArtist = hasRole('artist')
  const isTeam = hasRole('team')
  const isClient = hasRole('client')
  const isProjectOwner = hasRole('project_owner')
  const isBacker = hasRole('backer')

  return {
    hasRole,
    isAdmin,
    isArtist,
    isTeam,
    isClient,
    isProjectOwner,
    isBacker,
    role: user?.role || null
  }
}

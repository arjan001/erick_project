import { authApi } from '../api/auth.api'

class AuthService {
  constructor() {
    this.session = null
    this.listeners = new Set()
    this.loadSession()
  }

  loadSession() {
    const stored = localStorage.getItem('ericrabar_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        this.session = { user, source: 'demo' }
      } catch (e) {
        this.session = null
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify() {
    this.listeners.forEach(listener => listener(this.session))
  }

  async getSession() {
    if (this.session) {
      return this.session
    }

    const storedSession = await authApi.getSession()
    if (storedSession) {
      this.session = storedSession
      this.notify()
      return this.session
    }

    return null
  }

  async login(credentials) {
    const session = await authApi.login(credentials)
    this.session = session
    this.notify()
    return session
  }

  logout(shouldRedirect = true) {
    this.session = null
    authApi.logout(shouldRedirect)
    this.notify()
  }

  hasRole(role) {
    if (!this.session?.user) return false
    if (Array.isArray(role)) {
      return role.includes(this.session.user.role)
    }
    return this.session.user.role === role
  }

  redirectToLogin(returnUrl) {
    authApi.redirectToLogin(returnUrl)
  }
}

export const authService = new AuthService()

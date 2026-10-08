/**
 * CSRF Token Management
 * Generates and validates CSRF tokens for form protection
 */

class CSRFProtection {
  constructor() {
    this.tokenLength = 32
    this.tokenName = 'csrf_token'
  }

  /**
   * Generate a random CSRF token
   * @returns {string} Random token
   */
  generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < this.tokenLength; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  /**
   * Get CSRF token from localStorage or generate new one
   * @returns {string} CSRF token
   */
  getToken() {
    let token = localStorage.getItem(this.tokenName)
    if (!token) {
      token = this.generateToken()
      localStorage.setItem(this.tokenName, token)
    }
    return token
  }

  /**
   * Validate CSRF token
   * @param {string} token - Token to validate
   * @returns {boolean} Valid or not
   */
  validateToken(token) {
    const storedToken = localStorage.getItem(this.tokenName)
    if (!storedToken || !token) return false
    return storedToken === token
  }

  /**
   * Regenerate CSRF token (call after form submission)
   */
  regenerateToken() {
    const newToken = this.generateToken()
    localStorage.setItem(this.tokenName, newToken)
    return newToken
  }

  /**
   * Clear CSRF token (call on logout)
   */
  clearToken() {
    localStorage.removeItem(this.tokenName)
  }
}

export const csrfProtection = new CSRFProtection()

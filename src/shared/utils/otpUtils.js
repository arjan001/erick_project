// OTP (One-Time Password) Utilities for SmartGigs Kenya
// Generates and validates OTP codes for email verification and authentication

class OTPUtils {
  /**
   * Generate a random OTP code
   * @param {number} length - Length of OTP (default: 6)
   * @returns {string} - OTP code
   */
  static generateOTP(length = 6) {
    const digits = '0123456789'
    let otp = ''
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)]
    }
    return otp
  }

  /**
   * Generate an alphanumeric OTP code
   * @param {number} length - Length of OTP (default: 8)
   * @returns {string} - OTP code
   */
  static generateAlphanumericOTP(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let otp = ''
    for (let i = 0; i < length; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)]
    }
    return otp
  }

  /**
   * Calculate OTP expiration time
   * @param {number} minutes - Minutes until expiration (default: 10)
   * @returns {Date} - Expiration date
   */
  static getExpirationTime(minutes = 10) {
    const now = new Date()
    const expiration = new Date(now.getTime() + minutes * 60000)
    return expiration
  }

  /**
   * Check if OTP is expired
   * @param {Date} expiration - Expiration date
   * @returns {boolean} - True if expired
   */
  static isExpired(expiration) {
    return new Date() > new Date(expiration)
  }

  /**
   * Hash OTP for secure storage
   * @param {string} otp - Plain text OTP
   * @returns {string} - Hashed OTP (simple hash for demo - use bcrypt in production)
   */
  static async hashOTP(otp) {
    // Simple hash for demo - in production, use bcrypt or similar
    const encoder = new TextEncoder()
    const data = encoder.encode(otp)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  /**
   * Verify OTP against hash
   * @param {string} otp - Plain text OTP
   * @param {string} hash - Hashed OTP
   * @returns {Promise<boolean>} - True if valid
   */
  static async verifyOTP(otp, hash) {
    const otpHash = await this.hashOTP(otp)
    return otpHash === hash
  }

  /**
   * Format OTP for display (e.g., "123456" -> "123 456")
   * @param {string} otp - OTP code
   * @param {number} groupSize - Group size (default: 3)
   * @returns {string} - Formatted OTP
   */
  static formatOTP(otp, groupSize = 3) {
    return otp.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ')
  }

  /**
   * Validate OTP format
   * @param {string} otp - OTP code
   * @param {number} expectedLength - Expected length
   * @returns {boolean} - True if valid format
   */
  static validateFormat(otp, expectedLength = 6) {
    return /^\d+$/.test(otp) && otp.length === expectedLength
  }
}

export default OTPUtils

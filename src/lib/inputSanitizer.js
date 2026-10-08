/**
 * Input Sanitization Utilities
 * Sanitizes user input to prevent XSS and injection attacks
 */

class InputSanitizer {
  /**
   * Sanitize string input (remove HTML tags and special characters)
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeString(input) {
    if (!input) return ''
    return input
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/["']/g, '') // Remove quotes
      .replace(/\\/g, '') // Remove backslashes
      .trim()
  }

  /**
   * Sanitize email input
   * @param {string} email - Email to sanitize
   * @returns {string} Sanitized email
   */
  sanitizeEmail(email) {
    if (!email) return ''
    return email
      .toLowerCase()
      .trim()
      .replace(/[<>]/g, '')
  }

  /**
   * Sanitize URL input
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  sanitizeUrl(url) {
    if (!url) return ''
    try {
      const urlObj = new URL(url)
      // Only allow http, https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return ''
      }
      return url
    } catch {
      return ''
    }
  }

  /**
   * Sanitize phone number
   * @param {string} phone - Phone number to sanitize
   * @returns {string} Sanitized phone
   */
  sanitizePhone(phone) {
    if (!phone) return ''
    return phone
      .replace(/[^0-9+]/g, '') // Only allow digits and +
      .trim()
  }

  /**
   * Sanitize filename
   * @param {string} filename - Filename to sanitize
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename) {
    if (!filename) return ''
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dot, underscore, hyphen
      .replace(/\.{2,}/g, '.') // Remove multiple dots
      .trim()
  }

  /**
   * Escape HTML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    if (!str) return ''
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return str.replace(/[&<>"']/g, char => map[char])
  }
}

export const inputSanitizer = new InputSanitizer()

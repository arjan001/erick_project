/**
 * Rate Limiting Service
 * Prevents API abuse by limiting request frequency
 */

class RateLimiter {
  constructor() {
    this.requests = new Map()
    this.windowMs = 60 * 1000 // 1 minute window
    this.maxRequests = 100 // Max 100 requests per minute
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - User ID or IP address
   * @param {number} maxRequests - Max requests per window (optional)
   * @param {number} windowMs - Window duration in ms (optional)
   * @returns {boolean} Allowed or not
   */
  async checkRateLimit(identifier, maxRequests = this.maxRequests, windowMs = this.windowMs) {
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create request record
    let record = this.requests.get(identifier)
    if (!record) {
      record = { count: 0, resetTime: now + windowMs }
      this.requests.set(identifier, record)
    }

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }

    // Check if over limit
    if (record.count >= maxRequests) {
      return false
    }

    // Increment count
    record.count++
    this.requests.set(identifier, record)

    // Store in database for persistence across server restarts
    try {
      const { RateLimit } = await import('@/lib/supabaseEntities')
      await RateLimit.create({
        user_id: identifier,
        endpoint: window.location.pathname,
        request_count: record.count,
        window_start: new Date(windowStart).toISOString(),
        window_end: new Date(record.resetTime).toISOString(),
      })
    } catch (error) {
      // Silent fail - rate limiting is not critical
    }

    return true
  }

  /**
   * Get remaining requests
   * @param {string} identifier - User ID or IP address
   * @returns {number} Remaining requests
   */
  getRemainingRequests(identifier) {
    const record = this.requests.get(identifier)
    if (!record) return this.maxRequests
    return Math.max(0, this.maxRequests - record.count)
  }

  /**
   * Reset rate limit for a user (admin function)
   * @param {string} identifier - User ID or IP address
   */
  resetRateLimit(identifier) {
    this.requests.delete(identifier)
  }
}

export const rateLimiter = new RateLimiter()

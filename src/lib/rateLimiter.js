/**
 * API Rate Limiter
 * Implements rate limiting for API requests to prevent abuse
 */

// Rate limit storage (in-memory for demo, use Redis in production)
const rateLimitStore = new Map();

// Rate limit configurations by endpoint type
const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later'
  },
  
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
    message: 'Rate limit exceeded, please try again later'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour
    message: 'Upload limit exceeded, please try again later'
  },
  
  // Search endpoints
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Search limit exceeded, please try again later'
  },
  
  // Admin endpoints - stricter limits
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 requests per window
    message: 'Admin rate limit exceeded, please try again later'
  }
};

// Get rate limit config for endpoint type
function getRateLimitConfig(endpointType) {
  return RATE_LIMIT_CONFIGS[endpointType] || RATE_LIMIT_CONFIGS.api;
}

// Generate rate limit key
function generateRateLimitKey(identifier, endpointType) {
  return `${endpointType}:${identifier}`;
}

// Check rate limit
export function checkRateLimit(identifier, endpointType = 'api') {
  const config = getRateLimitConfig(endpointType);
  const key = generateRateLimitKey(identifier, endpointType);
  const now = Date.now();
  
  // Get existing rate limit data
  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Create new rate limit entry
    rateLimitData = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, rateLimitData);
  }
  
  // Check if limit exceeded
  if (rateLimitData.count >= config.maxRequests) {
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: rateLimitData.resetTime,
      message: config.message
    };
  }
  
  // Increment count
  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);
  
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - rateLimitData.count,
    resetTime: rateLimitData.resetTime
  };
}

// Reset rate limit for identifier
export function resetRateLimit(identifier, endpointType = 'api') {
  const key = generateRateLimitKey(identifier, endpointType);
  rateLimitStore.delete(key);
}

// Get current rate limit status
export function getRateLimitStatus(identifier, endpointType = 'api') {
  const key = generateRateLimitKey(identifier, endpointType);
  const rateLimitData = rateLimitStore.get(key);
  const config = getRateLimitConfig(endpointType);
  
  if (!rateLimitData) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs
    };
  }
  
  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - rateLimitData.count),
    resetTime: rateLimitData.resetTime
  };
}

// Clean up expired rate limit entries
export function cleanupExpiredRateLimits() {
  const now = Date.now();
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup periodically (call this in a setInterval)
export function startRateLimitCleanup(intervalMs = 60 * 1000) {
  return setInterval(cleanupExpiredRateLimits, intervalMs);
}

// Rate limit middleware for API calls
export async function rateLimitMiddleware(identifier, endpointType = 'api') {
  const result = checkRateLimit(identifier, endpointType);
  
  if (!result.allowed) {
    throw new Error(`Rate limit exceeded: ${result.message}`);
  }
  
  return result;
}

// Role-based rate limiting
export function getRateLimitByRole(role) {
  switch (role) {
    case 'admin':
    case 'artist_admin':
      return 'admin';
    default:
      return 'api';
  }
}

// IP-based rate limiting (for server-side)
export function getClientIdentifier(request) {
  // In a real server environment, get IP from request
  // For client-side, use user ID or session ID
  return request?.headers?.['x-forwarded-for'] || 
         request?.connection?.remoteAddress || 
         'anonymous';
}

// Adaptive rate limiting based on user behavior
export class AdaptiveRateLimiter {
  constructor() {
    this.userBehaviorScores = new Map();
  }
  
  // Calculate behavior score (0-100, higher = more suspicious)
  calculateBehaviorScore(userId, action) {
    const currentScore = this.userBehaviorScores.get(userId) || 0;
    
    // Suspicious actions increase score
    const suspiciousActions = [
      'failed_login',
      'invalid_token',
      'rate_limit_exceeded',
      'suspicious_activity'
    ];
    
    if (suspiciousActions.includes(action)) {
      return Math.min(100, currentScore + 20);
    }
    
    // Normal actions decrease score
    return Math.max(0, currentScore - 5);
  }
  
  // Get adaptive rate limit based on behavior score
  getAdaptiveLimit(userId, baseConfig) {
    const score = this.userBehaviorScores.get(userId) || 0;
    
    if (score > 80) {
      // Very suspicious - very strict limits
      return {
        ...baseConfig,
        maxRequests: Math.floor(baseConfig.maxRequests * 0.1)
      };
    } else if (score > 50) {
      // Moderately suspicious - stricter limits
      return {
        ...baseConfig,
        maxRequests: Math.floor(baseConfig.maxRequests * 0.5)
      };
    }
    
    return baseConfig;
  }
  
  updateBehaviorScore(userId, action) {
    const score = this.calculateBehaviorScore(userId, action);
    this.userBehaviorScores.set(userId, score);
  }
}

// Export singleton instance
export const adaptiveRateLimiter = new AdaptiveRateLimiter();

/**
 * API Response Caching Utility
 * Caches API responses to reduce network requests and improve performance
 */

// Cache storage (in-memory for demo, use Redis or IndexedDB for production)
const apiCache = new Map()

// Default cache configuration
const DEFAULT_CACHE_CONFIG = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Maximum number of cached items
  cacheKeyPrefix: 'api_cache_'
}

/**
 * Generate cache key from request parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @returns {string} - Cache key
 */
function generateCacheKey(endpoint, params = {}) {
  const paramString = JSON.stringify(params)
  return `${DEFAULT_CACHE_CONFIG.cacheKeyPrefix}${endpoint}_${paramString}`
}

/**
 * Check if cache entry is expired
 * @param {Object} cacheEntry - Cache entry
 * @returns {boolean} - Whether entry is expired
 */
function isExpired(cacheEntry) {
  return Date.now() > cacheEntry.expiry
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  
  for (const [key, value] of apiCache.entries()) {
    if (now > value.expiry) {
      apiCache.delete(key)
    }
  }
  
  // Enforce max size
  if (apiCache.size > DEFAULT_CACHE_CONFIG.maxSize) {
    const entries = Array.from(apiCache.entries())
    // Sort by expiry (oldest first)
    entries.sort((a, b) => a[1].expiry - b[1].expiry)
    
    // Remove oldest entries
    const toRemove = entries.length - DEFAULT_CACHE_CONFIG.maxSize
    for (let i = 0; i < toRemove; i++) {
      apiCache.delete(entries[i][0])
    }
  }
}

/**
 * Get cached response
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @returns {*} - Cached data or null
 */
export function getCachedResponse(endpoint, params = {}) {
  if (!DEFAULT_CACHE_CONFIG.enabled) {
    return null
  }
  
  const key = generateCacheKey(endpoint, params)
  const cached = apiCache.get(key)
  
  if (!cached) {
    return null
  }
  
  if (isExpired(cached)) {
    apiCache.delete(key)
    return null
  }
  
  return cached.data
}

/**
 * Set cached response
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @param {*} data - Response data
 * @param {number} ttl - Time to live in milliseconds
 */
export function setCachedResponse(endpoint, params = {}, data, ttl = DEFAULT_CACHE_CONFIG.ttl) {
  if (!DEFAULT_CACHE_CONFIG.enabled) {
    return
  }
  
  const key = generateCacheKey(endpoint, params)
  const expiry = Date.now() + ttl
  
  apiCache.set(key, {
    data,
    expiry,
    timestamp: Date.now()
  })
  
  cleanupExpiredEntries()
}

/**
 * Invalidate cache for specific endpoint
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters (optional)
 */
export function invalidateCache(endpoint, params = null) {
  if (params) {
    const key = generateCacheKey(endpoint, params)
    apiCache.delete(key)
  } else {
    // Invalidate all entries for this endpoint
    const prefix = `${DEFAULT_CACHE_CONFIG.cacheKeyPrefix}${endpoint}_`
    for (const key of apiCache.keys()) {
      if (key.startsWith(prefix)) {
        apiCache.delete(key)
      }
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache() {
  apiCache.clear()
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export function getCacheStats() {
  const entries = Array.from(apiCache.values())
  const now = Date.now()
  
  const validEntries = entries.filter(e => e.expiry > now)
  const expiredEntries = entries.filter(e => e.expiry <= now)
  
  return {
    totalEntries: apiCache.size,
    validEntries: validEntries.length,
    expiredEntries: expiredEntries.length,
    maxSize: DEFAULT_CACHE_CONFIG.maxSize,
    enabled: DEFAULT_CACHE_CONFIG.enabled
  }
}

/**
 * Configure cache settings
 * @param {Object} config - Cache configuration
 */
export function configureCache(config) {
  Object.assign(DEFAULT_CACHE_CONFIG, config)
}

/**
 * Cached API wrapper
 * @param {Function} apiFunction - API function to call
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @param {Object} options - Cache options
 * @returns {Promise<*>} - API response
 */
export async function cachedApiCall(apiFunction, endpoint, params = {}, options = {}) {
  const {
    ttl = DEFAULT_CACHE_CONFIG.ttl,
    forceRefresh = false,
    enabled = DEFAULT_CACHE_CONFIG.enabled
  } = options
  
  if (!enabled || forceRefresh) {
    return await apiFunction(params)
  }
  
  // Check cache first
  const cached = getCachedResponse(endpoint, params)
  if (cached !== null) {
    return cached
  }
  
  // Call API function
  const result = await apiFunction(params)
  
  // Cache the result
  setCachedResponse(endpoint, params, result, ttl)
  
  return result
}

/**
 * Prefetch data for common endpoints
 * @param {Array} prefetchItems - Array of { endpoint, params, apiFunction }
 */
export async function prefetchData(prefetchItems) {
  const promises = prefetchItems.map(async (item) => {
    try {
      const data = await item.apiFunction(item.params)
      setCachedResponse(item.endpoint, item.params, data)
    } catch (error) {
      
    }
  })
  
  await Promise.all(promises)
}

/**
 * Cache decorator for API functions
 * @param {Object} options - Cache options
 * @returns {Function} - Decorated function
 */
export function withCache(options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args) {
      const endpoint = propertyKey
      const params = args[0] || {}
      
      return cachedApiCall(
        originalMethod.bind(this),
        endpoint,
        params,
        options
      )
    }
    
    return descriptor
  }
}

// Start periodic cleanup
setInterval(cleanupExpiredEntries, 60 * 1000); // Every minute

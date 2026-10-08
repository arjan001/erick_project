/**
 * Feature Flags for SmartGigs Kenya
 * These control which features are enabled/disabled
 * Stored in Supabase database
 */

import { FeatureFlag } from '@/lib/supabaseEntities'

// Default values (fallback if database not loaded)
export const DEFAULT_FEATURE_FLAGS = {
  // Actors portal - enabled on launch
  ACTORS_PORTAL_ENABLED: true,

  // Crew portal - disabled initially, will be enabled later via admin
  CREW_PORTAL_ENABLED: false,

  // Shop - enabled
  SHOP_ENABLED: true,

  // Auctions - enabled
  AUCTIONS_ENABLED: true,

  // Cookie banner - disabled initially, can be enabled via CMS
  COOKIE_BANNER_ENABLED: false,
}

// Cached feature flags
let cachedFlags = null
let cacheExpiry = null
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch feature flags from database
 */
async function fetchFeatureFlags() {
  try {
    const flags = await FeatureFlag.list('-created_at', 100)
    const flagMap = {}
    flags.forEach(flag => {
      flagMap[flag.flag_key] = flag.flag_value
    })
    return flagMap
  } catch (error) {
    
    return {}
  }
}

/**
 * Check if a feature is enabled
 * First checks database (with cache), falls back to defaults
 */
export async function isFeatureEnabled(featureKey) {
  // Check cache first
  if (cachedFlags && cacheExpiry && Date.now() < cacheExpiry) {
    const value = cachedFlags[featureKey]
    if (value !== undefined) return value
  }

  // Fetch from database
  const flags = await fetchFeatureFlags()
  cachedFlags = flags
  cacheExpiry = Date.now() + CACHE_DURATION

  const value = flags[featureKey]
  if (value !== undefined) return value

  // Fallback to default
  return DEFAULT_FEATURE_FLAGS[featureKey] || false
}

/**
 * Synchronous version for use in render (uses cached value only)
 */
export function isFeatureEnabledSync(featureKey) {
  if (cachedFlags && cacheExpiry && Date.now() < cacheExpiry) {
    const value = cachedFlags[featureKey]
    if (value !== undefined) return value
  }
  return DEFAULT_FEATURE_FLAGS[featureKey] || false
}

/**
 * Get all feature flags (for admin panel)
 */
export async function getAllFeatureFlags() {
  const flags = await fetchFeatureFlags()
  // Merge with defaults
  return { ...DEFAULT_FEATURE_FLAGS, ...flags }
}

/**
 * Update a feature flag (admin only)
 */
export async function setFeatureFlag(flagKey, flagValue, description) {
  try {
    const existing = await FeatureFlag.filter({ flag_key: flagKey })
    if (existing && existing.length > 0) {
      await FeatureFlag.update(existing[0].id, {
        flag_value: flagValue,
        description: description || existing[0].description,
      })
    } else {
      await FeatureFlag.create({
        flag_key: flagKey,
        flag_value: flagValue,
        description: description || '',
      })
    }
    // Clear cache
    cachedFlags = null
    cacheExpiry = null
    return true
  } catch (error) {
    
    return false
  }
}

/**
 * Invalidate cache (call after updating flags)
 */
export function invalidateFeatureFlagCache() {
  cachedFlags = null
  cacheExpiry = null
}

/**
 * Feature Flags for SmartGigs Kenya
 * These control which features are enabled/disabled
 */

export const FEATURE_FLAGS = {
  // Actors portal - enabled on launch
  ACTORS_PORTAL_ENABLED: true,

  // Crew portal - disabled initially, will be enabled later
  CREW_PORTAL_ENABLED: false,

  // Shop - enabled
  SHOP_ENABLED: true,

  // Auctions - enabled
  AUCTIONS_ENABLED: true,

  // Cookie banner - disabled initially, can be enabled via CMS
  COOKIE_BANNER_ENABLED: false,
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureKey) {
  return FEATURE_FLAGS[featureKey] || false;
}

/**
 * Get all feature flags (for admin panel)
 */
export function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}

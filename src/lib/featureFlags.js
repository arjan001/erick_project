/**
 * Feature Flags for SmartGigs Kenya
 * These control which features are enabled/disabled
 */

// Default values (fallback if admin settings not loaded)
export const FEATURE_FLAGS = {
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
};

/**
 * Check if a feature is enabled
 * First checks admin settings from localStorage, falls back to defaults
 */
export function isFeatureEnabled(featureKey) {
  // Try to get from admin settings
  try {
    const adminSettings = localStorage.getItem('admin_settings');
    if (adminSettings) {
      const settings = JSON.parse(adminSettings);
      // Map feature keys to setting keys
      const settingMap = {
        'CREW_PORTAL_ENABLED': 'enableCrewPortal',
        'SHOP_ENABLED': 'enableMarketplace',
        'AUCTIONS_ENABLED': 'enableMarketplace',
        'COOKIE_BANNER_ENABLED': 'enableCookieBanner',
      };
      const settingKey = settingMap[featureKey];
      if (settingKey && settings[settingKey] !== undefined) {
        return settings[settingKey] === 'true' || settings[settingKey] === true;
      }
    }
  } catch (err) {
    console.error('Error reading admin settings for feature flag:', err);
  }
  // Fallback to default
  return FEATURE_FLAGS[featureKey] || false;
}

/**
 * Get all feature flags (for admin panel)
 */
export function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}

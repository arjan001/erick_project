/**
 * Global Settings Utility
 * Provides access to application-wide settings stored in admin_settings table
 */

import { SystemSetting } from '@/lib/supabaseEntities';

let settingsCache = null;
let cachePromise = null;

/**
 * Fetch all settings from database
 * @returns {Promise<Object>} - All settings as key-value pairs
 */
export async function fetchAllSettings() {
  if (settingsCache) {
    return settingsCache;
  }

  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      const settingsData = await SystemSetting.filter({}, 'setting_key', 100);
      const settingsMap = {};
      
      if (settingsData && settingsData.length > 0) {
        settingsData.forEach(setting => {
          const value = setting.setting_value;
          if (setting.setting_type === 'boolean') {
            settingsMap[setting.setting_key] = value === 'true';
          } else if (setting.setting_type === 'number') {
            settingsMap[setting.setting_key] = parseFloat(value);
          } else if (setting.setting_type === 'json') {
            try {
              settingsMap[setting.setting_key] = JSON.parse(value);
            } catch {
              settingsMap[setting.setting_key] = value;
            }
          } else {
            settingsMap[setting.setting_key] = value;
          }
        });
      }
      
      settingsCache = settingsMap;
      return settingsMap;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

/**
 * Get a specific setting value
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if setting not found
 * @returns {Promise<any>} - Setting value
 */
export async function getSetting(key, defaultValue = null) {
  const settings = await fetchAllSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

/**
 * Check if a feature is enabled
 * @param {string} featureKey - Feature setting key
 * @returns {Promise<boolean>} - Whether feature is enabled
 */
export async function isFeatureEnabled(featureKey) {
  const value = await getSetting(featureKey, false);
  return Boolean(value);
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache() {
  settingsCache = null;
  cachePromise = null;
}

/**
 * Feature flag helpers
 */
export const features = {
  // Registration & Authentication
  isRegistrationEnabled: () => isFeatureEnabled('enableRegistration'),
  isEmailVerificationRequired: () => isFeatureEnabled('requireEmailVerification'),
  isTwoFactorAuthEnabled: () => isFeatureEnabled('twoFactorAuth'),
  
  // Notifications
  areEmailNotificationsEnabled: () => isFeatureEnabled('notificationEmail'),
  arePushNotificationsEnabled: () => isFeatureEnabled('notificationPush'),
  
  // Layout & Display
  isMarqueeEnabled: () => isFeatureEnabled('enableMarquee'),
  areCategoriesEnabled: () => isFeatureEnabled('enableCategories'),
  isDarkModeEnabled: () => isFeatureEnabled('enableDarkMode'),
  isMobileAppEnabled: () => isFeatureEnabled('enableMobileApp'),
  
  // Payments
  areSubscriptionsEnabled: () => isFeatureEnabled('enableSubscriptions'),
  isMarketplaceEnabled: () => isFeatureEnabled('enableMarketplace'),
  areReferralsEnabled: () => isFeatureEnabled('enableReferrals'),
  
  // System
  isCacheEnabled: () => isFeatureEnabled('enableCache'),
  
  // Get numeric settings
  getSessionTimeout: () => getSetting('sessionTimeout', 30),
  getPasswordMinLength: () => getSetting('passwordMinLength', 8),
  getMaxUploadSize: () => getSetting('maxUploadSize', 10),
  getMarqueeSpeed: () => getSetting('marqueeSpeed', 40),
  getTaxRate: () => getSetting('taxRate', 21),
  getReferralBonus: () => getSetting('referralBonus', 10),
  getApiRateLimit: () => getSetting('apiRateLimit', 1000),
  getCacheTimeout: () => getSetting('cacheTimeout', 3600),
  
  // Get string settings
  getSiteName: () => getSetting('siteName', 'Eric Rabar'),
  getSiteUrl: () => getSetting('siteUrl', 'https://ericrabar.com'),
  getContactEmail: () => getSetting('contactEmail', 'contact@ericrabar.com'),
  getSupportEmail: () => getSetting('supportEmail', 'support@ericrabar.com'),
  getDefaultCurrency: () => getSetting('defaultCurrency', 'EUR'),
  getAllowedFileTypes: () => getSetting('allowedFileTypes', 'jpg,jpeg,png,mp4,pdf'),
  getFeaturedCategories: () => getSetting('featuredCategories', ''),
  getPrimaryColor: () => getSetting('primaryColor', '#6366f1'),
  getSecondaryColor: () => getSetting('secondaryColor', '#8b5cf6')
};

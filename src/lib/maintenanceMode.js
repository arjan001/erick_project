/**
 * Maintenance Mode Utility
 * Checks if maintenance mode is enabled and handles maintenance mode logic
 */

import { SystemSetting } from '@/lib/supabaseEntities'
import { supabase } from '@/lib/supabase'

let maintenanceSettings = null
let maintenanceCheckPromise = null

/**
 * Fetch maintenance mode settings
 * @returns {Promise<Object>} - Maintenance settings
 */
export async function fetchMaintenanceSettings() {
  try {
    const settings = await SystemSetting.filter({ 
      setting_key: ['maintenance_mode', 'maintenance_message', 'maintenance_start_time', 'maintenance_end_time', 'maintenance_allowed_ips', 'maintenance_show_countdown', 'maintenance_contact_email', 'maintenance_template']
    }, 'setting_key', 100)
    
    if (!settings || settings.length === 0) {
      return {
        enabled: false,
        message: '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>',
        startTime: null,
        endTime: null,
        allowedIPs: [],
        showCountdown: true,
        contactEmail: 'support@ericrabar.app',
        template: 'default'
      }
    }
    
    const settingsMap = {}
    settings.forEach(setting => {
      const value = setting.setting_value
      if (setting.setting_type === 'boolean') {
        settingsMap[setting.setting_key] = value === 'true'
      } else if (setting.setting_type === 'json') {
        try {
          settingsMap[setting.setting_key] = JSON.parse(value)
        } catch {
          settingsMap[setting.setting_key] = []
        }
      } else {
        settingsMap[setting.setting_key] = value
      }
    })
    
    return {
      enabled: settingsMap.maintenance_mode === true,
      message: settingsMap.maintenance_message || '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>',
      startTime: settingsMap.maintenance_start_time || null,
      endTime: settingsMap.maintenance_end_time || null,
      allowedIPs: settingsMap.maintenance_allowed_ips || [],
      showCountdown: settingsMap.maintenance_show_countdown !== false,
      contactEmail: settingsMap.maintenance_contact_email || 'support@ericrabar.app',
      template: settingsMap.maintenance_template || 'default'
    }
  } catch (error) {
    
    return {
      enabled: false,
      message: '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>',
      startTime: null,
      endTime: null,
      allowedIPs: [],
      showCountdown: true,
      contactEmail: 'support@ericrabar.app',
      template: 'default'
    }
  }
}

/**
 * Check if maintenance mode is enabled
 * @returns {Promise<boolean>} - Whether maintenance mode is enabled
 */
export async function isMaintenanceMode() {
  if (maintenanceSettings) {
    return maintenanceSettings.enabled
  }
  
  if (!maintenanceCheckPromise) {
    maintenanceCheckPromise = fetchMaintenanceSettings().then(settings => {
      maintenanceSettings = settings
      maintenanceCheckPromise = null
      return settings.enabled
    })
  }
  
  return maintenanceCheckPromise
}

/**
 * Check if current user is allowed during maintenance
 * @param {string} userIP - User's IP address
 * @returns {Promise<boolean>} - Whether user is allowed
 */
export async function isAllowedDuringMaintenance(userIP = null) {
  const settings = await fetchMaintenanceSettings()
  
  if (!settings.enabled) {
    return true
  }
  
  // If no IP restriction, allow no one during maintenance
  if (!settings.allowedIPs || settings.allowedIPs.length === 0) {
    return false
  }
  
  // Check if user IP is in allowed list
  if (userIP && settings.allowedIPs.includes(userIP)) {
    return true
  }
  
  return false
}

/**
 * Check if access code is valid for maintenance bypass
 * @param {string} code - Access code to validate
 * @returns {Promise<boolean>} - Whether code is valid and active
 */
export async function isValidAccessCode(code) {
  if (!code) return false
  
  try {
    const { data, error } = await supabase
      .from('maintenance_access_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()
    
    if (error || !data) return false
    
    // Check if code has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false
    }
    
    // Update usage count
    await supabase
      .from('maintenance_access_codes')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: (data.usage_count || 0) + 1
      })
      .eq('id', data.id)
    
    return true
  } catch (err) {
    
    return false
  }
}

/**
 * Check if user can access site (via IP or access code)
 * @param {string} userIP - User's IP address
 * @param {string} accessCode - Optional access code
 * @returns {Promise<boolean>} - Whether user is allowed
 */
export async function canAccessSite(userIP = null, accessCode = null) {
  const settings = await fetchMaintenanceSettings()
  
  if (!settings.enabled) {
    return true
  }
  
  // Check access code first
  if (accessCode) {
    const validCode = await isValidAccessCode(accessCode)
    if (validCode) return true
  }
  
  // Fall back to IP check
  return isAllowedDuringMaintenance(userIP)
}

/**
 * Get maintenance message
 * @returns {Promise<string>} - Maintenance message (HTML)
 */
export async function getMaintenanceMessage() {
  const settings = await fetchMaintenanceSettings()
  return settings.message
}

/**
 * Get maintenance countdown end time
 * @returns {Promise<Date|null>} - Maintenance end time
 */
export async function getMaintenanceEndTime() {
  const settings = await fetchMaintenanceSettings()
  return settings.endTime ? new Date(settings.endTime) : null
}

/**
 * Check if maintenance is scheduled
 * @returns {Promise<boolean>} - Whether maintenance is scheduled
 */
export async function isMaintenanceScheduled() {
  const settings = await fetchMaintenanceSettings()
  
  if (!settings.startTime) {
    return false
  }
  
  const now = new Date()
  const startTime = new Date(settings.startTime)
  
  return startTime > now
}

/**
 * Get maintenance template
 * @returns {Promise<string>} - Maintenance template name
 */
export async function getMaintenanceTemplate() {
  const settings = await fetchMaintenanceSettings()
  return settings.template
}

/**
 * Clear cached maintenance settings (for admin updates)
 */
export function clearMaintenanceCache() {
  maintenanceSettings = null
  maintenanceCheckPromise = null
}

/**
 * Prebuilt maintenance templates
 */
export const MAINTENANCE_TEMPLATES = {
  default: {
    name: 'Default',
    message: `<h2 class="text-3xl font-bold text-gray-900 mb-4">Site Under Maintenance</h2>
<p class="text-gray-600 mb-6">We are currently performing scheduled maintenance. Please check back soon.</p>
<p class="text-sm text-gray-500">We apologize for any inconvenience.</p>`
  },
  coming_soon: {
    name: 'Coming Soon',
    message: `<h2 class="text-4xl font-bold text-gray-900 mb-2">Coming Soon</h2>
<p class="text-lg text-gray-600 mb-4">We're building something extraordinary</p>
<p class="text-gray-500 mb-6">The future of creative collaboration is arriving. Be the first to know when we launch.</p>
<div class="bg-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
<p class="text-sm text-gray-600 mb-2"><strong>What to expect:</strong></p>
<ul class="text-sm text-gray-600 space-y-1">
<li>• Seamless artist-client connections</li>
<li>• Powerful project management tools</li>
<li>• Secure payment processing</li>
<li>• Global talent marketplace</li>
</ul>
</div>
<p class="text-sm text-gray-500">Expected launch: Q4 2026</p>`
  },
  update: {
    name: 'System Update',
    message: `<h2 class="text-3xl font-bold text-gray-900 mb-4">System Update in Progress</h2>
<p class="text-gray-600 mb-6">We're upgrading our systems to serve you better. This should take approximately 2-3 hours.</p>
<div class="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4">
<p class="text-gray-800 text-sm"><strong>What's new:</strong> Enhanced performance, new features, and improved security.</p>
</div>`
  },
  emergency: {
    name: 'Emergency Maintenance',
    message: `<h2 class="text-3xl font-bold text-red-600 mb-4">Emergency Maintenance</h2>
<p class="text-gray-600 mb-6">We're addressing an urgent issue. We apologize for the unexpected downtime.</p>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
<p class="text-red-800 text-sm"><strong>Status:</strong> Our team is working to resolve this as quickly as possible.</p>
</div>
<p class="text-sm text-gray-500">For urgent inquiries, please contact us at support@ericrabar.app</p>`
  }
}

/**
 * Get template by name
 * @param {string} templateName - Template name
 * @returns {Object|null} - Template object
 */
export function getTemplate(templateName) {
  return MAINTENANCE_TEMPLATES[templateName] || MAINTENANCE_TEMPLATES.default
}

/**
 * Get all templates
 * @returns {Array} - Array of templates
 */
export function getAllTemplates() {
  return Object.entries(MAINTENANCE_TEMPLATES).map(([key, value]) => ({
    key,
    name: value.name,
    message: value.message
  }))
}

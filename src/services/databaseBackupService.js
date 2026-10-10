/**
 * Database Backup Service
 * Provides functionality to backup and restore Supabase database data
 */

import { supabase } from '@/lib/supabase'

// List of all tables to backup (in dependency order)
const TABLES_TO_BACKUP = [
  // Core tables
  'users',
  'creators',
  'teams',
  'project_owners',
  'backers',
  'subscriptions',
  'subscription_packages',
  'user_sessions',

  // Jobs & Projects
  'jobs',
  'projects',
  'job_roles',
  'applications',
  'invites',

  // Networking
  'connections',
  'network_events',

  // Shop
  'shop_products',
  'shop_orders',
  'shop_order_items',
  'shop_auctions',
  'auction_bids',
  'wishlist',

  // Payments
  'payment_settings',
  'makamesco_transactions',

  // CMS & SEO
  'cms_pages',
  'seo_settings',
  'page_metadata',

  // Admin & Settings
  'admin_settings',
  'system_settings',
  'maintenance_access_codes',

  // Partners
  'partners',

  // Newsletter
  'newsletter_subscribers',
  'newsletter_campaigns',
  'newsletter_analytics',
  'newsletter_templates',

  // Featured Content
  'featured_creatives',
  'featured_work',
  'featured_brands',

  // Categories
  'categories',
  'skills_categories',

  // Other
  'popups',
  'email_settings',
]

/**
 * Fetch all data from a specific table
 */
async function fetchTableData(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')

    if (error) throw error
    return { table: tableName, data: data || [], success: true }
  } catch (error) {
    console.error(`Error fetching table ${tableName}:`, error)
    return { table: tableName, data: [], success: false, error: error.message }
  }
}

/**
 * Backup all tables
 * @returns {Promise<Object>} - Backup object with all table data
 */
export async function backupDatabase() {
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tables: {}
  }

  console.log('Starting database backup...')

  for (const tableName of TABLES_TO_BACKUP) {
    console.log(`Backing up ${tableName}...`)
    const result = await fetchTableData(tableName)
    backup.tables[tableName] = result
  }

  console.log('Database backup completed')
  return backup
}

/**
 * Download backup as JSON file
 * @param {Object} backup - Backup object
 * @param {string} filename - Filename for download
 */
export function downloadBackup(backup, filename = null) {
  const defaultFilename = `smartgigs-backup-${new Date().toISOString().split('T')[0]}.json`
  const finalFilename = filename || defaultFilename

  const jsonString = JSON.stringify(backup, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Backup and download in one step
 */
export async function backupAndDownload() {
  try {
    const backup = await backupDatabase()
    downloadBackup(backup)
    return { success: true, backup }
  } catch (error) {
    console.error('Backup failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats() {
  const stats = {
    totalTables: TABLES_TO_BACKUP.length,
    tables: {}
  }

  for (const tableName of TABLES_TO_BACKUP) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        stats.tables[tableName] = count || 0
      } else {
        stats.tables[tableName] = 'Error'
      }
    } catch (error) {
      stats.tables[tableName] = 'Error'
    }
  }

  return stats
}

/**
 * Validate backup file
 */
export function validateBackup(backup) {
  if (!backup || typeof backup !== 'object') {
    return { valid: false, error: 'Invalid backup format' }
  }

  if (!backup.version || !backup.timestamp || !backup.tables) {
    return { valid: false, error: 'Missing required backup fields' }
  }

  if (typeof backup.tables !== 'object') {
    return { valid: false, error: 'Invalid tables format' }
  }

  return { valid: true }
}

/**
 * Read backup file from disk
 */
export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result)
        const validation = validateBackup(backup)
        if (validation.valid) {
          resolve(backup)
        } else {
          reject(new Error(validation.error))
        }
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

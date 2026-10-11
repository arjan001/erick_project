import { supabase } from '@/lib/supabase'
import { Artist } from '@/lib/supabaseEntities'

/**
 * Username Service
 * Handles username availability checking, validation, and resolution
 */

// Username validation regex: alphanumeric, underscores, 3-20 characters
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} { valid: boolean, error: string | null }
 */
export function validateUsername(username) {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' }
  }

  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }

  return { valid: true, error: null }
}

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - true if available, false if taken
 */
export async function checkUsernameAvailability(username) {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('username')
      .eq('username', username)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is what we want
      console.error('Error checking username availability:', error)
      return false
    }

    // If data exists, username is taken
    return !data
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
  }
}

/**
 * Get user by username
 * @param {string} username - Username to look up
 * @returns {Promise<object|null>} - User object or null
 */
export async function getUserByUsername(username) {
  try {
    const artists = await Artist.filter({ username })
    return artists?.[0] || null
  } catch (error) {
    console.error('Error getting user by username:', error)
    return null
  }
}

/**
 * Resolve username to email for login
 * @param {string} username - Username to resolve
 * @returns {Promise<string|null>} - Email or null
 */
export async function resolveUsernameToEmail(username) {
  try {
    const artist = await getUserByUsername(username)
    return artist?.email || null
  } catch (error) {
    console.error('Error resolving username to email:', error)
    return null
  }
}

/**
 * Update username for a user
 * @param {string} userId - User ID
 * @param {string} username - New username
 * @returns {Promise<object>} - { success: boolean, error: string | null }
 */
export async function updateUsername(userId, username) {
  try {
    const validation = validateUsername(username)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const isAvailable = await checkUsernameAvailability(username)
    if (!isAvailable) {
      return { success: false, error: 'Username is already taken' }
    }

    const { error } = await supabase
      .from('creators')
      .update({ username })
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating username:', error)
    return { success: false, error: 'Failed to update username' }
  }
}

/**
 * Search artists by username (partial match)
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} - Array of matching artists
 */
export async function searchArtistsByUsername(query, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(limit)

    if (error) {
      console.error('Error searching artists by username:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching artists by username:', error)
    return []
  }
}

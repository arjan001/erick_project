import { supabase } from '@/lib/supabase'
import { Artist, Team, ProjectOwner, Backer } from '@/lib/supabaseEntities'

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
 * Check if username is available across all user tables
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - true if available, false if taken
 */
export async function checkUsernameAvailability(username) {
  try {
    // Check creators table
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('username')
      .eq('username', username)
      .limit(1)
      .single()

    if (creatorData) return false

    // Check teams table
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('username')
      .eq('username', username)
      .limit(1)
      .single()

    if (teamData) return false

    // Check project_owners table
    const { data: ownerData, error: ownerError } = await supabase
      .from('project_owners')
      .select('username')
      .eq('username', username)
      .limit(1)
      .single()

    if (ownerData) return false

    // Check backers table
    const { data: backerData, error: backerError } = await supabase
      .from('backers')
      .select('username')
      .eq('username', username)
      .limit(1)
      .single()

    if (backerData) return false

    return true
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
  }
}

/**
 * Get user by username (searches all user tables)
 * @param {string} username - Username to look up
 * @returns {Promise<object|null>} - User object with type and data or null
 */
export async function getUserByUsername(username) {
  try {
    // Check creators table
    const artists = await Artist.filter({ username })
    if (artists?.[0]) return { type: 'artist', data: artists[0] }

    // Check teams table
    const teams = await Team.filter({ username })
    if (teams?.[0]) return { type: 'team', data: teams[0] }

    // Check project_owners table
    const owners = await ProjectOwner.filter({ username })
    if (owners?.[0]) return { type: 'client', data: owners[0] }

    // Check backers table
    const backers = await Backer.filter({ username })
    if (backers?.[0]) return { type: 'backer', data: backers[0] }

    return null
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
    const user = await getUserByUsername(username)
    if (!user) return null

    // Return the appropriate email field based on user type
    switch (user.type) {
      case 'artist':
        return user.data.email
      case 'team':
        return user.data.contact_email
      case 'client':
        return user.data.email
      case 'backer':
        return user.data.contact_email
      default:
        return null
    }
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

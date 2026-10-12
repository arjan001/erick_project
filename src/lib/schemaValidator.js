/**
 * Schema Validator for SmartGigs Kenya
 *
 * This utility provides runtime validation for Supabase queries to catch
 * column usage errors early. It maintains a schema definition and validates
 * queries against it before execution.
 *
 * @module schemaValidator
 *
 * @example
 * import { validateQuery } from '@/lib/schemaValidator'
 * validateQuery('creators', { email: 'test@example.com' }) // Returns true/false
 *
 * @typedef {Object} SchemaDefinition
 * @property {string} [column] - Column name with its data type
 *
 * @typedef {Object} FilterObject
 * @property {*} [column] - Filter value for a column
 */

/**
 * Known schema definition based on actual database schema
 * This should be kept in sync with the actual Supabase schema
 */
const SCHEMA = {
  // Core user table
  users: {
    id: 'uuid',
    email: 'text',
    full_name: 'text',
    phone: 'text',
    avatar_url: 'text',
    role: 'text',
    is_verified: 'boolean',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Entity tables (all use user_id FK)
  artists: {
    id: 'uuid',
    user_id: 'uuid',
    display_name: 'text',
    stage_name: 'text',
    skills: 'text[]',
    years_experience: 'integer',
    hourly_rate: 'numeric',
    availability_status: 'text',
    admin_approval_status: 'text',
    rejection_reason: 'text',
    social_media_url: 'text',
    website_url: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  creators: {
    id: 'uuid',
    user_id: 'uuid',
    display_name: 'text',
    slug: 'text',
    email: 'text', // Not unique, can be different from user email
    full_name: 'text',
    profession: 'text',
    // Profile fields
    bio: 'text',
    profile_photo_url: 'text',
    based_in_city: 'text',
    based_in_country: 'text',
    years_of_experience: 'integer',
    hourly_rate: 'numeric',
    availability_status: 'text',
    // Portfolio
    portfolio_urls: 'jsonb',
    // Identity
    roles: 'jsonb',
    skills_experience: 'jsonb',
    past_clients: 'jsonb',
    project_specialties: 'jsonb',
    languages_spoken: 'jsonb',
    countries_worked: 'jsonb',
    // Social
    website: 'text',
    linkedin: 'text',
    instagram: 'text',
    youtube: 'text',
    twitter: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  clients: {
    id: 'uuid',
    user_id: 'uuid',
    display_name: 'text',
    company_name: 'text',
    slug: 'text',
    bio: 'text',
    location: 'text',
    city: 'text',
    country: 'text',
    logo_url: 'text',
    cover_image: 'text',
    company_type: 'text',
    industry: 'text',
    contact_email: 'text',
    contact_phone: 'text',
    website_url: 'text',
    social_media: 'jsonb',
    featured: 'boolean',
    verification_status: 'text',
    is_suspended: 'boolean',
    is_online: 'boolean',
    last_active: 'timestamp with time zone',
    organization_type: 'text',
    username: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
    created_date: 'timestamp with time zone',
    // NOTE: NO 'email', 'full_name', 'referred_by' columns - use public.users.email via user_id
  },

  teams: {
    id: 'uuid',
    user_id: 'uuid',
    team_name: 'text',
    username: 'text',
    // Contact fields
    contact_name: 'text',
    contact_email: 'text',
    contact_phone: 'text',
    team_code: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  backers: {
    id: 'uuid',
    user_id: 'uuid',
    display_name: 'text',
    company_name: 'text',
    // Contact fields
    contact_email: 'text',
    contact_phone: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  project_owners: {
    id: 'uuid',
    user_id: 'uuid',
    email: 'text',
    full_name: 'text',
    company: 'text',
    phone: 'text',
    website: 'text',
    bio: 'text',
    city: 'text',
    country: 'text',
    profile_photo_url: 'text',
    logo_url: 'text',
    // Social media links
    linkedin: 'text',
    instagram: 'text',
    twitter: 'text',
    youtube: 'text',
    // Notification preferences
    email_notifications: 'boolean',
    project_updates: 'boolean',
    profile_public: 'boolean',
    // Timestamps
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Project and job tables
  projects: {
    id: 'uuid',
    client_id: 'uuid',
    title: 'text',
    description: 'text',
    project_type: 'text',
    location_city: 'text',
    location_country: 'text',
    departments_needed: 'jsonb',
    budget_range: 'text',
    status: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
    // NOTE: NO 'project_owner_email' column - use client_id -> clients.user_id -> users.email
  },

  jobs: {
    id: 'uuid',
    client_id: 'uuid',
    project_id: 'uuid',
    title: 'text',
    description: 'text',
    job_type: 'text',
    location: 'text',
    required_skills: 'jsonb',
    status: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
    // NOTE: NO 'client_email' column - use client_id
  },

  // Application table
  applications: {
    id: 'uuid',
    job_id: 'uuid',
    project_id: 'uuid',
    user_id: 'uuid',
    team_id: 'uuid',
    status: 'text',
    cover_letter: 'text',
    proposed_rate: 'numeric',
    // Other
    metadata: 'jsonb',
    applied_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
    // NOTE: NO 'artist_email' column - use user_id -> users.email
  },

  // Subscription table
  subscriptions: {
    id: 'uuid',
    user_id: 'uuid',
    package_id: 'uuid',
    package_name: 'text',
    status: 'text',
    start_date: 'timestamp with time zone',
    end_date: 'timestamp with time zone',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
    // NOTE: NO 'user_email' or 'user_name' columns - use public.users via user_id
  },

  // Conversation table
  conversations: {
    id: 'uuid',
    participant_1: 'uuid',
    participant_2: 'uuid',
    project_id: 'uuid',
    job_id: 'uuid',
    last_message_at: 'timestamp with time zone',
    created_at: 'timestamp with time zone',
    // NOTE: NO email columns - use participant_1, participant_2
  },

  // Message table
  messages: {
    id: 'uuid',
    conversation_id: 'uuid',
    sender_id: 'uuid',
    content: 'text',
    is_read: 'boolean',
    read_at: 'timestamp with time zone',
    created_at: 'timestamp with time zone',
    // NOTE: NO 'sender_email' or 'recipient_email' columns - use sender_id and conversation_id
  },

  // Notification table
  notifications: {
    id: 'uuid',
    user_id: 'uuid',
    type: 'text',
    title: 'text',
    content: 'text',
    link_url: 'text',
    is_read: 'boolean',
    created_at: 'timestamp with time zone',
    // NOTE: NO 'recipient_email' or 'recipient_id' columns - use user_id
  },

  // Connection table
  connections: {
    id: 'uuid',
    requester_id: 'uuid',
    receiver_id: 'uuid',
    status: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
    // NOTE: NO 'requester_email', 'recipient_email', 'user_email' columns - use requester_id, receiver_id
  },

  // Artist media table (formerly portfolio_clips)
  artist_media: {
    id: 'uuid',
    user_id: 'uuid',
    title: 'text',
    description: 'text',
    media_type: 'text',
    media_url: 'text',
    thumbnail_url: 'text',
    project_type: 'text',
    roles: 'jsonb',
    status: 'text',
    approved_for_visual_direction: 'boolean',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Shop tables
  shop_products: {
    id: 'uuid',
    name: 'text',
    description: 'text',
    price: 'numeric',
    category: 'text',
    image_url: 'text',
    stock: 'integer',
    status: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  shop_orders: {
    id: 'uuid',
    user_id: 'uuid',
    total_amount: 'numeric',
    status: 'text',
    payment_method: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Subscription packages
  subscription_packages: {
    id: 'uuid',
    name: 'text',
    description: 'text',
    price: 'numeric',
    duration_days: 'integer',
    features: 'jsonb',
    status: 'text',
    // Other
    metadata: 'jsonb',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Analytics
  page_views: {
    id: 'uuid',
    session_id: 'uuid',
    user_id: 'uuid',
    page_path: 'text',
    page_title: 'text',
    viewed_at: 'timestamp with time zone',
    // Other
    metadata: 'jsonb',
  },

  // Partners table
  partners: {
    id: 'uuid',
    name: 'text',
    logo_url: 'text',
    website: 'text',
    description: 'text',
    industry: 'text',
    contact_email: 'text',
    contact_phone: 'text',
    address: 'text',
    partnership_type: 'text',
    status: 'text',
    featured: 'boolean',
    started_at: 'date',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Invites table
  invites: {
    id: 'uuid',
    code: 'text',
    inviter_email: 'text',
    inviter_name: 'text',
    inviter_role: 'text',
    inviter_entity_id: 'uuid',
    applicant_email: 'text',
    applicant_name: 'text',
    applicant_type: 'text',
    tracking_code: 'text',
    status: 'text',
    used_at: 'timestamp with time zone',
    expires_at: 'timestamp with time zone',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Artists table (from DATABASE_SCHEMA.sql)
  artists: {
    id: 'uuid',
    user_id: 'uuid',
    display_name: 'text',
    stage_name: 'text',
    skills: 'text[]',
    years_experience: 'integer',
    hourly_rate: 'numeric',
    availability_status: 'text',
    admin_approval_status: 'text',
    rejection_reason: 'text',
    social_media_url: 'text',
    website_url: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Teams table (from DATABASE_SCHEMA.sql)
  teams: {
    id: 'uuid',
    user_id: 'uuid',
    team_name: 'text',
    team_size: 'integer',
    specialties: 'text[]',
    hourly_rate: 'numeric',
    availability_status: 'text',
    admin_approval_status: 'text',
    rejection_reason: 'text',
    logo_url: 'text',
    website_url: 'text',
    social_media_url: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Backers table (from DATABASE_SCHEMA.sql)
  backers: {
    id: 'uuid',
    user_id: 'uuid',
    organization_name: 'text',
    investment_focus: 'text[]',
    total_invested: 'numeric',
    investment_count: 'integer',
    website_url: 'text',
    social_media_url: 'text',
    bio: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Jobs table (from DATABASE_SCHEMA.sql)
  jobs: {
    id: 'uuid',
    project_id: 'uuid',
    client_id: 'uuid',
    title: 'text',
    description: 'text',
    job_type: 'text',
    location: 'text',
    budget: 'numeric',
    status: 'text',
    required_skills: 'text[]',
    application_deadline: 'timestamp with time zone',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Applications table (from DATABASE_SCHEMA.sql)
  applications: {
    id: 'uuid',
    job_id: 'uuid',
    artist_id: 'uuid',
    team_id: 'uuid',
    cover_letter: 'text',
    proposed_rate: 'numeric',
    status: 'text',
    applied_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Portfolio clips table (from DATABASE_SCHEMA.sql)
  portfolio_clips: {
    id: 'uuid',
    artist_id: 'uuid',
    team_id: 'uuid',
    title: 'text',
    description: 'text',
    video_url: 'text',
    thumbnail_url: 'text',
    project_name: 'text',
    role: 'text',
    duration_seconds: 'integer',
    is_featured: 'boolean',
    display_order: 'integer',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Projects table (from DATABASE_SCHEMA.sql)
  projects: {
    id: 'uuid',
    client_id: 'uuid',
    title: 'text',
    description: 'text',
    project_type: 'text',
    status: 'text',
    budget: 'numeric',
    location: 'text',
    start_date: 'date',
    end_date: 'date',
    images: 'text[]',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },
}

/**
 * Columns that are commonly used but don't exist in the schema
 * These should trigger warnings when used
 */
const DEPRECATED_COLUMNS = {
  creators: ['email'], // Should use user_id and get email from public.users
  clients: ['email', 'full_name', 'referred_by'], // Does not exist, use user_id -> users.email, users.full_name
  projects: ['project_owner_email'], // Does not exist, use client_id
  jobs: ['client_email'], // Does not exist, use client_id
  applications: ['artist_email'], // Does not exist, use artist_id -> users.email
  subscriptions: ['user_email', 'user_name'], // Does not exist, use user_id
  messages: ['sender_email', 'recipient_email'], // Does not exist, use sender_id and conversation_id
  notifications: ['recipient_email', 'recipient_id'], // Does not exist, use user_id
  connections: ['requester_email', 'recipient_email', 'user_email', 'connected_artist_id'], // Does not exist, use requester_id, receiver_id
}

/**
 * Validate a query against the schema
 *
 * @param {string} tableName - The table being queried
 * @param {FilterObject} filters - The filter object being used
 * @param {boolean} [throwOnError=false] - Whether to throw an error or return false
 * @returns {boolean} True if valid, false if invalid
 *
 * @example
 * validateQuery('creators', { user_id: '123-abc' }) // true
 * validateQuery('creators', { email: 'test@example.com' }) // false (deprecated column warning)
 */
export function validateQuery(tableName, filters = {}, throwOnError = false) {
  const tableSchema = SCHEMA[tableName]

  if (!tableSchema) {
    const message = `Table "${tableName}" not found in schema definition`
    if (throwOnError) {
      throw new Error(message)
    }
    console.warn(`[Schema Validator] ${message}`)
    return false
  }

  const errors = []

  for (const column in filters) {
    // Check if column exists in schema
    if (!tableSchema[column]) {
      // Check if it's a deprecated column
      const deprecatedFor = DEPRECATED_COLUMNS[tableName]?.includes(column)

      if (deprecatedFor) {
        errors.push(
          `Column "${column}" is deprecated in table "${tableName}". ` +
          `Please use the correct column based on the new schema (user_id-based).`
        )
      } else {
        errors.push(
          `Column "${column}" does not exist in table "${tableName}". ` +
          `Available columns: ${Object.keys(tableSchema).join(', ')}`
        )
      }
    }
  }

  if (errors.length > 0) {
    const message = `Schema validation failed for table "${tableName}":\n${errors.join('\n')}`
    if (throwOnError) {
      throw new Error(message)
    }
    console.warn(`[Schema Validator] ${message}`)
    return false
  }

  return true
}

/**
 * Get available columns for a table
 *
 * @param {string} tableName - The table name
 * @returns {string[]} Array of column names
 *
 * @example
 * getTableColumns('creators') // ['id', 'user_id', 'display_name', ...]
 */
export function getTableColumns(tableName) {
  return Object.keys(SCHEMA[tableName] || {})
}

/**
 * Check if a column exists in a table
 *
 * @param {string} tableName - The table name
 * @param {string} columnName - The column name
 * @returns {boolean} True if column exists
 *
 * @example
 * columnExists('creators', 'user_id') // true
 * columnExists('creators', 'email') // true (deprecated)
 * columnExists('creators', 'nonexistent') // false
 */
export function columnExists(tableName, columnName) {
  return columnName in (SCHEMA[tableName] || {})
}

/**
 * Get the data type of a column
 *
 * @param {string} tableName - The table name
 * @param {string} columnName - The column name
 * @returns {string|null} The column type or null if not found
 *
 * @example
 * getColumnType('creators', 'user_id') // 'uuid'
 * getColumnType('creators', 'display_name') // 'text'
 * getColumnType('creators', 'nonexistent') // null
 */
export function getColumnType(tableName, columnName) {
  return SCHEMA[tableName]?.[columnName] || null
}

/**
 * Validate select clause (array of column names)
 *
 * @param {string} tableName - The table name
 * @param {string[]} columns - Array of column names
 * @param {boolean} throwOnError - Whether to throw an error
 * @returns {boolean} - True if valid
 */
export function validateSelect(tableName, columns = [], throwOnError = false) {
  const tableSchema = SCHEMA[tableName]

  if (!tableSchema) {
    const message = `Table "${tableName}" not found in schema definition`
    if (throwOnError) {
      throw new Error(message)
    }
    console.warn(`[Schema Validator] ${message}`)
    return false
  }

  const errors = []

  for (const column of columns) {
    // Handle nested selects (e.g., 'users(email)')
    const baseColumn = column.split('(')[0]

    if (baseColumn && !tableSchema[baseColumn] && baseColumn !== '*') {
      errors.push(
        `Column "${column}" does not exist in table "${tableName}". ` +
        `Available columns: ${Object.keys(tableSchema).join(', ')}`
      )
    }
  }

  if (errors.length > 0) {
    const message = `Select validation failed for table "${tableName}":\n${errors.join('\n')}`
    if (throwOnError) {
      throw new Error(message)
    }
    console.warn(`[Schema Validator] ${message}`)
    return false
  }

  return true
}

export default {
  validateQuery,
  getTableColumns,
  columnExists,
  getColumnType,
  validateSelect,
  SCHEMA,
  DEPRECATED_COLUMNS,
}

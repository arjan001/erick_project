/**
 * Input Validation Utility
 * Comprehensive validation for all user inputs
 */

// Email validation
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  if (email.length > 255) {
    return { valid: false, error: 'Email is too long (max 255 characters)' }
  }
  
  return { valid: true }
}

// Password validation
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' }
  }
  
  // Check for common passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'letmein']
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'Password is too common' }
  }
  
  return { valid: true }
}

// Name validation
export function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` }
  }
  
  if (name.length > 100) {
    return { valid: false, error: `${fieldName} is too long (max 100 characters)` }
  }
  
  // Allow only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-'\u00C0-\u00FF]+$/
  if (!nameRegex.test(name)) {
    return { valid: false, error: `${fieldName} contains invalid characters` }
  }
  
  return { valid: true }
}

// Phone number validation
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Phone number must be between 10 and 15 digits' }
  }
  
  return { valid: true }
}

// URL validation
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' }
  }
  
  try {
    const urlObj = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' }
    }
    
    // Check URL length
    if (url.length > 2048) {
      return { valid: false, error: 'URL is too long (max 2048 characters)' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

// Text validation (general text fields)
export function validateText(text, fieldName = 'Text', options = {}) {
  const {
    required = true,
    minLength = 1,
    maxLength = 1000,
    allowEmpty = false
  } = options
  
  if (!text) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` }
    }
    return { valid: true }
  }
  
  if (typeof text !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` }
  }
  
  if (!allowEmpty && text.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` }
  }
  
  if (text.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }
  
  if (text.length > maxLength) {
    return { valid: false, error: `${fieldName} is too long (max ${maxLength} characters)` }
  }
  
  return { valid: true }
}

// Number validation
export function validateNumber(value, fieldName = 'Number', options = {}) {
  const {
    required = true,
    min = -Infinity,
    max = Infinity,
    integer = false
  } = options
  
  if (value === null || value === undefined) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` }
    }
    return { valid: true }
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }
  
  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be an integer` }
  }
  
  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` }
  }
  
  if (num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` }
  }
  
  return { valid: true }
}

// Date validation
export function validateDate(date, fieldName = 'Date', options = {}) {
  const {
    required = true,
    minDate = null,
    maxDate = null
  } = options
  
  if (!date) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` }
    }
    return { valid: true }
  }
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: `${fieldName} must be a valid date` }
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    return { valid: false, error: `${fieldName} must be after ${minDate}` }
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    return { valid: false, error: `${fieldName} must be before ${maxDate}` }
  }
  
  return { valid: true }
}

// File validation
export function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
    required = true
  } = options
  
  if (!file) {
    if (required) {
      return { valid: false, error: 'File is required' }
    }
    return { valid: true }
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` }
  }
  
  return { valid: true }
}

// Role validation
export function validateRole(role) {
  const validRoles = ['artist', 'team', 'client', 'backer', 'project_owner', 'admin', 'artist_admin']
  
  if (!role || typeof role !== 'string') {
    return { valid: false, error: 'Role is required' }
  }
  
  if (!validRoles.includes(role)) {
    return { valid: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }
  }
  
  return { valid: true }
}

// Currency/amount validation
export function validateAmount(amount, fieldName = 'Amount') {
  if (!amount && amount !== 0) {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  const num = Number(amount)
  
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }
  
  if (num < 0) {
    return { valid: false, error: `${fieldName} must be positive` }
  }
  
  if (num > 999999999.99) {
    return { valid: false, error: `${fieldName} is too large` }
  }
  
  return { valid: true }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Sanitize object recursively
export function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {}
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key])
    }
    return sanitized
  }
  
  return obj
}

// Validate complete form data
export function validateFormData(formData, validationRules) {
  const errors = {}
  let isValid = true
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field]
    let result
    
    switch (rules.type) {
      case 'email':
        result = validateEmail(value)
        break
      case 'password':
        result = validatePassword(value)
        break
      case 'name':
        result = validateName(value, rules.fieldName || field)
        break
      case 'phone':
        result = validatePhone(value)
        break
      case 'url':
        result = validateURL(value)
        break
      case 'text':
        result = validateText(value, rules.fieldName || field, rules.options)
        break
      case 'number':
        result = validateNumber(value, rules.fieldName || field, rules.options)
        break
      case 'date':
        result = validateDate(value, rules.fieldName || field, rules.options)
        break
      case 'file':
        result = validateFile(value, rules.options)
        break
      case 'role':
        result = validateRole(value)
        break
      case 'amount':
        result = validateAmount(value, rules.fieldName || field)
        break
      default:
        result = { valid: true }
    }
    
    if (!result.valid) {
      errors[field] = result.error
      isValid = false
    }
  }
  
  return { isValid, errors }
}

// Validation rules for common forms
export const VALIDATION_RULES = {
  registration: {
    email: { type: 'email' },
    password: { type: 'password' },
    firstName: { type: 'name', fieldName: 'First name' },
    lastName: { type: 'name', fieldName: 'Last name' }
  },
  
  login: {
    email: { type: 'email' },
    password: { type: 'password' }
  },
  
  jobPosting: {
    title: { type: 'text', fieldName: 'Job title', options: { minLength: 5, maxLength: 100 } },
    description: { type: 'text', fieldName: 'Description', options: { minLength: 20, maxLength: 5000 } },
    budget: { type: 'amount', fieldName: 'Budget' },
    category: { type: 'text', fieldName: 'Category', options: { minLength: 2, maxLength: 50 } }
  },
  
  teamInvitation: {
    email: { type: 'email' },
    role: { type: 'role' }
  },
  
  backerInvestment: {
    amount: { type: 'amount', fieldName: 'Investment amount' },
    projectTitle: { type: 'text', fieldName: 'Project title', options: { minLength: 2, maxLength: 200 } }
  }
}

// Check for SQL injection patterns
export function detectSQLInjection(input) {
  if (!input || typeof input !== 'string') {
    return false
  }
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/|@@|@|xp_|sp_)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"].*['"]\s*=\s*['"].*['"])/i,
    /(\b(OR|AND)\s+[\w]+\s*=\s*[\w]+)/i,
    /(\b(OR|AND)\s+[\w]+\s*LIKE\s*['"].*['"])/i,
    /(\b(OR|AND)\s+[\w]+\s*IN\s*\(.*\))/i,
    /(\b(OR|AND)\s+[\w]+\s*BETWEEN\s*.*\s*AND\s*.*)/i
  ]
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return true
    }
  }
  
  return false
}

// Check for XSS patterns
export function detectXSS(input) {
  if (!input || typeof input !== 'string') {
    return false
  }
  
  const xssPatterns = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    /<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi,
    /<object\b[^>]*>([\s\S]*?)<\/object>/gi,
    /<embed\b[^>]*>([\s\S]*?)<\/embed>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\s*img[^>]+src\s*=\s*["']javascript:/gi,
    /<\s*body[^>]+onload\s*=/gi,
    /<\s*input[^>]+on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ]
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return true
    }
  }
  
  return false
}

// Comprehensive security check
export function securityCheck(input) {
  if (!input || typeof input !== 'string') {
    return { safe: true }
  }
  
  const issues = []
  
  if (detectSQLInjection(input)) {
    issues.push('SQL injection pattern detected')
  }
  
  if (detectXSS(input)) {
    issues.push('XSS pattern detected')
  }
  
  if (input.length > 10000) {
    issues.push('Input too long')
  }
  
  return {
    safe: issues.length === 0,
    issues
  }
}

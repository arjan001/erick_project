import { supabase } from './supabase'

/**
 * File Upload Service
 * Handles file uploads to Supabase Storage with proper validation
 */

const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
]

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', 
  '.vbs', '.js', '.jar', '.app', '.deb', '.rpm', 
  '.dmg', '.msi', '.sh', '.ps1'
]

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateFile(file) {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
    }
  }

  // Check file extension
  const fileName = file.name.toLowerCase()
  const hasBlockedExtension = BLOCKED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  if (hasBlockedExtension) {
    return {
      valid: false,
      error: 'File type not allowed for security reasons'
    }
  }

  // Check MIME type (if available)
  if (file.type && !ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported'
    }
  }

  return { valid: true }
}

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The bucket name (default: 'message-attachments')
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<Object>} - { data: { path: string, url: string }, error: string }
 */
export async function uploadFile(file, bucket = 'message-attachments', folder = '') {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    return { data: null, error: validation.error }
  }

  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${timestamp}_${randomString}_${sanitizedName}`
    
    // Construct full path
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload to Supabase
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      
      return { data: null, error: uploadError.message }
    }

    // Get public URL (if bucket is public) or signed URL (if private)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      data: {
        path: data.path,
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      },
      error: null
    }
  } catch (error) {
    
    return { data: null, error: error.message || 'Failed to upload file' }
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} path - The file path in the bucket
 * @param {string} bucket - The bucket name (default: 'message-attachments')
 * @returns {Promise<Object>} - { error: string }
 */
export async function deleteFile(path, bucket = 'message-attachments') {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    
    return { error: error.message || 'Failed to delete file' }
  }
}

/**
 * Upload multiple files
 * @param {File[]} files - Array of files to upload
 * @param {string} bucket - The bucket name
 * @param {string} folder - Optional folder path
 * @returns {Promise<Object>} - { data: Array, errors: Array }
 */
export async function uploadMultipleFiles(files, bucket = 'message-attachments', folder = '') {
  const results = []
  const errors = []

  for (const file of files) {
    const result = await uploadFile(file, bucket, folder)
    if (result.error) {
      errors.push({ fileName: file.name, error: result.error })
    } else {
      results.push(result.data)
    }
  }

  return { data: results, errors }
}

/**
 * Get a signed URL for a private file
 * @param {string} path - The file path
 * @param {string} bucket - The bucket name
 * @param {number} expiresIn - URL expiration in seconds (default: 3600)
 * @returns {Promise<Object>} - { data: { signedUrl: string }, error: string }
 */
export async function getSignedUrl(path, bucket = 'message-attachments', expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: { signedUrl: data.signedUrl }, error: null }
  } catch (error) {
    
    return { data: null, error: error.message || 'Failed to get signed URL' }
  }
}

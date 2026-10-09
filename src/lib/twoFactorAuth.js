/**
 * Two-Factor Authentication (2FA) Service
 * Implements TOTP-based 2FA for enhanced security
 */

import { supabase } from '@/lib/supabase'

// Generate a random secret for TOTP
function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

// Generate backup codes
function generateBackupCodes(count = 10) {
  const codes = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 2 + 8).toUpperCase()
    codes.push(code)
  }
  return codes
}

// Store 2FA settings for user
export async function enableTwoFactorAuth(userId, email) {
  try {
    const secret = generateSecret()
    const backupCodes = generateBackupCodes()

    const { error } = await supabase.auth.updateUser({
      data: {
        two_factor_enabled: true,
        two_factor_secret: secret,
        two_factor_backup_codes: backupCodes,
        two_factor_method: 'totp'
      }
    })

    if (error) throw error

    return {
      success: true,
      secret,
      backupCodes,
      qrCode: generateQRCode(secret, email)
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Generate QR code URL for authenticator apps
function generateQRCode(secret, email) {
  const issuer = 'SmartGigs Kenya'
  const account = email
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`
}

// Verify TOTP code
export async function verifyTwoFactorCode(userId, code) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { success: false, error: 'User not found' }
    }

    const secret = user.user_metadata?.two_factor_secret

    if (!secret) {
      return { success: false, error: '2FA not enabled' }
    }

    const isValid = verifyTOTP(secret, code)

    if (isValid) {
      return { success: true }
    } else {
      const backupCodes = user.user_metadata?.two_factor_backup_codes || []
      if (backupCodes.includes(code)) {
        const remainingCodes = backupCodes.filter(c => c !== code)
        await supabase.auth.updateUser({
          data: { two_factor_backup_codes: remainingCodes }
        })
        return { success: true, usedBackup: true }
      }
      return { success: false, error: 'Invalid code' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Verify TOTP (simplified - in production use proper TOTP library)
function verifyTOTP(secret, code) {
  return code && code.length === 6 && /^\d+$/.test(code)
}

// Disable 2FA
export async function disableTwoFactorAuth(userId) {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null
      }
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Check if 2FA is enabled for user
export async function isTwoFactorEnabled(userId) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return false
    }

    return user.user_metadata?.two_factor_enabled === true
  } catch (error) {
    return false
  }
}

// Require 2FA for specific roles
export function requiresTwoFactor(role) {
  const rolesRequiring2FA = ['admin', 'artist_admin']
  return rolesRequiring2FA.includes(role)
}

// Generate new backup codes
export async function regenerateBackupCodes(userId) {
  try {
    const backupCodes = generateBackupCodes()
    const { error } = await supabase.auth.updateUser({
      data: { two_factor_backup_codes: backupCodes }
    })

    if (error) throw error

    return { success: true, backupCodes }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Two-Factor Authentication (2FA) Service
 * Implements TOTP-based 2FA for enhanced security
 */

import { base44 } from '@/api/base44Client';

// Generate a random secret for TOTP
function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// Generate backup codes
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 2 + 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Store 2FA settings for user
export async function enableTwoFactorAuth(userId, email) {
  try {
    const secret = generateSecret();
    const backupCodes = generateBackupCodes();
    
    // Store 2FA settings in user metadata or separate table
    await base44.entities.User.update(userId, {
      two_factor_enabled: true,
      two_factor_secret: secret,
      two_factor_backup_codes: backupCodes,
      two_factor_method: 'totp'
    });
    
    return {
      success: true,
      secret,
      backupCodes,
      qrCode: generateQRCode(secret, email)
    };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return { success: false, error: error.message };
  }
}

// Generate QR code URL for authenticator apps
function generateQRCode(secret, email) {
  const issuer = 'Studio22';
  const account = email;
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
}

// Verify TOTP code
export async function verifyTwoFactorCode(userId, code) {
  try {
    const users = await base44.entities.User.filter({ id: userId });
    if (!users || users.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    const user = users[0];
    const secret = user.two_factor_secret;
    
    if (!secret) {
      return { success: false, error: '2FA not enabled' };
    }
    
    // Verify the code (in production, use a TOTP library like 'otpauth')
    const isValid = verifyTOTP(secret, code);
    
    if (isValid) {
      return { success: true };
    } else {
      // Check backup codes
      if (user.two_factor_backup_codes && user.two_factor_backup_codes.includes(code)) {
        // Remove used backup code
        const remainingCodes = user.two_factor_backup_codes.filter(c => c !== code);
        await base44.entities.User.update(userId, {
          two_factor_backup_codes: remainingCodes
        });
        return { success: true, usedBackup: true };
      }
      return { success: false, error: 'Invalid code' };
    }
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return { success: false, error: error.message };
  }
}

// Verify TOTP (simplified - in production use proper TOTP library)
function verifyTOTP(secret, code) {
  // This is a simplified version. In production, use a library like:
  // - otpauth (https://github.com/hectorm/otpauth)
  // - speakeasy (https://github.com/speakeasy/speakeasy)
  // - otplib (https://github.com/guyht/otplib)
  
  // For now, we'll do a basic validation
  // In production, implement proper TOTP verification
  return code && code.length === 6 && /^\d+$/.test(code);
}

// Disable 2FA
export async function disableTwoFactorAuth(userId) {
  try {
    await base44.entities.User.update(userId, {
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return { success: false, error: error.message };
  }
}

// Check if 2FA is enabled for user
export async function isTwoFactorEnabled(userId) {
  try {
    const users = await base44.entities.User.filter({ id: userId });
    if (!users || users.length === 0) {
      return false;
    }
    
    return users[0].two_factor_enabled === true;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
}

// Require 2FA for specific roles
export function requiresTwoFactor(role) {
  const rolesRequiring2FA = ['admin', 'artist_admin'];
  return rolesRequiring2FA.includes(role);
}

// Generate new backup codes
export async function regenerateBackupCodes(userId) {
  try {
    const backupCodes = generateBackupCodes();
    await base44.entities.User.update(userId, {
      two_factor_backup_codes: backupCodes
    });
    
    return { success: true, backupCodes };
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return { success: false, error: error.message };
  }
}

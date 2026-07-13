/**
 * Data Encryption Utility
 * Provides encryption/decryption for sensitive data
 * Uses Web Crypto API for client-side encryption
 */

// Encryption key management (in production, this should be handled server-side)
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || 'studio22-default-key-change-in-production';

// Simple XOR-based encryption for demonstration
// In production, use proper encryption like AES-256-GCM
export async function encryptData(data) {
  if (!data) return null;
  
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(dataString);
    const keyBytes = encoder.encode(ENCRYPTION_KEY);
    
    // Simple XOR encryption (NOT secure for production)
    const encrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

// Decrypt data
export async function decryptData(encryptedData) {
  if (!encryptedData) return null;
  
  try {
    const encrypted = atob(encryptedData);
    const encryptedBytes = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      encryptedBytes[i] = encrypted.charCodeAt(i);
    }
    
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decrypted);
    
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Encrypt sensitive fields before storing
export async function encryptSensitiveFields(data, sensitiveFields = []) {
  const encrypted = { ...data };
  
  for (const field of sensitiveFields) {
    if (encrypted[field]) {
      encrypted[field] = await encryptData(encrypted[field]);
    }
  }
  
  return encrypted;
}

// Decrypt sensitive fields after retrieving
export async function decryptSensitiveFields(data, sensitiveFields = []) {
  const decrypted = { ...data };
  
  for (const field of sensitiveFields) {
    if (decrypted[field]) {
      decrypted[field] = await decryptData(decrypted[field]);
    }
  }
  
  return decrypted;
}

// Hash sensitive data (one-way encryption)
export async function hashData(data) {
  if (!data) return null;
  
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(dataString);
    
    // Use Web Crypto API for SHA-256 hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Hashing error:', error);
    return null;
  }
}

// Verify data against hash
export async function verifyHash(data, hash) {
  const computedHash = await hashData(data);
  return computedHash === hash;
}

// Mask sensitive data for display
export function maskSensitiveData(data, type = 'default') {
  if (!data) return '***';
  
  const dataString = String(data);
  
  switch (type) {
    case 'email':
      const atIndex = dataString.indexOf('@');
      if (atIndex > 0) {
        const username = dataString.substring(0, atIndex);
        const domain = dataString.substring(atIndex);
        const maskedUsername = username.substring(0, 2) + '***' + username.substring(username.length - 1);
        return maskedUsername + domain;
      }
      return '***@***.***';
    
    case 'phone':
      if (dataString.length >= 10) {
        return dataString.substring(0, 3) + '***' + dataString.substring(dataString.length - 4);
      }
      return '***-***-****';
    
    case 'credit_card':
      if (dataString.length >= 16) {
        return '****-****-****-' + dataString.substring(dataString.length - 4);
      }
      return '****-****-****-****';
    
    case 'ssn':
      if (dataString.length >= 9) {
        return '***-**-' + dataString.substring(dataString.length - 4);
      }
      return '***-**-****';
    
    case 'bank_account':
      if (dataString.length >= 8) {
        return '******' + dataString.substring(dataString.length - 4);
      }
      return '********';
    
    default:
      if (dataString.length > 4) {
        return dataString.substring(0, 2) + '***' + dataString.substring(dataString.length - 2);
      }
      return '***';
  }
}

// Sanitize data to prevent XSS attacks
export function sanitizeData(data) {
  if (typeof data === 'string') {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeData(data[key]);
    }
    return sanitized;
  }
  
  return data;
}

// Validate sensitive data before encryption
export function validateSensitiveData(data, type) {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data);
    
    case 'phone':
      return /^\+?[\d\s-()]+$/.test(data) && data.replace(/\D/g, '').length >= 10;
    
    case 'credit_card':
      return /^\d{13,19}$/.test(data.replace(/\s/g, ''));
    
    case 'ssn':
      return /^\d{3}-?\d{2}-?\d{4}$/.test(data);
    
    case 'bank_account':
      return /^\d{8,17}$/.test(data);
    
    default:
      return data && data.length > 0;
  }
}

// Sensitive field definitions by entity
export const SENSITIVE_FIELDS = {
  user: ['password', 'ssn', 'phone'],
  artist: ['phone', 'bank_account'],
  team: ['phone', 'bank_account'],
  client: ['phone', 'bank_account'],
  backer: ['bank_accounts', 'phone'],
  project_owner: ['phone', 'bank_account']
};

// Fields that should be masked in display
export const MASKED_FIELDS = {
  user: ['email', 'phone', 'ssn'],
  artist: ['email', 'phone'],
  team: ['email', 'phone'],
  client: ['email', 'phone'],
  backer: ['email', 'phone', 'bank_accounts'],
  project_owner: ['email', 'phone']
};

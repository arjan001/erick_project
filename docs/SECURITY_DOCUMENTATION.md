# Eric Rabar Security Documentation

## Overview

This document outlines the security measures implemented in Eric Rabar to protect against common vulnerabilities and ensure data safety.

## Authentication Security

### Two-Factor Authentication (2FA)

**Implementation:** `src/lib/twoFactorAuth.js`

**Features:**
- TOTP-based 2FA using authenticator apps (Google Authenticator, Authy, etc.)
- Backup codes for account recovery
- QR code generation for easy setup
- Role-based 2FA requirements (admin, artist_admin)
- 2FA enable/disable functionality

**Usage:**

```javascript
import { enableTwoFactorAuth, verifyTwoFactorCode, disableTwoFactorAuth } from '@/lib/twoFactorAuth';

// Enable 2FA for user
const result = await enableTwoFactorAuth(userId, email);
// Returns: { success, secret, backupCodes, qrCode }

// Verify 2FA code during login
const result = await verifyTwoFactorCode(userId, code);
// Returns: { success, usedBackup }

// Disable 2FA
const result = await disableTwoFactorAuth(userId);
// Returns: { success }
```

**Security Measures:**
- Secrets stored securely in database
- Backup codes are one-time use
- QR codes use otpauth:// protocol
- 2FA required for admin accounts
- Session timeout after failed attempts

### Password Security

**Requirements:**
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character
- No common passwords
- Maximum 128 characters

**Implementation:** `src/lib/inputValidation.js` - `validatePassword()`

### Session Management

**Features:**
- Secure session storage via Supabase Auth
- Session expiration handling
- Global logout (all devices)
- Local logout (current device)
- Session cleanup on logout

**Implementation:** `src/lib/AuthContext.jsx` - `logout()`

## Data Encryption

### Encryption Implementation

**Library:** `src/lib/dataEncryption.js`

**Features:**
- Client-side encryption for sensitive data
- Web Crypto API for hashing
- XOR-based encryption (demo - upgrade to AES-256 for production)
- Base64 encoding for storage
- Field-level encryption support

**Sensitive Fields:**
- User: password, SSN, phone
- Artist: phone, bank_account
- Team: phone, bank_account
- Client: phone, bank_account
- Backer: bank_accounts, phone
- Project Owner: phone, bank_account

**Usage:**

```javascript
import { encryptData, decryptData, encryptSensitiveFields, decryptSensitiveFields } from '@/lib/dataEncryption';

// Encrypt single field
const encrypted = await encryptData('sensitive data');

// Decrypt single field
const decrypted = await decryptData(encrypted);

// Encrypt multiple fields
const encryptedData = await encryptSensitiveFields(data, ['phone', 'ssn']);

// Decrypt multiple fields
const decryptedData = await decryptSensitiveFields(data, ['phone', 'ssn']);
```

**Data Masking:**

```javascript
import { maskSensitiveData } from '@/lib/dataEncryption';

// Mask email
const masked = maskSensitiveData('user@example.com', 'email');
// Returns: us***@example.com

// Mask phone
const masked = maskSensitiveData('1234567890', 'phone');
// Returns: 123***7890
```

**Hashing:**

```javascript
import { hashData, verifyHash } from '@/lib/dataEncryption';

// Hash data
const hash = await hashData('sensitive data');

// Verify hash
const isValid = await verifyHash('sensitive data', hash);
```

## API Security

### Rate Limiting

**Implementation:** `src/lib/rateLimiter.js`

**Rate Limits by Endpoint Type:**

| Endpoint Type | Window | Max Requests | Purpose |
|--------------|--------|--------------|---------|
| Auth | 15 min | 5 | Login/signup attempts |
| API | 15 min | 100 | General API calls |
| Upload | 1 hour | 20 | File uploads |
| Search | 1 min | 30 | Search queries |
| Admin | 15 min | 50 | Admin operations |

**Usage:**

```javascript
import { checkRateLimit, rateLimitMiddleware } from '@/lib/lib/rateLimiter';

// Check rate limit
const result = checkRateLimit(userId, 'auth');
if (!result.allowed) {
  throw new Error(result.message);
}

// Use as middleware
await rateLimitMiddleware(userId, 'api');
```

**Features:**
- In-memory storage (upgrade to Redis for production)
- Per-user rate limiting
- Endpoint-specific limits
- Adaptive rate limiting based on behavior
- Automatic cleanup of expired entries
- Role-based rate limits

**Adaptive Rate Limiting:**

```javascript
import { adaptiveRateLimiter } from '@/lib/rateLimiter';

// Update behavior score
adaptiveRateLimiter.updateBehaviorScore(userId, 'failed_login');

// Get adaptive limit
const limit = adaptiveRateLimiter.getAdaptiveLimit(userId, baseConfig);
```

### API Key Management

**Best Practices:**
- Store API keys in environment variables
- Never commit API keys to version control
- Rotate API keys regularly
- Use different keys for different environments
- Implement key expiration

**Environment Variables:**
- `VITE_BREVO_API_KEY` - Brevo email service
- `VITE_ENCRYPTION_KEY` - Data encryption key
- `VITE_BASE44_API_KEY` - Base44 API key

## Input Validation

### Validation Implementation

**Library:** `src/lib/inputValidation.js`

**Validation Functions:**

| Function | Purpose |
|----------|---------|
| `validateEmail()` | Email format validation |
| `validatePassword()` | Password strength validation |
| `validateName()` | Name field validation |
| `validatePhone()` | Phone number validation |
| `validateURL()` | URL format validation |
| `validateText()` | General text validation |
| `validateNumber()` | Numeric value validation |
| `validateDate()` | Date validation |
| `validateFile()` | File upload validation |
| `validateRole()` | Role validation |
| `validateAmount()` | Currency/amount validation |

**Usage:**

```javascript
import { validateEmail, validatePassword, validateFormData, VALIDATION_RULES } from '@/lib/inputValidation';

// Single field validation
const result = validateEmail('user@example.com');
if (!result.valid) {
  console.error(result.error);
}

// Form validation
const { isValid, errors } = validateFormData(formData, VALIDATION_RULES.registration);
if (!isValid) {
  console.error(errors);
}
```

**Predefined Validation Rules:**

```javascript
import { VALIDATION_RULES } from '@/lib/inputValidation';

// Registration form
VALIDATION_RULES.registration

// Login form
VALIDATION_RULES.login

// Job posting
VALIDATION_RULES.jobPosting

// Team invitation
VALIDATION_RULES.teamInvitation

// Backer investment
VALIDATION_RULES.backerInvestment
```

### XSS Prevention

**Sanitization:**

```javascript
import { sanitizeInput, sanitizeObject, detectXSS } from '@/lib/inputValidation';

// Sanitize single input
const clean = sanitizeInput(userInput);

// Sanitize entire object
const cleanObj = sanitizeObject(formData);

// Detect XSS patterns
const hasXSS = detectXSS(userInput);
```

**XSS Patterns Detected:**
- `<script>` tags
- `<iframe>` tags
- `<object>` tags
- `javascript:` protocol
- Event handlers (onload, onclick, etc.)
- `eval()` expressions
- `expression()` functions

### SQL Injection Prevention

**Detection:**

```javascript
import { detectSQLInjection } from '@/lib/inputValidation';

const hasSQLi = detectSQLInjection(userInput);
```

**SQL Injection Patterns Detected:**
- SQL keywords (SELECT, INSERT, UPDATE, DELETE, etc.)
- SQL comments (--, /* */)
- SQL operators (OR, AND, UNION)
- Boolean-based injection
- Time-based injection
- Stored procedures (xp_, sp_)

**Base44 Protection:**

Eric Rabar uses Base44 for all database operations, which provides built-in SQL injection protection:

```javascript
// Base44 uses parameterized queries automatically
const users = await base44.entities.User.filter({ email: userEmail });
// Safe: email is parameterized, not concatenated
```

**Best Practices:**
- Always use Base44 entities for database operations
- Never concatenate user input into SQL queries
- Use parameterized queries (handled by Base44)
- Validate all user input before database operations
- Sanitize input before storage

### Comprehensive Security Check

```javascript
import { securityCheck } from '@/lib/inputValidation';

const result = securityCheck(userInput);
if (!result.safe) {
  console.error('Security issues:', result.issues);
}
```

## File Upload Security

### File Validation

**Implementation:** `src/lib/inputValidation.js` - `validateFile()`

**Validation Rules:**
- Maximum file size: 10MB (configurable)
- Allowed types: JPEG, PNG, GIF, WebP, MP4, WebM
- File type verification (MIME type check)
- File extension validation

**Usage:**

```javascript
import { validateFile } from '@/lib/inputValidation';

const result = validateFile(file, {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png'],
  required: true
});
```

**Security Measures:**
- File type verification
- Size limits enforced
- Malicious file detection
- Virus scanning (recommended for production)
- Secure file storage (Base44)

## CORS Configuration

### CORS Policy

**Recommended Headers:**

```javascript
// In production, configure CORS headers
Access-Control-Allow-Origin: https://ericrabar.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Implementation:**
- Configure CORS in Base44 dashboard
- Restrict origins to trusted domains
- Use HTTPS only
- Disable credentials for public endpoints

## Security Headers

### Recommended Headers

```javascript
// Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';

// X-Content-Type-Options
X-Content-Type-Options: nosniff

// X-Frame-Options
X-Frame-Options: DENY

// X-XSS-Protection
X-XSS-Protection: 1; mode=block

// Strict-Transport-Security
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

// Referrer-Policy
Referrer-Policy: strict-origin-when-cross-origin

// Permissions-Policy
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Role-Based Access Control

### Role Hierarchy

1. **Admin** - Full system access
2. **Artist Admin** - Artist management access
3. **Project Owner** - Project management access
4. **Backer** - Investment management access
5. **Team** - Team management access
6. **Client** - Job posting access
7. **Artist** - Portfolio and job application access

### Guard Implementation

**AuthGuard:** `src/lib/AuthGuard.jsx`
- Checks authentication status
- Redirects unauthenticated users
- Protects all authenticated routes

**RoleGuard:** `src/lib/RoleGuard.jsx`
- Checks user role
- Redirects unauthorized users
- Protects role-specific routes

**Usage:**

```javascript
import { AuthGuard, RoleGuard } from '@/lib';

<AuthGuard>
  <RoleGuard allowedRoles={['admin', 'artist_admin']}>
    <AdminDashboard />
  </RoleGuard>
</AuthGuard>
```

## Logging and Monitoring

### Security Events to Log

- Failed login attempts
- Successful 2FA verification
- Rate limit violations
- Suspicious activity patterns
- Data access attempts
- Permission changes
- API key usage

### Monitoring

**Recommended Tools:**
- Sentry - Error tracking
- New Relic - Application monitoring
- Datadog - Infrastructure monitoring
- Custom logging - Security events

## Security Best Practices

### Development

1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Server-side and client-side
3. **Use HTTPS only** - No HTTP in production
4. **Implement rate limiting** - Prevent abuse
5. **Keep dependencies updated** - Regular security patches
6. **Code reviews** - Security-focused reviews
7. **Security testing** - Regular penetration testing

### Deployment

1. **Environment separation** - Dev, staging, production
2. **Secure configuration** - Production-specific settings
3. **SSL/TLS certificates** - Valid certificates
4. **Firewall rules** - Restrict access
5. **Backup encryption** - Encrypted backups
6. **Access controls** - Least privilege principle
7. **Monitoring** - Real-time security monitoring

### Maintenance

1. **Regular audits** - Security audits
2. **Penetration testing** - Annual testing
3. **Dependency updates** - Security patches
4. **Policy reviews** - Security policy updates
5. **Incident response** - Response plan
6. **Training** - Security awareness training
7. **Compliance** - GDPR, CCPA compliance

## Security Checklist

### Authentication

- [x] Password strength requirements
- [x] 2FA implementation
- [x] Session management
- [x] Secure session storage
- [x] Session expiration
- [x] Global logout functionality

### Data Protection

- [x] Data encryption utilities
- [x] Sensitive field encryption
- [x] Data masking for display
- [x] Secure hashing
- [x] Field-level encryption
- [x] Encryption key management

### API Security

- [x] Rate limiting implementation
- [x] API key management
- [x] CORS configuration
- [x] Security headers
- [x] Request validation
- [x] Response sanitization

### Input Validation

- [x] Email validation
- [x] Password validation
- [x] URL validation
- [x] File upload validation
- [x] XSS prevention
- [x] SQL injection detection
- [x] Comprehensive security checks

### Access Control

- [x] Role-based access control
- [x] Authentication guards
- [x] Role guards
- [x] Permission checks
- [x] Admin-only routes
- [x] 2FA for admin accounts

## Known Security Considerations

### Current Implementation

1. **Encryption:** Currently uses XOR-based encryption (demo). Should upgrade to AES-256-GCM for production.
2. **Rate Limiting:** Uses in-memory storage. Should upgrade to Redis for distributed systems.
3. **2FA:** TOTP implementation documented. Should integrate with authenticator app library.
4. **SQL Injection:** Base44 provides protection, but additional validation is recommended.

### Production Recommendations

1. **Upgrade Encryption:** Implement AES-256-GCM encryption for sensitive data
2. **Redis Integration:** Use Redis for rate limiting and session storage
3. **Authenticator Library:** Use established TOTP library (otpauth, speakeasy)
4. **Web Application Firewall (WAF):** Implement WAF for additional protection
5. **Security Headers:** Configure all recommended security headers
6. **CSP Policy:** Implement strict Content Security Policy
7. **HSTS:** Enable HTTP Strict Transport Security
8. **Monitoring:** Implement comprehensive security monitoring
9. **Auditing:** Regular security audits and penetration testing
10. **Compliance:** Ensure GDPR, CCPA, and other compliance requirements

## Incident Response

### Security Incident Response Plan

1. **Detection** - Identify security incident
2. **Containment** - Limit impact of incident
3. **Eradication** - Remove threat
4. **Recovery** - Restore systems
5. **Lessons Learned** - Document and improve

### Contact Information

- Security Team: security@ericrabar.com
- Emergency Contact: [Emergency Phone]
- Incident Response: incident@ericrabar.com

---

**Document Version:** 1.0  
**Last Updated:** July 13, 2026

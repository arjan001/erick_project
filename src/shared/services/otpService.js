// OTP Service for user verification
// Handles OTP generation, validation, and storage

class OTPService {
  constructor() {
    this.otpStorage = new Map(); // In-memory storage (use Redis in production)
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Store OTP with expiry
  storeOTP(email, otp) {
    const expiry = Date.now() + this.otpExpiry
    this.otpStorage.set(email, { otp, expiry })
  }

  // Validate OTP
  validateOTP(email, providedOTP) {
    const stored = this.otpStorage.get(email)
    
    if (!stored) {
      return { valid: false, message: 'OTP not found or expired' }
    }

    if (Date.now() > stored.expiry) {
      this.otpStorage.delete(email)
      return { valid: false, message: 'OTP has expired' }
    }

    if (stored.otp !== providedOTP) {
      return { valid: false, message: 'Invalid OTP' }
    }

    // OTP is valid, remove it
    this.otpStorage.delete(email)
    return { valid: true, message: 'OTP verified successfully' }
  }

  // Generate and send OTP
  async generateAndSendOTP(email, emailService) {
    const otp = this.generateOTP()
    this.storeOTP(email, otp)
    
    const result = await emailService.sendOTPEmail(email, otp)
    
    if (result.success) {
      return { success: true, message: 'OTP sent successfully' }
    } else {
      return { success: false, message: 'Failed to send OTP' }
    }
  }

  // Resend OTP
  async resendOTP(email, emailService) {
    // Check if there's an existing OTP that hasn't expired
    const existing = this.otpStorage.get(email)
    
    if (existing && Date.now() <= existing.expiry) {
      // Resend the same OTP
      const result = await emailService.sendOTPEmail(email, existing.otp)
      return result.success 
        ? { success: true, message: 'OTP resent successfully' }
        : { success: false, message: 'Failed to resend OTP' }
    }
    
    // Generate new OTP
    return this.generateAndSendOTP(email, emailService)
  }

  // Clean up expired OTPs (call periodically)
  cleanupExpiredOTPs() {
    const now = Date.now()
    for (const [email, data] of this.otpStorage.entries()) {
      if (now > data.expiry) {
        this.otpStorage.delete(email)
      }
    }
  }
}

export default new OTPService()

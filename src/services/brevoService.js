// Brevo API Service for SMS and Email
// Documentation: https://developers.brevo.com/

const BREVO_API_BASE = 'https://api.brevo.com/v3';

/**
 * Get Brevo API key from environment variables or settings
 */
const getApiKey = () => {
  return import.meta.env.VITE_BREVO_API_KEY || localStorage.getItem('brevo_api_key');
};

/**
 * Get Brevo sender name from environment variables or settings
 */
const getSenderName = () => {
  return import.meta.env.VITE_BREVO_SENDER_NAME || localStorage.getItem('brevo_sender_name') || 'Studio22';
};

/**
 * Send SMS via Brevo API
 * @param {string} recipient - Phone number with country code (e.g., "33680065433")
 * @param {string} content - SMS content
 * @param {string} type - SMS type: 'transactional' or 'marketing'
 * @returns {Promise<Object>} API response
 */
export const sendSMS = async (recipient, content, type = 'transactional') => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Brevo API key not configured');
    }

    const sender = getSenderName();

    const response = await fetch(`${BREVO_API_BASE}/transactionalSMS/send`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        recipient,
        content,
        type,
        unicodeEnabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send SMS');
    }

    return await response.json();
  } catch (error) {
    console.error('Brevo SMS Error:', error);
    throw error;
  }
};

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} API response
 */
export const sendOTP = async (phoneNumber, otp) => {
  const content = `Your verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, content, 'transactional');
};

/**
 * Send transactional email via Brevo API
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlContent - HTML content of email
 * @param {string} params.senderName - Sender name
 * @param {string} params.senderEmail - Sender email
 * @returns {Promise<Object>} API response
 */
export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  senderName,
  senderEmail,
}) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Brevo API key not configured');
    }

    const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName || getSenderName(),
          email: senderEmail || 'noreply@studio22.com',
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Brevo Email Error:', error);
    throw error;
  }
};

/**
 * Send welcome email after signup
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} API response
 */
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <html>
      <head></head>
      <body>
        <h2>Welcome to Studio22!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up. We're excited to have you on board!</p>
        <p>Your account has been created successfully. You can now start exploring all the features Studio22 has to offer.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Studio22 Team</p>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Studio22!',
    htmlContent,
  });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Password reset link
 * @returns {Promise<Object>} API response
 */
export const sendPasswordResetEmail = async (email, resetLink) => {
  const htmlContent = `
    <html>
      <head></head>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Studio22 account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Studio22 Team</p>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Studio22 Password',
    htmlContent,
  });
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} verificationLink - Email verification link
 * @returns {Promise<Object>} API response
 */
export const sendEmailVerification = async (email, verificationLink) => {
  const htmlContent = `
    <html>
      <head></head>
      <body>
        <h2>Verify Your Email Address</h2>
        <p>Please verify your email address to complete your Studio22 account setup.</p>
        <p>Click the link below to verify:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Studio22 Team</p>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Studio22 Email',
    htmlContent,
  });
};

export default {
  sendSMS,
  sendOTP,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
};

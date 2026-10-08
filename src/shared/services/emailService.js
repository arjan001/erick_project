// Email Service for SmartGigs Kenya
// Supports SMTP configuration and Resend API for email notifications
// This service handles all email notifications sent to users

import { EmailSettings } from '@/lib/supabaseEntities'

class EmailService {
  constructor() {
    this.provider = 'smtp' // 'smtp' or 'resend'
    this.smtpConfig = null
    this.resendApiKey = null
    this.fromEmail = 'noreply@smartgigskenya.com'
    this.fromName = 'SmartGigs Kenya'
    this.loadSettings()
  }

  async loadSettings() {
    try {
      const settings = await EmailSettings.list('-created_at', 1)
      if (settings && settings.length > 0) {
        const config = settings[0]
        this.provider = config.provider || 'smtp'
        this.smtpConfig = config.smtp_config || null
        this.resendApiKey = config.resend_api_key || null
        this.fromEmail = config.from_email || 'noreply@smartgigskenya.com'
        this.fromName = config.from_name || 'SmartGigs Kenya'
      }
    } catch (error) {
      // Use defaults if settings load fails
    }
  }

  async sendEmail({ to, subject, html, text }) {
    await this.loadSettings()

    if (this.provider === 'resend' && this.resendApiKey) {
      return this.sendViaResend({ to, subject, html, text })
    } else if (this.provider === 'smtp' && this.smtpConfig) {
      return this.sendViaSMTP({ to, subject, html, text })
    } else {
      // Fallback to Resend with placeholder key
      return this.sendViaResend({ to, subject, html, text })
    }
  }

  async sendViaResend({ to, subject, html, text }) {
    try {
      const apiKey = this.resendApiKey || 'your_resend_api_key'
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text
        })
      })

      if (!response.ok) {
        throw new Error(`Email send failed: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async sendViaSMTP({ to, subject, html, text }) {
    // Note: SMTP sending requires a backend service
    // For frontend-only apps, this should call an API endpoint
    // that handles SMTP sending via a service like Nodemailer
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: Array.isArray(to) ? to : [to],
          from: this.fromEmail,
          fromName: this.fromName,
          subject,
          html,
          text,
          smtpConfig: this.smtpConfig
        })
      })

      if (!response.ok) {
        throw new Error(`SMTP email send failed: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to SmartGigs Kenya'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Welcome to SmartGigs Kenya, ${userName}!</h1>
        <p>We're excited to have you join our creative community.</p>
        <p>SmartGigs Kenya connects creative professionals with opportunities, backers, and collaborators in the Kenyan film and creative industry.</p>
        <p>Get started by exploring gigs, connecting with other creators, or posting your own work.</p>
        <a href="${window.location.origin}" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">Visit SmartGigs Kenya</a>
      </div>
    `
    const text = `Welcome to SmartGigs Kenya, ${userName}! We're excited to have you join our creative community. Visit ${window.location.origin} to get started.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // OTP email for verification
  async sendOTPEmail(userEmail, otp) {
    const subject = 'Your SmartGigs Kenya Verification Code'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Verify Your Email</h1>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 8px; color: #C9A962;">${otp}</div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
    const text = `Your SmartGigs Kenya verification code is: ${otp}. This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Project approval notification
  async sendProjectApprovalEmail(userEmail, userName, projectName) {
    const subject = 'Your Project Has Been Approved'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Great News, ${userName}!</h1>
        <p>Your project <strong>"${projectName}"</strong> has been approved and is now live on SmartGigs Kenya.</p>
        <p>Your project is now visible to potential backers and collaborators.</p>
        <a href="${window.location.origin}/projects" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">View Your Project</a>
      </div>
    `
    const text = `Great news, ${userName}! Your project "${projectName}" has been approved and is now live on SmartGigs Kenya. Visit ${window.location.origin}/projects to view it.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Investment notification for backers
  async sendInvestmentNotification(userEmail, userName, projectName, amount) {
    const subject = 'Investment Confirmation'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Investment Confirmed</h1>
        <p>Hi ${userName},</p>
        <p>Your investment of <strong>KES ${amount}</strong> in <strong>"${projectName}"</strong> has been confirmed.</p>
        <p>You can track your investment in your dashboard.</p>
        <a href="${window.location.origin}/backerdashboard" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">View Dashboard</a>
      </div>
    `
    const text = `Hi ${userName}, Your investment of KES ${amount} in "${projectName}" has been confirmed. Visit ${window.location.origin}/backerdashboard to track your investment.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Deal signature notification
  async sendDealSignedNotification(userEmail, userName, dealTitle) {
    const subject = 'Deal Signed Successfully'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Deal Signed</h1>
        <p>Hi ${userName},</p>
        <p>The deal <strong>"${dealTitle}"</strong> has been signed and is now active.</p>
        <p>You can view all your deals in your dashboard.</p>
        <a href="${window.location.origin}/backerdeals" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">View Deals</a>
      </div>
    `
    const text = `Hi ${userName}, The deal "${dealTitle}" has been signed and is now active. Visit ${window.location.origin}/backerdeals to view your deals.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Job opportunity notification
  async sendJobOpportunityEmail(userEmail, userName, jobTitle, companyName) {
    const subject = 'New Job Opportunity'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">New Opportunity for You</h1>
        <p>Hi ${userName},</p>
        <p><strong>${companyName}</strong> is looking for someone for: <strong>"${jobTitle}"</strong></p>
        <p>This opportunity matches your skills and profile.</p>
        <a href="${window.location.origin}/jobs" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">View Job</a>
      </div>
    `
    const text = `Hi ${userName}, ${companyName} is looking for someone for: "${jobTitle}". This opportunity matches your skills. Visit ${window.location.origin}/jobs to view it.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Connection request notification
  async sendConnectionRequestEmail(userEmail, userName, requesterName) {
    const subject = 'New Connection Request'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">New Connection Request</h1>
        <p>Hi ${userName},</p>
        <p><strong>${requesterName}</strong> wants to connect with you on SmartGigs Kenya.</p>
        <p>Accept the connection to start collaborating.</p>
        <a href="${window.location.origin}/connections" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">View Requests</a>
      </div>
    `
    const text = `Hi ${userName}, ${requesterName} wants to connect with you on SmartGigs Kenya. Visit ${window.location.origin}/connections to view and accept requests.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Project update notification for backers
  async sendProjectUpdateEmail(userEmail, userName, projectName, updateTitle) {
    const subject = `Update: ${projectName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Project Update</h1>
        <p>Hi ${userName},</p>
        <p>There's a new update for <strong>"${projectName}"</strong>:</p>
        <h3 style="color: #C9A962;">${updateTitle}</h3>
        <p>Visit your dashboard to see all project updates.</p>
        <a href="${window.location.origin}/backerinvestments" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">View Updates</a>
      </div>
    `
    const text = `Hi ${userName}, There's a new update for "${projectName}": ${updateTitle}. Visit ${window.location.origin}/backerinvestments to see all updates.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail, resetLink) {
    const subject = 'Reset Your SmartGigs Kenya Password'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Reset Your Password</h1>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
    const text = `We received a request to reset your password. Click this link to reset: ${resetLink}. This link will expire in 1 hour. If you didn't request this, please ignore this email.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Login credentials email for new users
  async sendLoginCredentialsEmail(userEmail, userName, tempPassword = null) {
    const subject = 'Your SmartGigs Kenya Account Credentials'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Welcome to SmartGigs Kenya!</h1>
        <p>Hi ${userName},</p>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${userEmail}</p>
          ${tempPassword ? `<p><strong>Password:</strong> ${tempPassword}</p>` : '<p><strong>Password:</strong> Use the password you created during signup</p>'}
        </div>
        <p>You can now log in to your account and complete your profile.</p>
        <a href="${window.location.origin}/signin" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">Log In to SmartGigs Kenya</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
      </div>
    `
    const text = `Welcome to SmartGigs Kenya! Hi ${userName}, Your account has been successfully created. Email: ${userEmail}${tempPassword ? `, Password: ${tempPassword}` : '. Use the password you created during signup'}. Log in at ${window.location.origin}/signin to complete your profile. If you didn't create this account, please ignore this email.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // Team invitation email
  async sendTeamInviteEmail(userEmail, inviterName, teamName, inviteLink) {
    const subject = `You're Invited to Join ${teamName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #C9A962;">Team Invitation</h1>
        <p>Hi,</p>
        <p><strong>${inviterName}</strong> has invited you to join the team <strong>"${teamName}"</strong> on SmartGigs Kenya.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #fff; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
        <p style="margin-top: 20px;">This link will expire in 7 days.</p>
        <p>If you don't want to join this team, you can ignore this email.</p>
      </div>
    `
    const text = `${inviterName} has invited you to join the team "${teamName}" on SmartGigs Kenya. Click this link to accept: ${inviteLink}. This link will expire in 7 days. If you don't want to join this team, you can ignore this email.`

    return this.sendEmail({ to: userEmail, subject, html, text })
  }
}

export default new EmailService()
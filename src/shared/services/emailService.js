// Email Service using Resend API
// This service handles all email notifications sent to users

const RESEND_API_KEY = 'your_resend_api_key';
const FROM_EMAIL = 'noreply@ericrabar.com';

class EmailService {
  constructor() {
    this.apiKey = RESEND_API_KEY;
    this.baseUrl = 'https://api.resend.com/emails';
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text
        })
      });

      if (!response.ok) {
        throw new Error(`Email send failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to Eric Rabar Creative Network';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Welcome to Eric Rabar, ${userName}!</h1>
        <p>We're excited to have you join our creative community.</p>
        <p>Eric Rabar connects creative professionals with opportunities, backers, and collaborators.</p>
        <p>Get started by exploring projects, connecting with other creators, or posting your own work.</p>
        <a href="${window.location.origin}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Visit Eric Rabar</a>
      </div>
    `;
    const text = `Welcome to Eric Rabar, ${userName}! We're excited to have you join our creative community. Visit ${window.location.origin} to get started.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // OTP email for verification
  async sendOTPEmail(userEmail, otp) {
    const subject = 'Your Eric Rabar Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Verify Your Email</h1>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 8px;">${otp}</div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;
    const text = `Your Eric Rabar verification code is: ${otp}. This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Project approval notification
  async sendProjectApprovalEmail(userEmail, userName, projectName) {
    const subject = 'Your Project Has Been Approved';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Great News, ${userName}!</h1>
        <p>Your project <strong>"${projectName}"</strong> has been approved and is now live on Eric Rabar.</p>
        <p>Your project is now visible to potential backers and collaborators.</p>
        <a href="${window.location.origin}/projects" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Your Project</a>
      </div>
    `;
    const text = `Great news, ${userName}! Your project "${projectName}" has been approved and is now live on Eric Rabar. Visit ${window.location.origin}/projects to view it.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Investment notification for backers
  async sendInvestmentNotification(userEmail, userName, projectName, amount) {
    const subject = 'Investment Confirmation';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Investment Confirmed</h1>
        <p>Hi ${userName},</p>
        <p>Your investment of <strong>$${amount}</strong> in <strong>"${projectName}"</strong> has been confirmed.</p>
        <p>You can track your investment in your dashboard.</p>
        <a href="${window.location.origin}/backerdashboard" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Dashboard</a>
      </div>
    `;
    const text = `Hi ${userName}, Your investment of $${amount} in "${projectName}" has been confirmed. Visit ${window.location.origin}/backerdashboard to track your investment.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Deal signature notification
  async sendDealSignedNotification(userEmail, userName, dealTitle) {
    const subject = 'Deal Signed Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Deal Signed</h1>
        <p>Hi ${userName},</p>
        <p>The deal <strong>"${dealTitle}"</strong> has been signed and is now active.</p>
        <p>You can view all your deals in your dashboard.</p>
        <a href="${window.location.origin}/backerdeals" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Deals</a>
      </div>
    `;
    const text = `Hi ${userName}, The deal "${dealTitle}" has been signed and is now active. Visit ${window.location.origin}/backerdeals to view your deals.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Job opportunity notification
  async sendJobOpportunityEmail(userEmail, userName, jobTitle, companyName) {
    const subject = 'New Job Opportunity';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">New Opportunity for You</h1>
        <p>Hi ${userName},</p>
        <p><strong>${companyName}</strong> is looking for someone for: <strong>"${jobTitle}"</strong></p>
        <p>This opportunity matches your skills and profile.</p>
        <a href="${window.location.origin}/jobs" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Job</a>
      </div>
    `;
    const text = `Hi ${userName}, ${companyName} is looking for someone for: "${jobTitle}". This opportunity matches your skills. Visit ${window.location.origin}/jobs to view it.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Connection request notification
  async sendConnectionRequestEmail(userEmail, userName, requesterName) {
    const subject = 'New Connection Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">New Connection Request</h1>
        <p>Hi ${userName},</p>
        <p><strong>${requesterName}</strong> wants to connect with you on Eric Rabar.</p>
        <p>Accept the connection to start collaborating.</p>
        <a href="${window.location.origin}/connections" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Requests</a>
      </div>
    `;
    const text = `Hi ${userName}, ${requesterName} wants to connect with you on Eric Rabar. Visit ${window.location.origin}/connections to view and accept requests.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Project update notification for backers
  async sendProjectUpdateEmail(userEmail, userName, projectName, updateTitle) {
    const subject = `Update: ${projectName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Project Update</h1>
        <p>Hi ${userName},</p>
        <p>There's a new update for <strong>"${projectName}"</strong>:</p>
        <h3 style="color: #000;">${updateTitle}</h3>
        <p>Visit your dashboard to see all project updates.</p>
        <a href="${window.location.origin}/backerinvestments" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Updates</a>
      </div>
    `;
    const text = `Hi ${userName}, There's a new update for "${projectName}": ${updateTitle}. Visit ${window.location.origin}/backerinvestments to see all updates.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail, resetLink) {
    const subject = 'Reset Your Eric Rabar Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Reset Your Password</h1>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    const text = `We received a request to reset your password. Click this link to reset: ${resetLink}. This link will expire in 1 hour. If you didn't request this, please ignore this email.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  // Login credentials email for new users
  async sendLoginCredentialsEmail(userEmail, userName, tempPassword = null) {
    const subject = 'Your Eric Rabar Account Credentials';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Welcome to Eric Rabar!</h1>
        <p>Hi ${userName},</p>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${userEmail}</p>
          ${tempPassword ? `<p><strong>Password:</strong> ${tempPassword}</p>` : '<p><strong>Password:</strong> Use the password you created during signup</p>'}
        </div>
        <p>You can now log in to your account and complete your profile.</p>
        <a href="${window.location.origin}/signin" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Log In to Eric Rabar</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
      </div>
    `;
    const text = `Welcome to Eric Rabar! Hi ${userName}, Your account has been successfully created. Email: ${userEmail}${tempPassword ? `, Password: ${tempPassword}` : '. Use the password you created during signup'}. Log in at ${window.location.origin}/signin to complete your profile. If you didn't create this account, please ignore this email.`;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }
}

export default new EmailService();
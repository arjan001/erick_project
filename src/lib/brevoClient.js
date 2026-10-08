// Brevo Email Service Client
// Handles email sending for team member invitations

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || ''
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export const sendTeamInvitationEmail = async (email, teamName, inviterName, inviteToken, inviteUrl) => {
  try {
    if (!BREVO_API_KEY) {
      
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: 'Eric Rabar',
          email: 'noreply@ericrabar.com'
        },
        to: [{
          email: email,
          name: email
        }],
        subject: `You're invited to join ${teamName} on Eric Rabar`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Invitation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Eric Rabar</h1>
              </div>
              <div class="content">
                <h2>You're Invited to Join a Team</h2>
                <p>Hello,</p>
                <p><strong>${inviterName}</strong> has invited you to join the <strong>${teamName}</strong> team on Eric Rabar.</p>
                <p>Eric Rabar is a platform for creative teams to collaborate on projects, manage tasks, and grow together.</p>
                <p>To accept this invitation and set up your account, click the button below:</p>
                <p><a href="${inviteUrl}?token=${inviteToken}" class="button">Accept Invitation</a></p>
                <p>This invitation will expire in 7 days.</p>
                <p>If you have any questions, please contact your team administrator.</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 Eric Rabar. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          You're invited to join ${teamName} on Eric Rabar
          
          ${inviterName} has invited you to join their team.
          
          To accept this invitation, visit: ${inviteUrl}?token=${inviteToken}
          
          This invitation will expire in 7 days.
        `
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      return { success: true, messageId: data.messageId }
    } else {
      
      return { success: false, error: data.message || 'Failed to send email' }
    }
  } catch (error) {
    
    return { success: false, error: error.message }
  }
}

export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    if (!BREVO_API_KEY) {
      
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: 'Eric Rabar',
          email: 'noreply@ericrabar.com'
        },
        to: [{
          email: email,
          name: email
        }],
        subject: 'Reset Your Eric Rabar Password',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Eric Rabar</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Eric Rabar account.</p>
                <p>To reset your password, click the button below:</p>
                <p><a href="${resetUrl}?token=${resetToken}" class="button">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 Eric Rabar. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Reset Your Eric Rabar Password
          
          We received a request to reset your password.
          
          To reset your password, visit: ${resetUrl}?token=${resetToken}
          
          This link will expire in 1 hour.
          
          If you didn't request this, please ignore this email.
        `
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      return { success: true, messageId: data.messageId }
    } else {
      
      return { success: false, error: data.message || 'Failed to send email' }
    }
  } catch (error) {
    
    return { success: false, error: error.message }
  }
}

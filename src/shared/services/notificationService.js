// Notification Service for system alerts
// Handles in-app notifications, alerts, and activity feeds

import { Notification } from '@/lib/supabaseEntities'

class NotificationService {
  constructor() {
    this.notifications = new Map(); // In-memory storage (use database in production)
  }

  // Create a notification
  async createNotification({
    userId,
    type,
    title,
    message,
    actionUrl,
    metadata = {}
  }) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type, // 'approval', 'job', 'connection', 'investment', 'project_update', 'deal', 'system', 'subscription', 'connects', 'message'
      title,
      message,
      actionUrl,
      metadata,
      read: false,
      createdAt: new Date().toISOString()
    }

    // Store in memory
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, [])
    }
    this.notifications.get(userId).unshift(notification)

    // Keep only last 50 notifications per user
    const userNotifs = this.notifications.get(userId)
    if (userNotifs.length > 50) {
      this.notifications.set(userId, userNotifs.slice(0, 50))
    }

    // Also save to database for persistence
    try {
      await Notification.create({
        recipient_email: userId,
        type,
        title,
        message,
        link: actionUrl,
        read: false,
        created_at: notification.createdAt,
        metadata: JSON.stringify(metadata)
      })
    } catch (err) {
      //
    }

    return notification
  }

  // Get notifications for a user
  getUserNotifications(userId, limit = 20) {
    const userNotifs = this.notifications.get(userId) || []
    return userNotifs.slice(0, limit)
  }

  // Get unread count
  getUnreadCount(userId) {
    const userNotifs = this.notifications.get(userId) || []
    return userNotifs.filter(n => !n.read).length
  }

  // Mark as read
  markAsRead(userId, notificationId) {
    const userNotifs = this.notifications.get(userId) || []
    const notification = userNotifs.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      return true
    }
    return false
  }

  // Mark all as read
  markAllAsRead(userId) {
    const userNotifs = this.notifications.get(userId) || []
    userNotifs.forEach(n => n.read = true)
  }

  // Delete notification
  deleteNotification(userId, notificationId) {
    const userNotifs = this.notifications.get(userId) || []
    const index = userNotifs.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      userNotifs.splice(index, 1)
      return true
    }
    return false
  }

  // Specific notification creators

  // Project approval notification
  notifyProjectApproval(userId, userName, projectName, projectId) {
    return this.createNotification({
      userId,
      type: 'approval',
      title: 'Project Approved',
      message: `Your project "${projectName}" has been approved and is now live.`,
      actionUrl: `/projects/${projectId}`,
      metadata: { projectName, projectId }
    })
  }

  // Job opportunity notification
  notifyJobOpportunity(userId, jobTitle, companyName, jobId) {
    return this.createNotification({
      userId,
      type: 'job',
      title: 'New Job Opportunity',
      message: `${companyName} is looking for: ${jobTitle}`,
      actionUrl: `/jobs/${jobId}`,
      metadata: { jobTitle, companyName, jobId }
    })
  }

  // Connection request notification
  notifyConnectionRequest(userId, requesterName, requesterId) {
    return this.createNotification({
      userId,
      type: 'connection',
      title: 'New Connection Request',
      message: `${requesterName} wants to connect with you.`,
      actionUrl: `/connections`,
      metadata: { requesterName, requesterId }
    })
  }

  // Connection accepted notification
  notifyConnectionAccepted(userId, accepterName) {
    return this.createNotification({
      userId,
      type: 'connection',
      title: 'Connection Accepted',
      message: `${accepterName} accepted your connection request.`,
      actionUrl: `/connections`,
      metadata: { accepterName }
    })
  }

  // Investment notification
  notifyInvestment(userId, projectName, amount) {
    return this.createNotification({
      userId,
      type: 'investment',
      title: 'Investment Confirmed',
      message: `Your investment of $${amount} in "${projectName}" has been confirmed.`,
      actionUrl: '/backerinvestments',
      metadata: { projectName, amount }
    })
  }

  // Project update notification
  notifyProjectUpdate(userId, projectName, updateTitle) {
    return this.createNotification({
      userId,
      type: 'project_update',
      title: 'Project Update',
      message: `New update for "${projectName}": ${updateTitle}`,
      actionUrl: '/backerinvestments',
      metadata: { projectName, updateTitle }
    })
  }

  // Deal signed notification
  notifyDealSigned(userId, dealTitle) {
    return this.createNotification({
      userId,
      type: 'deal',
      title: 'Deal Signed',
      message: `The deal "${dealTitle}" has been signed and is now active.`,
      actionUrl: '/backerdeals',
      metadata: { dealTitle }
    })
  }

  // Deal pending notification
  notifyDealPending(userId, dealTitle) {
    return this.createNotification({
      userId,
      type: 'deal',
      title: 'New Deal to Sign',
      message: `You have a new deal "${dealTitle}" waiting for your signature.`,
      actionUrl: '/backerdeals',
      metadata: { dealTitle }
    })
  }

  // System notification
  notifySystem(userId, title, message) {
    return this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      actionUrl: '/notifications'
    })
  }

  // Backer application approval
  notifyBackerApproval(userId) {
    return this.createNotification({
      userId,
      type: 'approval',
      title: 'Backer Application Approved',
      message: 'Your backer application has been approved. You can now invest in projects.',
      actionUrl: '/backerdashboard',
      metadata: {}
    })
  }

  // Team invitation
  notifyTeamInvitation(userId, teamName, teamId) {
    return this.createNotification({
      userId,
      type: 'connection',
      title: 'Team Invitation',
      message: `You've been invited to join ${teamName}.`,
      actionUrl: `/teams/${teamId}`,
      metadata: { teamName, teamId }
    })
  }

  // Subscription activated
  notifySubscriptionActivated(userId, planName) {
    return this.createNotification({
      userId,
      type: 'subscription',
      title: 'Subscription Activated',
      message: `You are now subscribed to ${planName}. Enjoy your benefits!`,
      actionUrl: '/subscription',
      metadata: { planName }
    })
  }

  // Subscription renewal reminder
  notifySubscriptionRenewal(userId, planName, renewalDate) {
    return this.createNotification({
      userId,
      type: 'subscription',
      title: 'Subscription Renewal',
      message: `Your ${planName} subscription renews on ${new Date(renewalDate).toLocaleDateString()}.`,
      actionUrl: '/subscription',
      metadata: { planName, renewalDate }
    })
  }

  // Job application submitted
  notifyJobApplication(userId, jobTitle, companyName) {
    return this.createNotification({
      userId,
      type: 'job',
      title: 'Application Submitted',
      message: `Your application for "${jobTitle}" at ${companyName} has been submitted.`,
      actionUrl: '/my-applications',
      metadata: { jobTitle, propertyName }
    })
  }

  // Job application status update
  notifyJobApplicationStatus(userId, jobTitle, status) {
    return this.createNotification({
      userId,
      type: 'job',
      title: 'Application Status Update',
      message: `Your application for "${jobTitle}" is now: ${status}.`,
      actionUrl: '/my-applications',
      metadata: { jobTitle, status }
    })
  }

  // Connects received
  notifyConnectsReceived(userId, amount, reason) {
    return this.createNotification({
      userId,
      type: 'connects',
      title: 'Connects Received',
      message: `You received ${amount} connects${reason ? ` for ${reason}` : ''}.`,
      actionUrl: '/connects',
      metadata: { amount, reason }
    })
  }

  // New message received
  notifyNewMessage(userId, senderName, conversationId) {
    return this.createNotification({
      userId,
      type: 'message',
      title: 'New Message',
      message: `${senderName} sent you a message.`,
      actionUrl: `/messages/${conversationId}`,
      metadata: { senderName, conversationId }
    })
  }

  // Message limit reached
  notifyMessageLimitReached(userId) {
    return this.createNotification({
      userId,
      type: 'system',
      title: 'Message Limit Reached',
      message: 'You have reached your monthly message limit. Upgrade to send more messages.',
      actionUrl: '/subscription',
      metadata: {}
    })
  }

  // Job application limit reached
  notifyJobLimitReached(userId) {
    return this.createNotification({
      userId,
      type: 'system',
      title: 'Application Limit Reached',
      message: 'You have reached your monthly job application limit. Upgrade to apply to more jobs.',
      actionUrl: '/subscription',
      metadata: {}
    })
  }
}

export default new NotificationService()

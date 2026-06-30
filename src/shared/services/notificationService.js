// Notification Service for system alerts
// Handles in-app notifications, alerts, and activity feeds

class NotificationService {
  constructor() {
    this.notifications = new Map(); // In-memory storage (use database in production)
  }

  // Create a notification
  createNotification({
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
      type, // 'approval', 'job', 'connection', 'investment', 'project_update', 'deal', 'system'
      title,
      message,
      actionUrl,
      metadata,
      read: false,
      createdAt: new Date().toISOString()
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId).unshift(notification);

    // Keep only last 50 notifications per user
    const userNotifs = this.notifications.get(userId);
    if (userNotifs.length > 50) {
      this.notifications.set(userId, userNotifs.slice(0, 50));
    }

    return notification;
  }

  // Get notifications for a user
  getUserNotifications(userId, limit = 20) {
    const userNotifs = this.notifications.get(userId) || [];
    return userNotifs.slice(0, limit);
  }

  // Get unread count
  getUnreadCount(userId) {
    const userNotifs = this.notifications.get(userId) || [];
    return userNotifs.filter(n => !n.read).length;
  }

  // Mark as read
  markAsRead(userId, notificationId) {
    const userNotifs = this.notifications.get(userId) || [];
    const notification = userNotifs.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // Mark all as read
  markAllAsRead(userId) {
    const userNotifs = this.notifications.get(userId) || [];
    userNotifs.forEach(n => n.read = true);
  }

  // Delete notification
  deleteNotification(userId, notificationId) {
    const userNotifs = this.notifications.get(userId) || [];
    const index = userNotifs.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      userNotifs.splice(index, 1);
      return true;
    }
    return false;
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
  }

  // System notification
  notifySystem(userId, title, message) {
    return this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      actionUrl: '/notifications'
    });
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
    });
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
    });
  }
}

export default new NotificationService();

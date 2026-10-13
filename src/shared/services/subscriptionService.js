// Subscription Service for plan limitations and timeline enforcement
// Handles plan limits, usage tracking, and renewal logic

import { Subscription, SubscriptionPackage, Artist, Application, Message } from '@/lib/supabaseEntities'

class SubscriptionService {
  constructor() {
    this.cachedPlans = new Map()
  }

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const subscriptions = await Subscription.filter({ user_id: userId, status: 'active' })
      return subscriptions.length > 0 ? subscriptions[0] : null
    } catch (err) {
      //
      return null
    }
  }

  // Get plan details with limits
  async getPlanDetails(packageId) {
    if (this.cachedPlans.has(packageId)) {
      return this.cachedPlans.get(packageId)
    }

    try {
      const plans = await SubscriptionPackage.filter({ id: packageId })
      if (plans.length > 0) {
        this.cachedPlans.set(packageId, plans[0])
        return plans[0]
      }
    } catch (err) {
      //
    }
    return null
  }

  // Check if user can perform an action based on their plan limits
  async checkLimit(userId, actionType) {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      // No subscription - allow basic actions but with restrictions
      return { allowed: true, remaining: 0, limit: 0, isFree: true }
    }

    const plan = await this.getPlanDetails(subscription.package_id)
    if (!plan) {
      return { allowed: true, remaining: 0, limit: 0, isFree: true }
    }

    const now = new Date()
    const renewsAt = subscription.renews_at ? new Date(subscription.renews_at) : null

    // Check if subscription has expired
    if (renewsAt && now > renewsAt) {
      await this.handleExpiredSubscription(subscription)
      return { allowed: false, expired: true, isFree: true }
    }

    switch (actionType) {
      case 'message':
        return await this.checkMessageLimit(userId, plan, renewsAt)
      case 'job_application':
        return await this.checkJobApplicationLimit(userId, plan, renewsAt)
      case 'connect':
        return { allowed: true, remaining: 0, limit: 0 }; // Connects are purchased separately
      default:
        return { allowed: true, remaining: 0, limit: 0 }
    }
  }

  // Check message limit
  async checkMessageLimit(userId, plan, renewsAt) {
    if (plan.message_limit === -1) {
      // Unlimited messages
      return { allowed: true, remaining: -1, limit: -1, isUnlimited: true }
    }

    if (plan.message_limit === 0 || !plan.message_limit) {
      return { allowed: false, remaining: 0, limit: 0, isFree: true }
    }

    // Count messages sent this billing period
    const periodStart = renewsAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const messages = await Message.filter({
      sender_id: userId,
      created_at: { $gte: periodStart.toISOString() }
    })

    const used = messages.length
    const remaining = plan.message_limit - used

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: plan.message_limit,
      used
    }
  }

  // Check job application limit
  async checkJobApplicationLimit(userId, plan, renewsAt) {
    if (plan.job_applications_limit === -1) {
      // Unlimited applications
      return { allowed: true, remaining: -1, limit: -1, isUnlimited: true }
    }

    if (plan.job_applications_limit === 0 || !plan.job_applications_limit) {
      return { allowed: false, remaining: 0, limit: 0, isFree: true }
    }

    // Count applications this billing period
    const periodStart = renewsAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const applications = await Application.filter({
      user_id: userId,
      applied_at: { $gte: periodStart.toISOString() }
    })

    const used = applications.length
    const remaining = plan.job_applications_limit - used

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: plan.job_applications_limit,
      used
    }
  }

  // Handle expired subscription
  async handleExpiredSubscription(subscription) {
    try {
      await Subscription.update(subscription.id, {
        status: 'expired',
        expired_at: new Date().toISOString()
      })
      //
    } catch (err) {
      //
    }
  }

  // Track usage and notify when approaching limits
  async trackUsage(userId, actionType) {
    const limitCheck = await this.checkLimit(userId, actionType)

    // Notify if approaching limit (less than 20% remaining)
    if (limitCheck.limit > 0 && !limitCheck.isUnlimited) {
      const percentageRemaining = (limitCheck.remaining / limitCheck.limit) * 100
      if (percentageRemaining <= 20 && percentageRemaining > 0) {
        const notificationService = (await import('@/shared/services/notificationService')).default

        if (actionType === 'message') {
          notificationService.notifyMessageLimitReached(userId)
        } else if (actionType === 'job_application') {
          notificationService.notifyJobLimitReached(userId)
        }
      }
    }

    return limitCheck
  }

  // Check if subscription is due for renewal soon (within 7 days)
  async checkRenewalStatus(userId) {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription || !subscription.renews_at) {
      return { needsRenewal: false, daysRemaining: 0 }
    }

    const renewsAt = new Date(subscription.renews_at)
    const now = new Date()
    const daysRemaining = Math.ceil((renewsAt - now) / (1000 * 60 * 60 * 24))

    if (daysRemaining <= 7 && daysRemaining > 0) {
      return { needsRenewal: true, daysRemaining, renewsAt }
    }

    return { needsRenewal: false, daysRemaining }
  }

  // Get user's current plan features
  async getPlanFeatures(userId) {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return {
        connects_included: 0,
        message_limit: 0,
        job_applications_limit: 0,
        featured_listing: false,
        priority_support: false,
        analytics_access: false
      }
    }

    const plan = await this.getPlanDetails(subscription.package_id)
    if (!plan) {
      return {
        connects_included: 0,
        message_limit: 0,
        job_applications_limit: 0,
        featured_listing: false,
        priority_support: false,
        analytics_access: false
      }
    }

    return {
      connects_included: plan.connects_included || 0,
      message_limit: plan.message_limit || 0,
      job_applications_limit: plan.job_applications_limit || 0,
      featured_listing: plan.featured_listing || false,
      priority_support: plan.priority_support || false,
      analytics_access: plan.analytics_access || false
    }
  }

  // Check if user has access to a feature
  async hasFeatureAccess(userId, feature) {
    const features = await this.getPlanFeatures(userId)
    return features[feature] === true
  }

  // Check if user has an active subscription (any paid plan)
  async hasActiveSubscription(userId) {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return false

    // Check if subscription has expired
    const renewsAt = subscription.renews_at ? new Date(subscription.renews_at) : null
    if (renewsAt && new Date() > renewsAt) {
      await this.handleExpiredSubscription(subscription)
      return false
    }

    return subscription.status === 'active'
  }

  // Check if user can contact a job poster directly
  // Only subscribed users can contact job posters directly
  async canContactJobPoster(userId) {
    const hasSub = await this.hasActiveSubscription(userId)
    if (hasSub) {
      return { allowed: true, reason: 'active_subscription' }
    }
    return {
      allowed: false,
      reason: 'no_subscription',
      message: 'You need an active subscription to contact job posters directly. Upgrade to start messaging.',
    }
  }

  // Check if user can message another user based on roles and subscription
  // Rules:
  // - Subscribed users can message clients
  // - Clients can be added to network by anyone (connection requests)
  // - Artists can message each other freely
  async canMessageUser(senderId, recipientId, senderRole, recipientRole) {
    // Artists can message each other freely
    if (senderRole === 'artist' && recipientRole === 'artist') {
      return { allowed: true, reason: 'artist_to_artist' }
    }

    // Subscribed users can message clients
    if (recipientRole === 'client' || recipientRole === 'project_owner') {
      const hasSub = await this.hasActiveSubscription(senderId)
      if (hasSub) {
        return { allowed: true, reason: 'subscribed_to_client' }
      }
      return {
        allowed: false,
        reason: 'no_subscription',
        message: 'You need an active subscription to message clients. Upgrade to start messaging.',
      }
    }

    // Teams can message clients (if subscribed)
    if (senderRole === 'team' && (recipientRole === 'client' || recipientRole === 'project_owner')) {
      const hasSub = await this.hasActiveSubscription(senderId)
      if (hasSub) {
        return { allowed: true, reason: 'subscribed_team_to_client' }
      }
      return {
        allowed: false,
        reason: 'no_subscription',
        message: 'Your team needs an active subscription to message clients. Upgrade to start messaging.',
      }
    }

    // Clients can message artists freely (they're the ones posting jobs)
    if ((senderRole === 'client' || senderRole === 'project_owner') && recipientRole === 'artist') {
      return { allowed: true, reason: 'client_to_artist' }
    }

    // Backers can message clients (if subscribed)
    if (senderRole === 'backer' && (recipientRole === 'client' || recipientRole === 'project_owner')) {
      const hasSub = await this.hasActiveSubscription(senderId)
      if (hasSub) {
        return { allowed: true, reason: 'subscribed_backer_to_client' }
      }
      return {
        allowed: false,
        reason: 'no_subscription',
        message: 'You need an active subscription to message clients. Upgrade to start messaging.',
      }
    }

    // Default: allow for other combinations (e.g., team to team, backer to artist)
    return { allowed: true, reason: 'default_allowed' }
  }
}

export default new SubscriptionService()

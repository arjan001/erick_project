// Subscription Service for plan limitations and timeline enforcement
// Handles plan limits, usage tracking, and renewal logic

import { Subscription, SubscriptionPackage, Artist, Application, Message } from '@/lib/supabaseEntities';

class SubscriptionService {
  constructor() {
    this.cachedPlans = new Map();
  }

  // Get user's current subscription
  async getUserSubscription(userEmail) {
    try {
      const subscriptions = await Subscription.filter({ user_email: userEmail, status: 'active' });
      return subscriptions.length > 0 ? subscriptions[0] : null;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      return null;
    }
  }

  // Get plan details with limits
  async getPlanDetails(packageId) {
    if (this.cachedPlans.has(packageId)) {
      return this.cachedPlans.get(packageId);
    }

    try {
      const plans = await SubscriptionPackage.filter({ id: packageId });
      if (plans.length > 0) {
        this.cachedPlans.set(packageId, plans[0]);
        return plans[0];
      }
    } catch (err) {
      console.error('Error fetching plan details:', err);
    }
    return null;
  }

  // Check if user can perform an action based on their plan limits
  async checkLimit(userEmail, actionType) {
    const subscription = await this.getUserSubscription(userEmail);
    if (!subscription) {
      // No subscription - allow basic actions but with restrictions
      return { allowed: true, remaining: 0, limit: 0, isFree: true };
    }

    const plan = await this.getPlanDetails(subscription.package_id);
    if (!plan) {
      return { allowed: true, remaining: 0, limit: 0, isFree: true };
    }

    const now = new Date();
    const renewsAt = subscription.renews_at ? new Date(subscription.renews_at) : null;

    // Check if subscription has expired
    if (renewsAt && now > renewsAt) {
      await this.handleExpiredSubscription(subscription);
      return { allowed: false, expired: true, isFree: true };
    }

    switch (actionType) {
      case 'message':
        return await this.checkMessageLimit(userEmail, plan, renewsAt);
      case 'job_application':
        return await this.checkJobApplicationLimit(userEmail, plan, renewsAt);
      case 'connect':
        return { allowed: true, remaining: 0, limit: 0 }; // Connects are purchased separately
      default:
        return { allowed: true, remaining: 0, limit: 0 };
    }
  }

  // Check message limit
  async checkMessageLimit(userEmail, plan, renewsAt) {
    if (plan.message_limit === -1) {
      // Unlimited messages
      return { allowed: true, remaining: -1, limit: -1, isUnlimited: true };
    }

    if (plan.message_limit === 0 || !plan.message_limit) {
      return { allowed: false, remaining: 0, limit: 0, isFree: true };
    }

    // Count messages sent this billing period
    const periodStart = renewsAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const messages = await Message.filter({
      sender_email: userEmail,
      created_date: { $gte: periodStart.toISOString() }
    });

    const used = messages.length;
    const remaining = plan.message_limit - used;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: plan.message_limit,
      used
    };
  }

  // Check job application limit
  async checkJobApplicationLimit(userEmail, plan, renewsAt) {
    if (plan.job_applications_limit === -1) {
      // Unlimited applications
      return { allowed: true, remaining: -1, limit: -1, isUnlimited: true };
    }

    if (plan.job_applications_limit === 0 || !plan.job_applications_limit) {
      return { allowed: false, remaining: 0, limit: 0, isFree: true };
    }

    // Count applications this billing period
    const periodStart = renewsAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const applications = await Application.filter({
      artist_email: userEmail,
      applied_at: { $gte: periodStart.toISOString() }
    });

    const used = applications.length;
    const remaining = plan.job_applications_limit - used;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: plan.job_applications_limit,
      used
    };
  }

  // Handle expired subscription
  async handleExpiredSubscription(subscription) {
    try {
      await Subscription.update(subscription.id, {
        status: 'expired',
        expired_at: new Date().toISOString()
      });
      console.log(`Subscription ${subscription.id} marked as expired`);
    } catch (err) {
      console.error('Error marking subscription as expired:', err);
    }
  }

  // Track usage and notify when approaching limits
  async trackUsage(userEmail, actionType) {
    const limitCheck = await this.checkLimit(userEmail, actionType);
    
    // Notify if approaching limit (less than 20% remaining)
    if (limitCheck.limit > 0 && !limitCheck.isUnlimited) {
      const percentageRemaining = (limitCheck.remaining / limitCheck.limit) * 100;
      if (percentageRemaining <= 20 && percentageRemaining > 0) {
        const notificationService = (await import('@/shared/services/notificationService')).default;
        
        if (actionType === 'message') {
          notificationService.notifyMessageLimitReached(userEmail);
        } else if (actionType === 'job_application') {
          notificationService.notifyJobLimitReached(userEmail);
        }
      }
    }

    return limitCheck;
  }

  // Check if subscription is due for renewal soon (within 7 days)
  async checkRenewalStatus(userEmail) {
    const subscription = await this.getUserSubscription(userEmail);
    if (!subscription || !subscription.renews_at) {
      return { needsRenewal: false, daysRemaining: 0 };
    }

    const renewsAt = new Date(subscription.renews_at);
    const now = new Date();
    const daysRemaining = Math.ceil((renewsAt - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7 && daysRemaining > 0) {
      return { needsRenewal: true, daysRemaining, renewsAt };
    }

    return { needsRenewal: false, daysRemaining };
  }

  // Get user's current plan features
  async getPlanFeatures(userEmail) {
    const subscription = await this.getUserSubscription(userEmail);
    if (!subscription) {
      return {
        connects_included: 0,
        message_limit: 0,
        job_applications_limit: 0,
        featured_listing: false,
        priority_support: false,
        analytics_access: false
      };
    }

    const plan = await this.getPlanDetails(subscription.package_id);
    if (!plan) {
      return {
        connects_included: 0,
        message_limit: 0,
        job_applications_limit: 0,
        featured_listing: false,
        priority_support: false,
        analytics_access: false
      };
    }

    return {
      connects_included: plan.connects_included || 0,
      message_limit: plan.message_limit || 0,
      job_applications_limit: plan.job_applications_limit || 0,
      featured_listing: plan.featured_listing || false,
      priority_support: plan.priority_support || false,
      analytics_access: plan.analytics_access || false
    };
  }

  // Check if user has access to a feature
  async hasFeatureAccess(userEmail, feature) {
    const features = await this.getPlanFeatures(userEmail);
    return features[feature] === true;
  }
}

export default new SubscriptionService();

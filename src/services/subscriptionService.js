import { base44 } from '@/api/base44Client'

const subscriptionEntity = base44.entities.subscriptions || {
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
}

const packageEntity = base44.entities.subscription_packages || {
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId) {
  try {
    const now = new Date().toISOString()
    const subscriptions = await subscriptionEntity.filter({
      user_id: userId,
      status: 'active'
    }, '-created_at', 1)
    
    // Check if subscription is still valid
    if (subscriptions && subscriptions.length > 0) {
      const sub = subscriptions[0]
      if (sub.current_period_end && new Date(sub.current_period_end) > new Date()) {
        return sub
      }
    }
    
    return null
  } catch (error) {
    //
    return null
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId) {
  const sub = await getUserSubscription(userId)
  return sub !== null
}

/**
 * Get all subscription packages
 */
export async function getSubscriptionPackages() {
  try {
    const packages = await packageEntity.filter({ active: true }, 'price_monthly', 100)
    return packages || []
  } catch (error) {
    //
    return []
  }
}

/**
 * Get a single subscription package
 */
export async function getSubscriptionPackage(packageId) {
  try {
    return await packageEntity.get(packageId)
  } catch (error) {
    //
    return null
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription({ userId, packageId, billingCycle }) {
  try {
    const pkg = await getSubscriptionPackage(packageId)
    if (!pkg) throw new Error('Package not found')
    
    const price = billingCycle === 'yearly' ? pkg.price_yearly : pkg.price_monthly
    const now = new Date()
    const periodEnd = new Date()
    
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }
    
    return await subscriptionEntity.create({
      user_id: userId,
      package_id: packageId,
      status: 'active',
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    })
  } catch (error) {
    //
    throw error
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId) {
  try {
    return await subscriptionEntity.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  } catch (error) {
    //
    throw error
  }
}

/**
 * Check if user can contact job poster (requires active subscription)
 */
export async function canContactJobPoster(userId) {
  return await hasActiveSubscription(userId)
}

/**
 * Check if user can apply for jobs (requires active subscription)
 */
export async function canApplyForJobs(userId) {
  return await hasActiveSubscription(userId)
}

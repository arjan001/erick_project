import { supabase } from '@/lib/supabase'

export const analyticsApi = {
  // Real-time users - using actual analytics tables
  getLiveUsers: async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('live_users')
      .select('*')
      .gte('last_activity', fiveMinutesAgo)
      .order('last_activity', { ascending: false })
    if (error) throw error
    
    return data || []
  },

  getLiveUserCount: async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('live_users')
      .select('id')
      .gte('last_activity', fiveMinutesAgo)
    if (error) throw error
    
    return data?.length || 0
  },

  // Geographic data - using analytics tables with country info
  getCountryStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('country')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
    if (error) throw error

    const allCountries = (data || []).map(s => s.country).filter(Boolean)
    const countryCounts = allCountries.reduce((acc, country) => {
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    return Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
      percentage: allCountries.length > 0 ? ((count / allCountries.length) * 100).toFixed(1) : 0
    })).sort((a, b) => b.count - a.count)
  },

  // Top pages - using page_views table
  getTopPages: async (startDate, endDate, limit = 10) => {
    const { data, error } = await supabase
      .from('page_views')
      .select('page_path, page_title')
      .gte('viewed_at', startDate)
      .lte('viewed_at', endDate)
    if (error) throw error

    const pageCounts = data.reduce((acc, view) => {
      const key = view.page_path
      acc[key] = acc[key] || { path: view.page_path, title: view.page_title || view.page_path, count: 0 }
      acc[key].count += 1
      return acc
    }, {})

    return Object.values(pageCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  },

  // Session stats - using user_sessions table
  getSessionStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
    if (error) throw error

    const totalSessions = data.length
    
    // Device types from device_type column
    const deviceTypes = data.reduce((acc, session) => {
      const device = session.device_type || 'desktop'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Calculate average session duration
    const durations = data
      .map(s => s.duration_seconds)
      .filter(d => d && d > 0)
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionIds = data.map(s => s.session_id)
    const { data: pageViewData } = await supabase
      .from('page_views')
      .select('session_id')
      .in('session_id', sessionIds)
    
    const viewCounts = pageViewData.reduce((acc, pv) => {
      acc[pv.session_id] = (acc[pv.session_id] || 0) + 1
      return acc
    }, {})
    
    const bouncedSessions = Object.values(viewCounts).filter(count => count === 1).length
    const bounceRate = totalSessions > 0 ? ((bouncedSessions / totalSessions) * 100).toFixed(1) : 0

    return {
      totalSessions,
      avgDuration: avgDuration,
      bounceRate: parseFloat(bounceRate),
      deviceTypes: Object.entries(deviceTypes).map(([name, count]) => ({
        name,
        count,
        percentage: totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : 0
      }))
    }
  },

  // Page views - using page_views table
  getPageViews: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('viewed_at', startDate)
      .lte('viewed_at', endDate)
    if (error) throw error
    
    return data?.length || 0
  },

  // Total sessions - using user_sessions table
  getTotalSessions: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
    if (error) throw error
    
    return data?.length || 0
  },

  // Errors - using error_logs table
  getErrors: async (startDate, endDate, severity = null) => {
    let query = supabase
      .from('error_logs')
      .select('*')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate)
      .eq('resolved', false)

    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data, error } = await query.order('occurred_at', { ascending: false })
    if (error) throw error
    
    return (data || []).map(err => ({
      id: err.id,
      error_type: err.error_type || 'Error',
      error_message: err.error_message,
      page_path: err.page_path || 'Unknown',
      severity: err.severity || 'error',
      component: err.component_name || 'Unknown',
      occurred_at: err.occurred_at
    }))
  },

  getErrorStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('error_logs')
      .select('severity, resolved')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate)
    if (error) throw error

    const totalErrors = data.length
    const resolvedCount = data.filter(e => e.resolved).length

    const severityCounts = data.reduce((acc, e) => {
      acc[e.severity || 'error'] = (acc[e.severity || 'error'] || 0) + 1
      return acc
    }, {})

    return {
      totalErrors,
      resolvedCount,
      unresolvedCount: totalErrors - resolvedCount,
      resolutionRate: totalErrors > 0 ? ((resolvedCount / totalErrors) * 100).toFixed(1) : 0,
      bySeverity: Object.entries(severityCounts).map(([severity, count]) => ({
        severity,
        count,
        percentage: totalErrors > 0 ? ((count / totalErrors) * 100).toFixed(1) : 0
      }))
    }
  },

  resolveError: async (errorId, resolvedBy) => {
    const { data, error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by
      })
      .eq('id', errorId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Subscription analytics - using subscription_analytics table
  getSubscriptionStats: async () => {
    const { data, error } = await supabase
      .from('subscription_analytics')
      .select('*')
    if (error) throw error

    const activeSubscriptions = data.filter(s => s.is_active)
    const cancelledSubscriptions = data.filter(s => !s.is_active)

    const totalRevenue = data.reduce((sum, s) => sum + (s.total_revenue || 0), 0)
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.monthly_price || 0), 0)

    const planDistribution = data.reduce((acc, s) => {
      acc[s.plan_name || 'unknown'] = (acc[s.plan_name || 'unknown'] || 0) + 1
      return acc
    }, {})

    // Calculate churn rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentCancellations = cancelledSubscriptions.filter(
      s => new Date(s.cancellation_date) >= thirtyDaysAgo
    ).length
    const totalStartersLast30Days = data.filter(
      s => new Date(s.start_date) >= thirtyDaysAgo
    ).length
    const churnRate = totalStartersLast30Days > 0 
      ? ((recentCancellations / totalStartersLast30Days) * 100).toFixed(1) 
      : 0

    // Calculate average subscription duration
    const endedSubscriptions = data.filter(s => !s.is_active && s.end_date)
    const avgDuration = endedSubscriptions.length > 0
      ? endedSubscriptions.reduce((sum, s) => {
          const start = new Date(s.start_date)
          const end = new Date(s.end_date)
          return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24))
        }, 0) / endedSubscriptions.length
      : 0

    return {
      totalSubscriptions: data.length,
      activeSubscriptions: activeSubscriptions.length,
      cancelledSubscriptions: cancelledSubscriptions.length,
      totalRevenue,
      monthlyRecurringRevenue,
      churnRate: parseFloat(churnRate),
      avgDuration: Math.round(avgDuration),
      planDistribution: Object.entries(planDistribution).map(([plan, count]) => ({
        plan,
        count,
        percentage: data.length > 0 ? ((count / data.length) * 100).toFixed(1) : 0
      }))
    }
  },

  // Overview stats - using actual data from tables
  getOverviewStats: async (startDate, endDate) => {
    const [sessions, pageViews, liveUsers, subs] = await Promise.all([
      supabase.from('user_sessions').select('id').gte('started_at', startDate).lte('started_at', endDate),
      supabase.from('page_views').select('id').gte('viewed_at', startDate).lte('viewed_at', endDate),
      supabase.from('live_users').select('id').gte('last_activity', startDate).lte('last_activity', endDate),
      supabase.from('subscription_analytics').select('*').eq('is_active', true)
    ])

    const activeSubs = subs.data?.length || 0
    const mrr = subs.data?.reduce((sum, s) => sum + (s.monthly_price || 0), 0) || 0

    return {
      totalSessions: sessions.data?.length || 0,
      totalPageViews: pageViews.data?.length || 0,
      liveUsers: liveUsers.data?.length || 0,
      totalErrors: 0,
      unresolvedErrors: 0,
      activeSubscriptions: activeSubs,
      monthlyRecurringRevenue: mrr,
      churnRate: 0
    }
  },

  // Transactional data analytics
  getTransactionalStats: async (startDate, endDate) => {
    const [projects, jobs, applications, subscriptions, artists, teams, clients] = await Promise.all([
      supabase.from('projects').select('created_at, status, budget').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('jobs').select('created_at, status').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('job_applications').select('created_at, status').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('subscription_analytics').select('created_at, monthly_price, is_active').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('artists').select('created_at').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('teams').select('created_at').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('clients').select('created_at').gte('created_at', startDate).lte('created_at', endDate)
    ])

    // Group by day for charts
    const groupByDay = (data, dateField) => {
      const grouped = {}
      (data || []).forEach(item => {
        const date = new Date(item[dateField]).toISOString().split('T')[0]
        grouped[date] = (grouped[date] || 0) + 1
      })
      return Object.entries(grouped).map(([date, count]) => ({ date, count }))
    }

    // Calculate total revenue from subscriptions
    const totalRevenue = (subscriptions.data || []).reduce((sum, s) => sum + (s.total_revenue || 0), 0)

    // Project status breakdown
    const projectStatuses = (projects.data || []).reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})

    // Application status breakdown
    const applicationStatuses = (applications.data || []).reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {})

    return {
      projects: {
        total: projects.data?.length || 0,
        byDay: groupByDay(projects.data, 'created_at'),
        byStatus: Object.entries(projectStatuses).map(([status, count]) => ({ status, count })),
        totalBudget: (projects.data || []).reduce((sum, p) => sum + (p.budget || 0), 0)
      },
      jobs: {
        total: jobs.data?.length || 0,
        byDay: groupByDay(jobs.data, 'created_at')
      },
      applications: {
        total: applications.data?.length || 0,
        byDay: groupByDay(applications.data, 'created_at'),
        byStatus: Object.entries(applicationStatuses).map(([status, count]) => ({ status, count }))
      },
      subscriptions: {
        total: subscriptions.data?.length || 0,
        byDay: groupByDay(subscriptions.data, 'created_at'),
        totalRevenue,
        active: (subscriptions.data || []).filter(s => s.is_active).length
      },
      newUsers: {
        artists: artists.data?.length || 0,
        teams: teams.data?.length || 0,
        clients: clients.data?.length || 0,
        total: (artists.data?.length || 0) + (teams.data?.length || 0) + (clients.data?.length || 0)
      }
    }
  },

  // Security analytics - detect suspicious activity
  getSecurityStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
    if (error) throw error

    // Detect IP spoofing attempts (multiple IPs from same user in short time)
    const userIPs = data.reduce((acc, log) => {
      if (log.user_id && log.ip_address) {
        const key = log.user_id
        if (!acc[key]) acc[key] = { ips: new Set(), count: 0 }
        acc[key].ips.add(log.ip_address)
        acc[key].count++
      }
      return acc
    }, {})

    const suspiciousIPs = Object.entries(userIPs)
      .filter(([_, data]) => data.ips.size > 3 && data.count > 10)
      .map(([userId, data]) => ({ userId, ipCount: data.ips.size, actionCount: data.count }))

    // Detect suspicious routes/failed attempts
    const suspiciousRoutes = data.filter(log => 
      log.is_suspicious || log.severity === 'critical' || log.severity === 'error'
    )

    // Group by module
    const moduleActivity = data.reduce((acc, log) => {
      const module = log.module_name || 'unknown'
      acc[module] = (acc[module] || 0) + 1
      return acc
    }, {})

    return {
      suspiciousIPs,
      suspiciousRoutes: suspiciousRoutes.length,
      moduleActivity: Object.entries(moduleActivity).map(([module, count]) => ({ module, count })),
      totalAudits: data.length,
      criticalEvents: data.filter(l => l.severity === 'critical').length,
      warningEvents: data.filter(l => l.severity === 'warning').length
    }
  }
}

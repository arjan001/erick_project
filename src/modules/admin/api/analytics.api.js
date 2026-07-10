import { supabase } from '@/lib/supabase';

export const analyticsApi = {
  // Real-time users
  getLiveUsers: async () => {
    const { data, error } = await supabase
      .from('live_users')
      .select('*, users(email, first_name, last_name)')
      .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString());
    if (error) throw error;
    return data;
  },

  getLiveUserCount: async () => {
    const { count, error } = await supabase
      .from('live_users')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString());
    if (error) throw error;
    return count;
  },

  // Geographic data for map
  getTrafficByCountry: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('country, latitude, longitude')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .not('country', 'is', null);
    if (error) throw error;
    return data;
  },

  getCountryStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('country')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .not('country', 'is', null);
    if (error) throw error;

    const countryCounts = data.reduce((acc, session) => {
      acc[session.country] = (acc[session.country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  },

  // Page views and sessions
  getPageViews: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('viewed_at', startDate)
      .lte('viewed_at', endDate);
    if (error) throw error;
    return data;
  },

  getTopPages: async (startDate, endDate, limit = 10) => {
    const { data, error } = await supabase
      .from('page_views')
      .select('page_path, page_title')
      .gte('viewed_at', startDate)
      .lte('viewed_at', endDate);
    if (error) throw error;

    const pageCounts = data.reduce((acc, view) => {
      const key = view.page_path;
      acc[key] = acc[key] || { path: view.page_path, title: view.page_title, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(pageCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  // User sessions
  getSessions: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate);
    if (error) throw error;
    return data;
  },

  getSessionStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('duration_seconds, device_type, browser, os')
      .gte('started_at', startDate)
      .lte('started_at', endDate);
    if (error) throw error;

    const totalSessions = data.length;
    const avgDuration = data.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions;

    const deviceTypes = data.reduce((acc, s) => {
      acc[s.device_type || 'unknown'] = (acc[s.device_type || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const browsers = data.reduce((acc, s) => {
      acc[s.browser || 'unknown'] = (acc[s.browser || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSessions,
      avgDuration: Math.round(avgDuration),
      deviceTypes: Object.entries(deviceTypes).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / totalSessions) * 100).toFixed(1)
      })),
      browsers: Object.entries(browsers).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / totalSessions) * 100).toFixed(1)
      }))
    };
  },

  // Analytics events
  getEvents: async (startDate, endDate, eventType = null) => {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getEventCounts: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, event_name')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate);
    if (error) throw error;

    const eventCounts = data.reduce((acc, event) => {
      const key = `${event.event_type}:${event.event_name}`;
      acc[key] = acc[key] || { type: event.event_type, name: event.event_name, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(eventCounts).sort((a, b) => b.count - a.count);
  },

  // Error logs
  getErrors: async (startDate, endDate, severity = null) => {
    let query = supabase
      .from('error_logs')
      .select('*, users(email, first_name, last_name)')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate)
      .eq('resolved', false);

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query.order('occurred_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getErrorStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('error_logs')
      .select('severity, error_type, resolved')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate);
    if (error) throw error;

    const totalErrors = data.length;
    const resolvedCount = data.filter(e => e.resolved).length;

    const severityCounts = data.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {});

    const typeCounts = data.reduce((acc, e) => {
      acc[e.error_type || 'unknown'] = (acc[e.error_type || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    return {
      totalErrors,
      resolvedCount,
      unresolvedCount: totalErrors - resolvedCount,
      resolutionRate: totalErrors > 0 ? ((resolvedCount / totalErrors) * 100).toFixed(1) : 0,
      bySeverity: Object.entries(severityCounts).map(([severity, count]) => ({
        severity,
        count,
        percentage: ((count / totalErrors) * 100).toFixed(1)
      })),
      byType: Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / totalErrors) * 100).toFixed(1)
      }))
    };
  },

  resolveError: async (errorId, resolvedBy) => {
    const { data, error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', errorId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Subscription analytics
  getSubscriptionAnalytics: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('subscription_analytics')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate);
    if (error) throw error;
    return data;
  },

  getSubscriptionStats: async () => {
    const { data, error } = await supabase
      .from('subscription_analytics')
      .select('*');
    if (error) throw error;

    const activeSubscriptions = data.filter(s => s.is_active);
    const cancelledSubscriptions = data.filter(s => !s.is_active && s.cancellation_date);

    const totalRevenue = data.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.monthly_price || 0), 0);

    const planDistribution = data.reduce((acc, s) => {
      acc[s.plan_tier || 'unknown'] = (acc[s.plan_tier || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    // Calculate churn rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCancellations = cancelledSubscriptions.filter(
      s => new Date(s.cancellation_date) >= thirtyDaysAgo
    ).length;
    const totalStartersLast30Days = data.filter(
      s => new Date(s.start_date) >= thirtyDaysAgo
    ).length;
    const churnRate = totalStartersLast30Days > 0 
      ? ((recentCancellations / totalStartersLast30Days) * 100).toFixed(1) 
      : 0;

    // Calculate average subscription duration
    const endedSubscriptions = data.filter(s => s.end_date);
    const avgDuration = endedSubscriptions.length > 0
      ? endedSubscriptions.reduce((sum, s) => {
          const start = new Date(s.start_date);
          const end = new Date(s.end_date);
          return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
        }, 0) / endedSubscriptions.length
      : 0;

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
        percentage: ((count / data.length) * 100).toFixed(1)
      }))
    };
  },

  // Overview stats
  getOverviewStats: async (startDate, endDate) => {
    const [sessions, pageViews, liveCount, errorStats, subStats] = await Promise.all([
      analyticsApi.getSessions(startDate, endDate),
      analyticsApi.getPageViews(startDate, endDate),
      analyticsApi.getLiveUserCount(),
      analyticsApi.getErrorStats(startDate, endDate),
      analyticsApi.getSubscriptionStats()
    ]);

    return {
      totalSessions: sessions.length,
      totalPageViews: pageViews.length,
      liveUsers: liveCount,
      totalErrors: errorStats.totalErrors,
      unresolvedErrors: errorStats.unresolvedCount,
      activeSubscriptions: subStats.activeSubscriptions,
      monthlyRecurringRevenue: subStats.monthlyRecurringRevenue,
      churnRate: subStats.churnRate
    };
  }
};

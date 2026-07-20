import { supabase } from '@/lib/supabase';

export const analyticsApi = {
  // Real-time users - using audit logs as proxy for recent activity
  getLiveUsers: async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('actor_email, created_at, metadata')
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    
    // Deduplicate by email
    const uniqueUsers = [];
    const seenEmails = new Set();
    for (const log of data || []) {
      if (log.actor_email && !seenEmails.has(log.actor_email)) {
        seenEmails.add(log.actor_email);
        uniqueUsers.push({
          session_id: log.id,
          users: { email: log.actor_email, first_name: log.metadata?.first_name, last_name: log.metadata?.last_name },
          current_page: log.metadata?.page_path || 'Platform Activity',
          country: log.metadata?.country || null
        });
      }
    }
    return uniqueUsers;
  },

  getLiveUserCount: async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('actor_email')
      .gte('created_at', fiveMinutesAgo);
    if (error) throw error;
    
    const uniqueEmails = new Set((data || []).map(log => log.actor_email).filter(Boolean));
    return uniqueEmails.size;
  },

  // Geographic data - using artist/team/client location data
  getCountryStats: async (startDate, endDate) => {
    const [artists, teams, clients] = await Promise.all([
      supabase.from('artists').select('based_in_country').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('teams').select('based_in_country').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('clients').select('country').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    const allCountries = [
      ...(artists.data || []).map(a => a.based_in_country),
      ...(teams.data || []).map(t => t.based_in_country),
      ...(clients.data || []).map(c => c.country)
    ].filter(Boolean);

    const countryCounts = allCountries.reduce((acc, country) => {
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
      percentage: allCountries.length > 0 ? ((count / allCountries.length) * 100).toFixed(1) : 0
    })).sort((a, b) => b.count - a.count);
  },

  // Top pages - using audit logs entity types as proxy
  getTopPages: async (startDate, endDate, limit = 10) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('entity_type, action')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    if (error) throw error;

    const pageCounts = data.reduce((acc, log) => {
      const key = `${log.entity_type}:${log.action}`;
      acc[key] = acc[key] || { path: `${log.entity_type}/${log.action}`, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(pageCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  // Session stats - using audit logs as proxy
  getSessionStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    if (error) throw error;

    const totalSessions = data.length;
    
    // Device types from user agent in metadata
    const deviceTypes = data.reduce((acc, log) => {
      const device = log.metadata?.device_type || 'desktop';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSessions,
      avgDuration: 300, // Placeholder - would need actual session tracking
      deviceTypes: Object.entries(deviceTypes).map(([name, count]) => ({
        name,
        count,
        percentage: totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : 0
      }))
    };
  },

  // Errors - using support tickets as proxy
  getErrors: async (startDate, endDate, severity = null) => {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'open');

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map(ticket => ({
      id: ticket.id,
      error_type: ticket.category || 'Support Issue',
      error_message: ticket.subject,
      page_path: ticket.metadata?.page_path || 'Unknown',
      severity: ticket.priority || 'medium'
    }));
  },

  getErrorStats: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('status, priority, category')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    if (error) throw error;

    const totalErrors = data.length;
    const resolvedCount = data.filter(t => t.status === 'closed' || t.status === 'resolved').length;

    const severityCounts = data.reduce((acc, t) => {
      acc[t.priority || 'medium'] = (acc[t.priority || 'medium'] || 0) + 1;
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
        percentage: totalErrors > 0 ? ((count / totalErrors) * 100).toFixed(1) : 0
      }))
    };
  },

  resolveError: async (errorId, resolvedBy) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        updated_at: new Date().toISOString()
      })
      .eq('id', errorId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Subscription analytics - using actual subscriptions table
  getSubscriptionStats: async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*');
    if (error) throw error;

    const activeSubscriptions = data.filter(s => s.status === 'active');
    const cancelledSubscriptions = data.filter(s => s.status === 'cancelled');

    const totalRevenue = data.reduce((sum, s) => sum + (s.amount || 0), 0);
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

    const planDistribution = data.reduce((acc, s) => {
      acc[s.package_name || 'unknown'] = (acc[s.package_name || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    // Calculate churn rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCancellations = cancelledSubscriptions.filter(
      s => new Date(s.updated_at) >= thirtyDaysAgo
    ).length;
    const totalStartersLast30Days = data.filter(
      s => new Date(s.created_at) >= thirtyDaysAgo
    ).length;
    const churnRate = totalStartersLast30Days > 0 
      ? ((recentCancellations / totalStartersLast30Days) * 100).toFixed(1) 
      : 0;

    // Calculate average subscription duration
    const endedSubscriptions = data.filter(s => s.status === 'cancelled');
    const avgDuration = endedSubscriptions.length > 0
      ? endedSubscriptions.reduce((sum, s) => {
          const start = new Date(s.created_at);
          const end = new Date(s.updated_at);
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
        percentage: data.length > 0 ? ((count / data.length) * 100).toFixed(1) : 0
      }))
    };
  },

  // Overview stats - using actual data
  getOverviewStats: async (startDate, endDate) => {
    const [projects, jobs, applications, subscriptions, auditLogs] = await Promise.all([
      supabase.from('projects').select('*').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('jobs').select('*').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('applications').select('*').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('subscriptions').select('*').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('audit_logs').select('*').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    const activeSubs = (subscriptions.data || []).filter(s => s.status === 'active').length;
    const mrr = (subscriptions.data || []).filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount || 0), 0);

    return {
      totalSessions: auditLogs.data?.length || 0,
      totalPageViews: auditLogs.data?.length || 0,
      liveUsers: 0, // Would need real-time tracking
      totalErrors: 0,
      unresolvedErrors: 0,
      activeSubscriptions: activeSubs,
      monthlyRecurringRevenue: mrr,
      churnRate: 0
    };
  },

  // Transactional data analytics
  getTransactionalStats: async (startDate, endDate) => {
    const [projects, jobs, applications, subscriptions, artists, teams, clients] = await Promise.all([
      supabase.from('projects').select('created_at, status, budget').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('jobs').select('created_at, status').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('applications').select('created_at, status').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('subscriptions').select('created_at, amount, status').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('artists').select('created_at').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('teams').select('created_at').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('clients').select('created_at').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    // Group by day for charts
    const groupByDay = (data, dateField) => {
      const grouped = {};
      (data || []).forEach(item => {
        const date = new Date(item[dateField]).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    };

    // Calculate total revenue from subscriptions
    const totalRevenue = (subscriptions.data || []).reduce((sum, s) => sum + (s.amount || 0), 0);

    // Project status breakdown
    const projectStatuses = (projects.data || []).reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    // Application status breakdown
    const applicationStatuses = (applications.data || []).reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

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
        active: (subscriptions.data || []).filter(s => s.status === 'active').length
      },
      newUsers: {
        artists: artists.data?.length || 0,
        teams: teams.data?.length || 0,
        clients: clients.data?.length || 0,
        total: (artists.data?.length || 0) + (teams.data?.length || 0) + (clients.data?.length || 0)
      }
    };
  }
};

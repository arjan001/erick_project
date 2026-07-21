/**
 * Drop-in Supabase-backed replacements for the base44.entities.{Job,Project,Application,JobInvitation}
 * calls, exposing the same list/filter/get/create/update shape so pages need minimal changes.
 */
import { supabase } from '@/lib/supabase';

function applyFilters(query, filters = {}) {
  Object.entries(filters).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$gte' in value) query = query.gte(key, value.$gte);
      if ('$lte' in value) query = query.lte(key, value.$lte);
      if ('$gt' in value) query = query.gt(key, value.$gt);
      if ('$lt' in value) query = query.lt(key, value.$lt);
    } else {
      query = query.eq(key, value);
    }
  });
  return query;
}

function buildEntity(table, createdAtAlias) {
  const getSelect = (columns) => {
    if (columns && typeof columns === 'string') {
      return columns;
    }
    return createdAtAlias ? `*, created_date:${createdAtAlias}` : '*';
  };

  const withOrder = (query, sort, limit) => {
    if (sort) {
      const desc = sort.startsWith('-');
      let field = desc ? sort.slice(1) : sort;
      // Translate the aliased "created_date" back to the real DB column name
      // so ORDER BY works (PostgREST can't order by a select alias).
      if (field === 'created_date' && createdAtAlias) field = createdAtAlias;
      query = query.order(field, { ascending: !desc });
    }
    if (limit) query = query.limit(limit);
    return query;
  };

  return {
    list: async (sort, limit, columns) => {
      const select = getSelect(columns);
      const { data, error } = await withOrder(supabase.from(table).select(select), sort, limit);
      if (error) throw error;
      return data;
    },
    filter: async (filters = {}, sort, limit, columns) => {
      const select = getSelect(columns);
      const { data, error } = await withOrder(applyFilters(supabase.from(table).select(select), filters), sort, limit);
      if (error) throw error;
      return data;
    },
    get: async (id, columns) => {
      const select = getSelect(columns);
      const { data, error } = await supabase.from(table).select(select).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabase.from(table).insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };
}

// Roles & Permissions Entities
export const Permission = buildEntity('permissions', 'created_at');
export const Role = buildEntity('roles', 'created_at');
export const RolePermission = buildEntity('role_permissions', 'granted_at');
export const UserRole = buildEntity('user_roles', 'assigned_at');

export const Job = buildEntity('jobs', 'created_at');
export const Project = buildEntity('projects', 'created_at');
export const Application = buildEntity('applications', 'created_at');
export const JobInvitation = buildEntity('job_invitations', 'sent_at');
export const SubscriptionOrder = buildEntity('subscription_orders', 'created_at');

export const Artist = buildEntity('artists', 'created_at');
export const Backer = buildEntity('backers', 'created_at');
export const ProjectOwner = buildEntity('project_owners', 'created_at');
export const Client = buildEntity('clients', 'created_at');
export const Message = buildEntity('messages', 'created_at');
export const Notification = buildEntity('notifications', 'created_at');
export const Connection = buildEntity('connections', 'created_at');
export const PortfolioClip = buildEntity('portfolio_clips', 'created_at');
export const Endorsement = buildEntity('endorsements', 'created_at');
export const Testimonial = buildEntity('testimonials', 'created_at');
export const Deal = buildEntity('deals', 'created_at');
export const Partner = buildEntity('partners', 'created_at');
export const InvestmentTier = buildEntity('investment_tiers', 'created_at');
export const ProjectUpdate = buildEntity('project_updates', 'created_at');
export const BackedProject = buildEntity('backed_projects', 'investment_date');
export const ConnectsTransaction = buildEntity('connects_transactions', 'created_at');
export const AuditLog = buildEntity('audit_logs', 'created_at');
export const TickerEntry = buildEntity('ticker_entries', 'created_at');
export const ContentCategory = buildEntity('content_categories', 'created_at');
export const FeaturedWork = buildEntity('featured_work', 'created_at');
export const SuccessStory = buildEntity('success_stories', 'created_at');
export const RecentProject = buildEntity('recent_projects', 'created_at');
export const Article = buildEntity('articles', 'created_at');
export const SubscriptionPackage = buildEntity('subscription_packages', null);
export const Subscription = buildEntity('subscriptions', 'created_at');
export const Note = buildEntity('notes', 'created_at');
export const SavedProject = buildEntity('saved_projects', 'created_at');
export const Assignment = buildEntity('assignments', 'created_at');
export const Creator = buildEntity('creators', 'created_at');
export const Translation = buildEntity('translations', 'created_at');
export const SystemSetting = buildEntity('admin_settings', 'updated_at');
export const Team = buildEntity('teams', 'created_at');
export const TeamMember = buildEntity('team_members', 'created_at');
export const Invite = buildEntity('invites', 'created_at');
export const BillingInfo = buildEntity('billing_info', 'created_at');
export const Invoice = buildEntity('invoices', 'created_at');
export const SecuritySettings = buildEntity('security_settings', 'created_at');
export const ActiveSession = buildEntity('active_sessions', 'created_at');
export const SupportTicket = buildEntity('support_tickets', 'created_at');
export const TicketResponse = buildEntity('ticket_responses', 'created_at');
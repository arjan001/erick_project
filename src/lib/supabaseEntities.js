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
  const select = createdAtAlias ? `*, created_date:${createdAtAlias}` : '*';

  const withOrder = (query, sort, limit) => {
    if (sort) {
      const desc = sort.startsWith('-');
      query = query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
    }
    if (limit) query = query.limit(limit);
    return query;
  };

  return {
    list: async (sort, limit) => {
      const { data, error } = await withOrder(supabase.from(table).select(select), sort, limit);
      if (error) throw error;
      return data;
    },
    filter: async (filters = {}, sort, limit) => {
      const { data, error } = await withOrder(applyFilters(supabase.from(table).select(select), filters), sort, limit);
      if (error) throw error;
      return data;
    },
    get: async (id) => {
      const { data, error } = await supabase.from(table).select(select).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (record) => {
      const { data, error } = await supabase.from(table).insert(record).select(select).single();
      if (error) throw error;
      return data;
    },
    update: async (id, record) => {
      const { data, error } = await supabase.from(table).update(record).eq('id', id).select(select).single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

export const Job = buildEntity('jobs', 'created_at');
export const Project = buildEntity('projects', 'created_at');
export const Application = buildEntity('applications', 'created_at');
export const JobInvitation = buildEntity('job_invitations', 'sent_at');
export const SubscriptionOrder = buildEntity('subscription_orders', 'created_at');

export const Artist = buildEntity('artists', 'created_at');
export const Backer = buildEntity('backers', 'created_at');
export const ProjectOwner = buildEntity('project_owners', 'created_at');
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
export const RolePermission = buildEntity('role_permissions', 'created_at');
export const AuditLog = buildEntity('audit_logs', 'created_at');
export const TickerEntry = buildEntity('ticker_entries', 'created_at');
export const SubscriptionPackage = buildEntity('subscription_packages', 'created_at');
export const Subscription = buildEntity('subscriptions', 'created_at');
export const Note = buildEntity('notes', 'created_at');
export const SavedProject = buildEntity('saved_projects', 'created_at');
export const Assignment = buildEntity('assignments', 'created_at');
export const Creator = buildEntity('creators', 'created_at');
export const Translation = buildEntity('translations', 'created_at');
export const SystemSetting = buildEntity('system_settings', 'created_at');
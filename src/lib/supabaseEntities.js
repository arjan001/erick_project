/**
 * Entity access layer — Studio22
 *
 * Previously backed by Supabase; now delegates to the Base44 SDK
 * (base44.entities) so the whole app reads/writes the Base44 database.
 * The exported names and method shapes (list / filter / get / create /
 * update / delete) are preserved so existing pages need no changes.
 *
 * Supabase will be wired back in later; until then this file is the single
 * seam that points the data layer at Base44.
 */
import { base44 } from '@/api/base44Client';

/**
 * Build a thin wrapper around a Base44 entity that matches the legacy
 * Supabase-style call signature used across the app.
 *
 * Legacy signature            -> Base44 signature
 *   list(sort, limit, cols)       list(sort, limit, offset?, fields?)
 *   filter(filters, sort, limit) filter(filters, sort?, limit?, fields?)
 *   get(id)                       get(id)
 *   create(data)                  create(data)
 *   update(id, data)              update(id, data)
 *   delete(id) -> true            delete(id) -> { success }
 *
 * The legacy `columns` argument (a select string) is dropped — Base44
 * returns full records and no caller relies on column projection.
 */
function buildEntity(name) {
  const entity = base44.entities[name];

  return {
    list: (sort, limit) => entity.list(sort, limit),
    filter: (filters, sort, limit) => entity.filter(filters, sort, limit),
    get: (id) => entity.get(id),
    create: (data) => entity.create(data),
    update: (id, data) => entity.update(id, data),
    delete: async (id) => {
      await entity.delete(id);
      return true;
    },
  };
}

// Roles & Permissions Entities
export const Permission = buildEntity('Permission');
export const Role = buildEntity('Role');
export const RolePermission = buildEntity('RolePermission');
export const UserRole = buildEntity('UserRole');

export const Job = buildEntity('Job');
export const Project = buildEntity('Project');
export const Application = buildEntity('Application');
export const JobInvitation = buildEntity('JobInvitation');
export const SubscriptionOrder = buildEntity('SubscriptionOrder');

export const Artist = buildEntity('Artist');
export const Backer = buildEntity('Backer');
export const ProjectOwner = buildEntity('ProjectOwner');
export const Client = buildEntity('Client');
export const Message = buildEntity('Message');
export const Notification = buildEntity('Notification');
export const Connection = buildEntity('Connection');
export const PortfolioClip = buildEntity('PortfolioClip');
export const Endorsement = buildEntity('Endorsement');
export const Testimonial = buildEntity('Testimonial');
export const Deal = buildEntity('Deal');
export const Partner = buildEntity('Partner');
export const InvestmentTier = buildEntity('InvestmentTier');
export const ProjectUpdate = buildEntity('ProjectUpdate');
export const BackedProject = buildEntity('BackedProject');
export const ConnectsTransaction = buildEntity('ConnectsTransaction');
export const AuditLog = buildEntity('AuditLog');
export const TickerEntry = buildEntity('TickerEntry');
export const ContentCategory = buildEntity('ContentCategory');
export const FeaturedWork = buildEntity('FeaturedWork');
export const SuccessStory = buildEntity('SuccessStory');
export const RecentProject = buildEntity('RecentProject');
export const Article = buildEntity('Article');
export const SubscriptionPackage = buildEntity('SubscriptionPackage');
export const Subscription = buildEntity('Subscription');
export const Note = buildEntity('Note');
export const SavedProject = buildEntity('SavedProject');
export const Assignment = buildEntity('Assignment');
export const Creator = buildEntity('Creator');
export const Translation = buildEntity('Translation');
export const SystemSetting = buildEntity('SystemSetting');
export const Team = buildEntity('Team');
export const TeamMember = buildEntity('TeamMember');
export const Invite = buildEntity('Invite');
export const BillingInfo = buildEntity('BillingInfo');
export const Invoice = buildEntity('Invoice');
export const SecuritySettings = buildEntity('SecuritySettings');
export const ActiveSession = buildEntity('ActiveSession');
export const SupportTicket = buildEntity('SupportTicket');
export const TicketResponse = buildEntity('TicketResponse');

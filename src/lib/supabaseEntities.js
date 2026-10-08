/**
 * Entity access layer — SmartGigs Kenya
 *
 * This file provides a Supabase-style API using actual Supabase client.
 * All data operations now go through Supabase database.
 *
 * Method signatures:
 *   list(sort, limit)               - List all records
 *   filter(filters, sort, limit)   - Filter records
 *   get(id)                        - Get single record by ID
 *   create(data)                   - Create new record
 *   update(id, data)               - Update existing record
 *   delete(id)                     - Delete record
 */
import { supabase } from '@/lib/supabase';

/**
 * Build a Supabase entity wrapper with consistent API
 */
function buildEntity(tableName) {
  return {
    list: async (sort = '-created_at', limit = 50) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(sort.replace('-', ''), { ascending: !sort.startsWith('-') })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    filter: async (filters = {}, sort = '-created_at', limit = 50) => {
      let query = supabase.from(tableName).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query
        .order(sort.replace('-', ''), { ascending: !sort.startsWith('-') })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    get: async (id) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (data) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    update: async (id, data) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

// Roles & Permissions Entities
export const Permission = buildEntity('permissions');
export const Role = buildEntity('roles');
export const RolePermission = buildEntity('role_permissions');
export const UserRole = buildEntity('user_roles');

export const Job = buildEntity('jobs');
export const Project = buildEntity('projects');
export const Application = buildEntity('applications');
export const JobInvitation = buildEntity('job_invitations');
export const SubscriptionOrder = buildEntity('subscription_orders');

export const Artist = buildEntity('creators');
export const Backer = buildEntity('backers');
export const ProjectOwner = buildEntity('clients');
export const Client = buildEntity('clients');
export const Message = buildEntity('messages');
export const Notification = buildEntity('notifications');
export const Connection = buildEntity('connections');
export const PortfolioClip = buildEntity('portfolio_clips');
export const Endorsement = buildEntity('endorsements');
export const Testimonial = buildEntity('testimonials');
export const Deal = buildEntity('deals');
export const Partner = buildEntity('partners');
export const InvestmentTier = buildEntity('investment_tiers');
export const ProjectUpdate = buildEntity('project_updates');
export const BackedProject = buildEntity('backed_projects');
export const ConnectsTransaction = buildEntity('connects_transactions');
export const AuditLog = buildEntity('audit_logs');
export const TickerEntry = buildEntity('ticker_entries');
export const ContentCategory = buildEntity('content_categories');
export const FeaturedWork = buildEntity('featured_works');
export const SuccessStory = buildEntity('success_stories');
export const RecentProject = buildEntity('recent_projects');
export const Article = buildEntity('articles');
export const SubscriptionPackage = buildEntity('subscription_packages');
export const Subscription = buildEntity('subscriptions');
export const Note = buildEntity('notes');
export const SavedProject = buildEntity('saved_projects');
export const Assignment = buildEntity('assignments');
export const Creator = buildEntity('creators');
export const Translation = buildEntity('translations');
export const SystemSetting = buildEntity('system_settings');
export const Team = buildEntity('teams');
export const TeamMember = buildEntity('team_members');
export const Invite = buildEntity('invites');
export const BillingInfo = buildEntity('billing_info');
export const Invoice = buildEntity('invoices');
export const SecuritySettings = buildEntity('security_settings');
export const ActiveSession = buildEntity('active_sessions');
export const SupportTicket = buildEntity('support_tickets');
export const TicketResponse = buildEntity('ticket_responses');
export const PaymentSettings = buildEntity('payment_settings');
export const MpesaTransaction = buildEntity('mpesa_transactions');
export const MpesaC2bCallback = buildEntity('mpesa_c2b_callbacks');
export const MolliePayment = buildEntity('mollie_payments');
export const ShopProduct = buildEntity('shop_products');
export const ShopOrder = buildEntity('shop_orders');
export const ShopOrderItem = buildEntity('shop_order_items');
export const CardPayment = buildEntity('card_payments');
export const TeamPayment = buildEntity('team_payments');
export const Popup = buildEntity('popups');
export const VoiceRecording = buildEntity('voice_recordings');
export const FeaturedCreative = buildEntity('featured_creatives');
export const FeaturedBrand = buildEntity('featured_brands');
export const ShopAuction = buildEntity('shop_auctions');
export const AuctionBid = buildEntity('auction_bids');
export const Wishlist = buildEntity('wishlist');
export const ShopSettings = buildEntity('shop_settings');
export const Cart = buildEntity('cart');
export const UserSession = buildEntity('user_sessions');
export const JobView = buildEntity('job_views');
export const ProjectView = buildEntity('project_views');
export const FeatureFlag = buildEntity('feature_flags');
export const FileUploadSettings = buildEntity('file_upload_settings');
export const AuthProvider = buildEntity('auth_providers');
export const RateLimit = buildEntity('rate_limits');
export const CsrfToken = buildEntity('csrf_tokens');
export const StorageBucketConfig = buildEntity('storage_buckets_config');

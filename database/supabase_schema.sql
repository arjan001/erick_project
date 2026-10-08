-- SmartGigs Kenya - Complete Supabase Database Schema
-- This file contains all necessary tables for the SmartGigs Kenya platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AUTH & USER MANAGEMENT
-- ============================================================

-- Users table (linked to Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'creator', -- creator, client, team, backer, admin
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PROFILES
-- ============================================================

-- Creators/Artists Profile
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  bio TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  profile_image TEXT,
  cover_image TEXT,
  skills TEXT[], -- Array of skills
  disciplines TEXT[], -- Acting, Voiceover, Directing, etc.
  height_cms INTEGER,
  weight_kg INTEGER,
  eye_color TEXT,
  hair_color TEXT,
  skin_tone TEXT,
  date_of_birth DATE,
  gender TEXT,
  languages TEXT[],
  experience_years INTEGER,
  portfolio_urls JSONB,
  video_reel_url TEXT,
  social_media JSONB,
  -- Additional detailed profile fields
  profession TEXT,
  age_range TEXT,
  ethnicity TEXT,
  build TEXT,
  -- Credits
  film_credits TEXT[],
  commercial_credits TEXT[],
  -- Education & Training
  education TEXT[],
  -- Representation
  agent_name TEXT,
  agent_email TEXT,
  -- Union Membership
  union_memberships TEXT[],
  -- License & Passport
  has_driver_license BOOLEAN DEFAULT false,
  has_passport BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Profile
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  logo_url TEXT,
  cover_image TEXT,
  specialties TEXT[],
  team_size INTEGER,
  portfolio_urls JSONB,
  social_media JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  featured BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT, -- Director, Producer, etc.
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Clients/Project Owners Profile
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  bio TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  logo_url TEXT,
  cover_image TEXT,
  company_type TEXT, -- Production company, casting agency, etc.
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  social_media JSONB,
  featured BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backers/Investors Profile
CREATE TABLE IF NOT EXISTS public.backers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  bio TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  logo_url TEXT,
  investment_interests TEXT[],
  investment_range TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  social_media JSONB,
  bank_accounts JSONB, -- Array of bank account objects
  organization_name TEXT,
  website TEXT,
  linkedin TEXT,
  instagram TEXT,
  twitter TEXT,
  youtube TEXT,
  email_notifications BOOLEAN DEFAULT true,
  deal_alerts BOOLEAN DEFAULT true,
  profile_public BOOLEAN DEFAULT true,
  total_invested NUMERIC DEFAULT 0,
  investment_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  project_type TEXT, -- Film, TV, Theater, Commercial, etc.
  genre TEXT,
  production_company TEXT,
  budget_range TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'development', -- development, pre_production, production, post_production, completed
  cover_image TEXT,
  images TEXT[],
  video_url TEXT,
  team_size INTEGER,
  social_media JSONB,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Team Members
CREATE TABLE IF NOT EXISTS public.project_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Backers
CREATE TABLE IF NOT EXISTS public.project_backers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  backer_id UUID REFERENCES public.backers(id) ON DELETE CASCADE,
  backer_email TEXT,
  project_title TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'KES',
  investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, completed, withdrawn
  expected_roi NUMERIC,
  notes TEXT,
  project_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment Deals
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backer_id UUID REFERENCES public.backers(id) ON DELETE CASCADE,
  backer_email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  counterparty TEXT,
  status TEXT DEFAULT 'pending', -- pending, signed, rejected, completed
  start_date DATE,
  end_date DATE,
  document_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment Tiers
CREATE TABLE IF NOT EXISTS public.investment_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  min_investment NUMERIC NOT NULL,
  max_investment NUMERIC,
  roi_percentage NUMERIC,
  benefits TEXT[],
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Updates
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backer_id UUID REFERENCES public.backers(id) ON DELETE CASCADE,
  backer_email TEXT,
  project_id UUID,
  project_title TEXT,
  title TEXT NOT NULL,
  content TEXT,
  update_type TEXT DEFAULT 'progress', -- progress, milestone, announcement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- JOBS & CASTING CALLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  job_type TEXT, -- Acting, Voiceover, Crew, etc.
  category TEXT,
  discipline TEXT[],
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  remote BOOLEAN DEFAULT false,
  salary_range TEXT,
  rate TEXT,
  rate_type TEXT, -- hourly, daily, project, negotiable
  requirements TEXT[],
  responsibilities TEXT[],
  audition_date DATE,
  audition_location TEXT,
  submission_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open', -- open, closed, filled
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, viewed, shortlisted, rejected, hired
  cover_letter TEXT,
  media_urls JSONB,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Featured Jobs (admin selected)
CREATE TABLE IF NOT EXISTS public.featured_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  featured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_id)
);

-- ============================================================
-- MESSAGING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID REFERENCES public.users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2, job_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SHOP & COMMERCE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image TEXT,
  images TEXT[],
  category TEXT, -- Wardrobe, Equipment, Merchandise, Collectibles, Experiences
  sku TEXT UNIQUE,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  currency TEXT DEFAULT 'KES',
  stock INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive, out_of_stock
  featured BOOLEAN DEFAULT false,
  auction_enabled BOOLEAN DEFAULT false,
  auction_type TEXT, -- time, count
  auction_duration_hours INTEGER,
  auction_end_time TIMESTAMP WITH TIME ZONE,
  auction_target_count INTEGER,
  auction_participants INTEGER DEFAULT 0,
  auction_status TEXT DEFAULT 'open', -- open, completed, cancelled
  auction_winner_email TEXT,
  fulfillment_type TEXT DEFAULT 'physical', -- physical, digital
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT,
  city TEXT,
  county TEXT,
  delivery_notes TEXT,
  subtotal NUMERIC NOT NULL,
  shipping_cost NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  payment_method TEXT, -- mpesa, card
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
  order_status TEXT DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  mpesa_receipt TEXT,
  checkout_request_id TEXT,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  is_auction_claim BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.card_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.shop_orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cardholder_name TEXT NOT NULL,
  card_brand TEXT NOT NULL, -- Visa, Mastercard, etc.
  card_last4 TEXT NOT NULL,
  exp_month TEXT NOT NULL,
  exp_year TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending', -- pending, success, failed
  transaction_id TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enable_mpesa BOOLEAN DEFAULT true,
  enable_card BOOLEAN DEFAULT false,
  shipping_threshold NUMERIC DEFAULT 5000,
  shipping_cost NUMERIC DEFAULT 500,
  auto_confirm_orders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  partnership_type TEXT DEFAULT 'sponsor', -- sponsor, government, media, production, technology
  status TEXT DEFAULT 'active', -- active, inactive, pending
  featured BOOLEAN DEFAULT false,
  started_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- WISHLIST
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CMS & CONTENT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cover_image TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- NEWSLETTER & MAILING LIST
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mailing_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT, -- footer, signup, etc.
  status TEXT DEFAULT 'active', -- active, unsubscribed, bounced
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TICKER / MARQUEE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ticker_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ROLES & PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_key TEXT UNIQUE NOT NULL,
  role_name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_key TEXT UNIQUE NOT NULL,
  permission_name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- ============================================================
-- TICKETS / SUPPORT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reply_to_id UUID REFERENCES public.ticket_responses(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- JOB INVITATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, expired
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ENDORSEMENTS & TESTIMONIALS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endorser_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  relationship TEXT,
  skill TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image TEXT,
  video_url TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PAYMENT SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mpesa_consumer_key TEXT,
  mpesa_consumer_secret TEXT,
  mpesa_passkey TEXT,
  mpesa_shortcode TEXT,
  mpesa_environment TEXT DEFAULT 'sandbox',
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  mollie_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price_monthly NUMERIC,
  price_yearly NUMERIC,
  currency TEXT DEFAULT 'KES',
  features JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.subscription_packages(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  billing_cycle TEXT, -- monthly, yearly
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SUCCESS STORIES & RECENT PROJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image TEXT,
  video_url TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recent_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  featured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Creators
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON public.creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_slug ON public.creators(slug);
CREATE INDEX IF NOT EXISTS idx_creators_location ON public.creators(city, country);
CREATE INDEX IF NOT EXISTS idx_creators_featured ON public.creators(featured) WHERE featured = true;

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON public.teams(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON public.clients(slug);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured) WHERE featured = true;

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON public.jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(city, country);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(featured) WHERE featured = true;

-- Job Applications
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- Shop Products
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON public.shop_products(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON public.shop_products(status);
CREATE INDEX IF NOT EXISTS idx_shop_products_featured ON public.shop_products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_shop_products_auction ON public.shop_products(auction_enabled) WHERE auction_enabled = true;

-- Shop Orders
CREATE INDEX IF NOT EXISTS idx_shop_orders_user_id ON public.shop_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON public.shop_orders(payment_status, order_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_number ON public.shop_orders(order_number);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Roles & Permissions
CREATE INDEX IF NOT EXISTS idx_roles_key ON public.roles(role_key);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON public.permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Job Invitations
CREATE INDEX IF NOT EXISTS idx_job_invitations_job_id ON public.job_invitations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_creator_id ON public.job_invitations(creator_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_team_id ON public.job_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_status ON public.job_invitations(status);

-- Endorsements
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON public.endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_recipient ON public.endorsements(recipient_id);

-- Testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(published);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_creators_updated_at BEFORE UPDATE ON public.creators FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_backers_updated_at BEFORE UPDATE ON public.backers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_project_backers_updated_at BEFORE UPDATE ON public.project_backers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_investment_tiers_updated_at BEFORE UPDATE ON public.investment_tiers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_project_updates_updated_at BEFORE UPDATE ON public.project_updates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_shop_products_updated_at BEFORE UPDATE ON public.shop_products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_shop_orders_updated_at BEFORE UPDATE ON public.shop_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_cms_pages_updated_at BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_subscription_packages_updated_at BEFORE UPDATE ON public.subscription_packages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_success_stories_updated_at BEFORE UPDATE ON public.success_stories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_ticker_items_updated_at BEFORE UPDATE ON public.ticker_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_job_invitations_updated_at BEFORE UPDATE ON public.job_invitations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_endorsements_updated_at BEFORE UPDATE ON public.endorsements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailing_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on security requirements)
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Creators can view own profile" ON public.creators FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view creators" ON public.creators FOR SELECT USING (true);
CREATE POLICY "Creators can update own profile" ON public.creators FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Teams can view own profile" ON public.teams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Teams can update own profile" ON public.teams FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Clients can view own profile" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Clients can update own profile" ON public.clients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Backers can view own profile" ON public.backers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view backers" ON public.backers FOR SELECT USING (true);
CREATE POLICY "Backers can update own profile" ON public.backers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Backers can view own investments" ON public.project_backers FOR SELECT USING (backer_id IN (SELECT id FROM public.backers WHERE user_id = auth.uid()));
CREATE POLICY "Backers can manage own investments" ON public.project_backers FOR ALL USING (backer_id IN (SELECT id FROM public.backers WHERE user_id = auth.uid()));

CREATE POLICY "Backers can view own deals" ON public.deals FOR SELECT USING (backer_id IN (SELECT id FROM public.backers WHERE user_id = auth.uid()));
CREATE POLICY "Backers can manage own deals" ON public.deals FOR ALL USING (backer_id IN (SELECT id FROM public.backers WHERE user_id = auth.uid()));

CREATE POLICY "Public can view investment tiers" ON public.investment_tiers FOR SELECT USING (true);
CREATE POLICY "Admins can manage investment tiers" ON public.investment_tiers FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Backers can view own project updates" ON public.project_updates FOR SELECT USING (backer_id IN (SELECT id FROM public.backers WHERE user_id = auth.uid()));
CREATE POLICY "Backers can manage own project updates" ON public.project_updates FOR ALL USING (backer_id IN (SELECT id FROM public.backers WHERE user_id = auth.uid()));

CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Clients can manage own projects" ON public.projects FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.clients WHERE id = client_id));

CREATE POLICY "Public can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Clients can manage own jobs" ON public.jobs FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.clients WHERE id = client_id));

CREATE POLICY "Users can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public can view products" ON public.shop_products FOR SELECT USING (true);
CREATE POLICY "Users can view own orders" ON public.shop_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.shop_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Roles & Permissions RLS
CREATE POLICY "Public can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Admin can manage roles" ON public.roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id IN (
    SELECT id FROM public.roles WHERE role_key = 'admin'
  ))
);
CREATE POLICY "Public can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage user roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id IN (
    SELECT id FROM public.roles WHERE role_key = 'admin'
  ))
);

-- Support Tickets RLS
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all tickets" ON public.support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id IN (
    SELECT id FROM public.roles WHERE role_key = 'admin'
  ))
);

-- Notifications RLS
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (recipient_email = (SELECT email FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (recipient_email = (SELECT email FROM public.users WHERE id = auth.uid()));

-- Job Invitations RLS
CREATE POLICY "Users can view own invitations" ON public.job_invitations FOR SELECT USING (
  creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()) OR
  team_id IN (SELECT id FROM public.teams WHERE user_id = auth.uid())
);
CREATE POLICY "Users can respond to invitations" ON public.job_invitations FOR UPDATE USING (
  creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()) OR
  team_id IN (SELECT id FROM public.teams WHERE user_id = auth.uid())
);

-- Endorsements RLS
CREATE POLICY "Public can view endorsements" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "Users can delete own endorsements" ON public.endorsements FOR DELETE USING (auth.uid() = endorser_id);

-- Testimonials RLS
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT USING (published = true);
CREATE POLICY "Users can view own testimonials" ON public.testimonials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create testimonials" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own testimonials" ON public.testimonials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own testimonials" ON public.testimonials FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DYNAMIC POPUPS / MODALS
-- ============================================================

-- Popups/Modals table for newsletter, announcements, promotional content
CREATE TABLE IF NOT EXISTS public.popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  video_url TEXT,
  video_source TEXT DEFAULT 'upload', -- upload, youtube, vimeo, external
  video_embed_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  popup_type TEXT DEFAULT 'announcement', -- announcement, newsletter, promotion, trailer
  display_type TEXT DEFAULT 'modal', -- modal, banner, slide-in
  position TEXT DEFAULT 'center', -- center, top, bottom, left, right
  target_audience TEXT[], -- all, artists, clients, teams, backers
  show_on_pages TEXT[], -- all, home, about, shop, dashboard
  schedule_start TIMESTAMP WITH TIME ZONE,
  schedule_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  show_once_per_session BOOLEAN DEFAULT true,
  show_after_seconds INTEGER DEFAULT 0,
  max_impressions INTEGER,
  current_impressions INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for popups
CREATE INDEX IF NOT EXISTS idx_popups_is_active ON public.popups(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_popups_schedule ON public.popups(schedule_start, schedule_end) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_popups_type ON public.popups(popup_type);

-- Voice recordings table for artist voice-over submissions
CREATE TABLE IF NOT EXISTS public.voice_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  audio_duration INTEGER, -- in seconds
  file_size INTEGER, -- in bytes
  format TEXT, -- mp3, wav, m4a
  recording_type TEXT DEFAULT 'voiceover', -- voiceover, audition, demo
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for voice recordings
CREATE INDEX IF NOT EXISTS idx_voice_recordings_user ON public.voice_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_creator ON public.voice_recordings(creator_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_public ON public.voice_recordings(is_public) WHERE is_public = true;

-- Popups RLS
CREATE POLICY "Public can view active popups" ON public.popups FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage popups" ON public.popups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id IN (
    SELECT id FROM public.roles WHERE role_key = 'admin'
  ))
);

-- Voice Recordings RLS
CREATE POLICY "Users can view own recordings" ON public.voice_recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public recordings" ON public.voice_recordings FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create recordings" ON public.voice_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recordings" ON public.voice_recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recordings" ON public.voice_recordings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all recordings" ON public.voice_recordings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role_id IN (
    SELECT id FROM public.roles WHERE role_key = 'admin'
  ))
);

-- ============================================================
-- END OF SCHEMA
-- ============================================================

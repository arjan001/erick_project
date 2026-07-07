-- Studio22 — Supabase migration: full module coverage
-- Run this in your Supabase project's SQL editor AFTER SUPABASE_MIGRATION.sql.
-- Adds/replaces tables so every app module (Artists, Backers, Messages,
-- Notifications, Connections, Portfolio, Endorsements/Testimonials, Backer
-- CRM, Subscriptions, Notes, Saved Content, Assignments, Creators,
-- Translations, System Settings) reads and writes Supabase directly,
-- matching the app's email/ID-keyed entity shapes (not the older FK-based
-- versions in DATABASE_SCHEMA.sql, which this app does not populate).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Replace any older FK-based versions of these tables with the shape the app actually uses
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS portfolio_clips CASCADE;
DROP TABLE IF EXISTS endorsements CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS backed_projects CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS backers CASCADE;

-- ============================================
-- ARTISTS
-- ============================================
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50),
    roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    secondary_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_experience JSONB DEFAULT '[]',
    based_in_city VARCHAR(255),
    based_in_country VARCHAR(255),
    languages_spoken TEXT[] DEFAULT ARRAY[]::TEXT[],
    portfolio_clips TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_questionnaire_response JSONB,
    website VARCHAR(255),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    youtube VARCHAR(255),
    vimeo VARCHAR(255),
    imdb VARCHAR(255),
    linkedin VARCHAR(255),
    profile_photo_url TEXT,
    bio TEXT,
    email_notifications BOOLEAN DEFAULT TRUE,
    project_alerts BOOLEAN DEFAULT TRUE,
    profile_public BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    approved_date DATE,
    connects_balance NUMERIC DEFAULT 5,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_artists_email ON artists(email);
CREATE INDEX idx_artists_status ON artists(status);

-- ============================================
-- BACKERS
-- ============================================
CREATE TABLE backers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) UNIQUE NOT NULL,
    website VARCHAR(255),
    backing_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    locations TEXT[] DEFAULT ARRAY[]::TEXT[],
    city VARCHAR(100),
    country VARCHAR(100),
    bio TEXT,
    logo_url TEXT,
    linkedin VARCHAR(255),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    youtube VARCHAR(255),
    email_notifications BOOLEAN DEFAULT TRUE,
    deal_alerts BOOLEAN DEFAULT TRUE,
    profile_public BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_backers_contact_email ON backers(contact_email);
CREATE INDEX idx_backers_status ON backers(status);
CREATE INDEX idx_backers_city ON backers(city);
CREATE INDEX idx_backers_country ON backers(country);

-- ============================================
-- PROJECT OWNERS
-- ============================================
CREATE TABLE IF NOT EXISTS project_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    profile_photo_url TEXT,
    bio TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    projects_submitted TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_owners_email ON project_owners(email);

-- ============================================
-- MESSAGES (flat, conversation_id-keyed — matches Message entity)
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    text TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    is_archived BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_email ON messages(sender_email);
CREATE INDEX idx_messages_recipient_email ON messages(recipient_email);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    sender_name VARCHAR(255),
    sender_avatar TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('connection_request', 'job_invitation', 'message', 'application_update', 'project_update')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    action_required BOOLEAN DEFAULT FALSE,
    action_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- CONNECTIONS
-- ============================================
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_email VARCHAR(255) NOT NULL,
    requester_type VARCHAR(50) CHECK (requester_type IN ('artist', 'team', 'backer', 'client')),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('artist', 'team', 'backer', 'client')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_connections_requester_email ON connections(requester_email);
CREATE INDEX idx_connections_recipient_email ON connections(recipient_email);
CREATE INDEX idx_connections_status ON connections(status);

-- ============================================
-- PORTFOLIO CLIPS
-- ============================================
CREATE TABLE portfolio_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by_type VARCHAR(20) CHECK (uploaded_by_type IN ('artist', 'team')),
    uploaded_by_id VARCHAR(255) NOT NULL,
    original_video_url TEXT NOT NULL,
    trimmed_video_url TEXT,
    trim_start_time NUMERIC,
    duration NUMERIC,
    thumbnail_url TEXT,
    title VARCHAR(255),
    description TEXT,
    project_type VARCHAR(50),
    visual_style_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    no_logos_agreement BOOLEAN DEFAULT FALSE,
    portfolio_usage_agreement BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_for_visual_direction BOOLEAN DEFAULT FALSE,
    view_count NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_portfolio_clips_uploaded_by_id ON portfolio_clips(uploaded_by_id);
CREATE INDEX idx_portfolio_clips_status ON portfolio_clips(status);

-- ============================================
-- ENDORSEMENTS
-- ============================================
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_email VARCHAR(255) NOT NULL,
    endorser_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('artist', 'team')),
    skill VARCHAR(100) NOT NULL,
    rating NUMERIC CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_endorsements_recipient_email ON endorsements(recipient_email);

-- ============================================
-- TESTIMONIALS
-- ============================================
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_email VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('artist', 'team')),
    content TEXT NOT NULL,
    project_name VARCHAR(255),
    collaboration_type VARCHAR(50) DEFAULT 'worked_together',
    rating NUMERIC CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_testimonials_recipient_email ON testimonials(recipient_email);

-- ============================================
-- BACKER CRM: DEALS / PARTNERS / INVESTMENT TIERS / PROJECT UPDATES / BACKED PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_email VARCHAR(255) NOT NULL,
    backer_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC,
    counterparty VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    signature TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deals_backer_email ON deals(backer_email);

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_email VARCHAR(255) NOT NULL,
    backer_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(255),
    notes TEXT,
    partnership_type VARCHAR(50) DEFAULT 'strategic',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_partners_backer_email ON partners(backer_email);

CREATE TABLE IF NOT EXISTS investment_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_email VARCHAR(255) NOT NULL,
    backer_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    min_investment NUMERIC,
    max_investment NUMERIC,
    roi_percentage NUMERIC,
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    color VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_investment_tiers_backer_email ON investment_tiers(backer_email);

CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_email VARCHAR(255) NOT NULL,
    backer_id VARCHAR(255),
    project_id VARCHAR(255),
    project_title VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    update_type VARCHAR(50) DEFAULT 'progress' CHECK (update_type IN ('progress', 'milestone', 'announcement', 'financial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_updates_backer_email ON project_updates(backer_email);

CREATE TABLE backed_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_email VARCHAR(255) NOT NULL,
    backer_id VARCHAR(255),
    project_id VARCHAR(255),
    project_title VARCHAR(255) NOT NULL,
    project_category VARCHAR(255),
    investment_amount NUMERIC NOT NULL,
    expected_roi NUMERIC,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    notes TEXT,
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_backed_projects_backer_email ON backed_projects(backer_email);

-- ============================================
-- CONNECTS TRANSACTIONS / ROLE PERMISSIONS / AUDIT LOGS / TICKER
-- ============================================
CREATE TABLE IF NOT EXISTS connects_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_email VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    reason VARCHAR(255) NOT NULL,
    balance_after NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_connects_transactions_artist_email ON connects_transactions(artist_email);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id VARCHAR(100) UNIQUE NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);

CREATE TABLE IF NOT EXISTS ticker_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text VARCHAR(500) NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SUBSCRIPTIONS & PACKAGES
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    job_applications_limit NUMERIC,
    message_limit NUMERIC,
    connects_included NUMERIC DEFAULT 0,
    featured_listing BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    analytics_access BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    display_order NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    package_id VARCHAR(255) NOT NULL,
    package_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    started_at TIMESTAMP WITH TIME ZONE,
    renews_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    upgraded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);

-- ============================================
-- NOTES / SAVED PROJECTS / ASSIGNMENTS / CREATORS / TRANSLATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_email VARCHAR(255),
    title VARCHAR(255),
    content TEXT NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow',
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_owner_email ON notes(owner_email);

CREATE TABLE IF NOT EXISTS saved_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(50) NOT NULL CHECK (section IN ('inproduction', 'released', 'collections', 'creators', 'recent', 'services')),
    title VARCHAR(255),
    description TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_saved_projects_section ON saved_projects(section);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    assigned_type VARCHAR(20) CHECK (assigned_type IN ('artist', 'team')),
    assigned_id VARCHAR(255) NOT NULL,
    role_in_project VARCHAR(255),
    assignment_status VARCHAR(50) DEFAULT 'proposed' CHECK (assignment_status IN ('proposed', 'intro_requested', 'confirmed', 'in_progress', 'completed', 'declined')),
    intro_call_requested BOOLEAN DEFAULT FALSE,
    intro_call_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assignments_project_id ON assignments(project_id);

CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('freelance', 'studio', 'agency', 'team', 'collective')),
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    logo_url TEXT,
    website VARCHAR(255),
    awards_count NUMERIC DEFAULT 0,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    en TEXT NOT NULL,
    nl TEXT,
    es TEXT,
    category VARCHAR(50) CHECK (category IN ('navigation', 'homepage', 'services', 'intake', 'applications', 'admin', 'common')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SYSTEM SETTINGS (single-row app config, distinct from key/value admin_settings)
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name VARCHAR(255),
    site_description TEXT,
    site_url VARCHAR(255),
    contact_email VARCHAR(255),
    support_email VARCHAR(255),
    allow_registration BOOLEAN DEFAULT TRUE,
    require_email_verification BOOLEAN DEFAULT TRUE,
    default_user_role VARCHAR(50) DEFAULT 'artist',
    max_portfolio_clips NUMERIC DEFAULT 20,
    max_team_members NUMERIC DEFAULT 50,
    auto_moderate_content BOOLEAN DEFAULT TRUE,
    require_approval_for_projects BOOLEAN DEFAULT FALSE,
    allow_guest_viewing BOOLEAN DEFAULT TRUE,
    max_file_size_mb NUMERIC DEFAULT 50,
    allowed_file_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    notification_retention_days NUMERIC DEFAULT 90,
    session_timeout_minutes NUMERIC DEFAULT 30,
    max_login_attempts NUMERIC DEFAULT 5,
    lockout_duration_minutes NUMERIC DEFAULT 15,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    password_min_length NUMERIC DEFAULT 8,
    password_require_special BOOLEAN DEFAULT TRUE,
    password_require_number BOOLEAN DEFAULT TRUE,
    api_rate_limit NUMERIC DEFAULT 100,
    upload_rate_limit NUMERIC DEFAULT 10,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    enable_analytics BOOLEAN DEFAULT TRUE,
    analytics_retention_days NUMERIC DEFAULT 365,
    enable_subscriptions BOOLEAN DEFAULT TRUE,
    free_trial_days NUMERIC DEFAULT 14,
    subscription_currency VARCHAR(10) DEFAULT 'USD',
    subscription_billing_cycle VARCHAR(20) DEFAULT 'monthly',
    subscription_grace_period_days NUMERIC DEFAULT 7,
    subscription_prorate_upgrades BOOLEAN DEFAULT TRUE,
    subscription_auto_renew BOOLEAN DEFAULT TRUE,
    email_provider VARCHAR(20) DEFAULT 'brevo',
    email_sender_address VARCHAR(255),
    email_sender_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REALTIME (so Messages/Notifications/Connections live-update in the app)
-- ============================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE connections;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (app handles its own auth; allow public full access
-- to match the pattern already used for jobs/projects/applications/teams)
-- ============================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'artists','backers','project_owners','messages','notifications','connections',
    'portfolio_clips','endorsements','testimonials','deals','partners','investment_tiers',
    'project_updates','backed_projects','connects_transactions','role_permissions',
    'audit_logs','ticker_entries','subscription_packages','subscriptions','notes',
    'saved_projects','assignments','creators','translations','system_settings'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public full access" ON %I', t);
    EXECUTE format('CREATE POLICY "Public full access" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
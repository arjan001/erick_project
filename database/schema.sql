-- Studio22 Production Database Schema
-- PostgreSQL Schema for Production Deployment
-- Version: 2.0
-- Last Updated: July 10, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'artist', 'team', 'client', 'project_owner', 'backer')),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);

-- ============================================
-- ARTISTS
-- ============================================

CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    stage_name VARCHAR(255),
    skills_experience JSONB DEFAULT '[]'::jsonb,
    roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    years_experience INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    admin_approval_status VARCHAR(50) DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    social_media_url TEXT,
    website_url TEXT,
    profile_photo_url TEXT,
    based_in_city VARCHAR(255),
    based_in_country VARCHAR(255),
    bio TEXT,
    instagram TEXT,
    linkedin TEXT,
    twitter TEXT,
    youtube TEXT,
    website TEXT,
    past_clients TEXT[] DEFAULT ARRAY[]::TEXT[],
    project_specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    languages_spoken TEXT[] DEFAULT ARRAY[]::TEXT[],
    countries_worked TEXT[] DEFAULT ARRAY[]::TEXT[],
    visited_countries TEXT[] DEFAULT ARRAY[]::TEXT[],
    email_notifications BOOLEAN DEFAULT TRUE,
    project_alerts BOOLEAN DEFAULT TRUE,
    profile_public BOOLEAN DEFAULT TRUE,
    google_drive_folder_id TEXT,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(50),
    referred_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_approval_status ON artists(admin_approval_status);
CREATE INDEX IF NOT EXISTS idx_artists_availability ON artists(availability_status);
CREATE INDEX IF NOT EXISTS idx_artists_invite_code ON artists(invite_code);

-- ============================================
-- TEAMS
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    team_size INTEGER DEFAULT 1,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    hourly_rate DECIMAL(10, 2),
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    admin_approval_status VARCHAR(50) DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    logo_url TEXT,
    website_url TEXT,
    social_media_url TEXT,
    based_in_city VARCHAR(255),
    based_in_country VARCHAR(255),
    bio TEXT,
    instagram TEXT,
    linkedin TEXT,
    twitter TEXT,
    youtube TEXT,
    website TEXT,
    past_clients TEXT[] DEFAULT ARRAY[]::TEXT[],
    project_specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    languages_spoken TEXT[] DEFAULT ARRAY[]::TEXT[],
    countries_worked TEXT[] DEFAULT ARRAY[]::TEXT[],
    email_notifications BOOLEAN DEFAULT TRUE,
    project_alerts BOOLEAN DEFAULT TRUE,
    profile_public BOOLEAN DEFAULT TRUE,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(50),
    referred_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_email ON teams(email);
CREATE INDEX IF NOT EXISTS idx_teams_approval_status ON teams(admin_approval_status);
CREATE INDEX IF NOT EXISTS idx_teams_availability ON teams(availability_status);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);

-- ============================================
-- TEAM MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- ============================================
-- CLIENTS / PROJECT OWNERS
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    budget_range VARCHAR(100),
    website_url TEXT,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(50),
    referred_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_invite_code ON clients(invite_code);

-- Alias for project_owners (same as clients)
CREATE TABLE IF NOT EXISTS project_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    budget_range VARCHAR(100),
    website_url TEXT,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(50),
    referred_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_owners_user_id ON project_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_project_owners_email ON project_owners(email);
CREATE INDEX IF NOT EXISTS idx_project_owners_invite_code ON project_owners(invite_code);

-- ============================================
-- BACKERS
-- ============================================

CREATE TABLE IF NOT EXISTS backers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    organization_name VARCHAR(255),
    investment_focus TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_invested DECIMAL(15, 2) DEFAULT 0,
    investment_count INTEGER DEFAULT 0,
    website_url TEXT,
    social_media_url TEXT,
    bio TEXT,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(50),
    referred_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backers_user_id ON backers(user_id);
CREATE INDEX IF NOT EXISTS idx_backers_email ON backers(email);
CREATE INDEX IF NOT EXISTS idx_backers_investment_count ON backers(investment_count);
CREATE INDEX IF NOT EXISTS idx_backers_invite_code ON backers(invite_code);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('commercial', 'short_film', 'film', 'music_video', 'documentary', 'funding_coproduction', 'other')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'verified', 'in_progress', 'rejected', 'suspended', 'paused', 'deleted')),
    budget DECIMAL(12, 2),
    budget_range VARCHAR(50),
    budget_custom TEXT,
    location VARCHAR(255),
    location_city VARCHAR(255),
    location_country VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    timeline_start DATE,
    timeline_deadline DATE,
    usage TEXT[] DEFAULT ARRAY[]::TEXT[],
    visual_direction_clips TEXT[] DEFAULT ARRAY[]::TEXT[],
    departments_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
    roles_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
    team_type VARCHAR(50) CHECK (team_type IN ('team', 'solo', 'flexible')),
    payment_type VARCHAR(50) CHECK (payment_type IN ('hourly', 'daily', 'fixed', 'negotiable')),
    hourly_rate DECIMAL(10, 2),
    daily_rate DECIMAL(10, 2),
    fixed_budget DECIMAL(10, 2),
    notes TEXT,
    project_owner_email VARCHAR(255),
    project_owner_name VARCHAR(255),
    project_owner_company VARCHAR(255),
    funding_stage VARCHAR(50),
    seeking_partners TEXT[] DEFAULT ARRAY[]::TEXT[],
    rights_collaboration_notes TEXT,
    open_to_backing BOOLEAN DEFAULT FALSE,
    backing_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    backing_notes TEXT,
    image_url TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    suspension_reason TEXT,
    admin_notes TEXT,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id),
    deletion_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_suspended_at ON projects(suspended_at) WHERE suspended_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- BACKED PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS backed_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backer_id UUID NOT NULL REFERENCES backers(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    investment_amount DECIMAL(15, 2) NOT NULL,
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backed_projects_backer_id ON backed_projects(backer_id);
CREATE INDEX IF NOT EXISTS idx_backed_projects_project_id ON backed_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_backed_projects_status ON backed_projects(status);

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('director', 'cinematographer', 'editor', 'sound_engineer', 'producer', 'actor', 'other')),
    employment_type VARCHAR(50) CHECK (employment_type IN ('fulltime', 'parttime', 'contract', 'freelance', 'day_payment', 'gig')),
    payment_type VARCHAR(50) CHECK (payment_type IN ('hourly', 'daily', 'fixed', 'negotiable')),
    hourly_rate DECIMAL(10, 2),
    daily_rate DECIMAL(10, 2),
    fixed_budget DECIMAL(10, 2),
    budget_range VARCHAR(50),
    location VARCHAR(255),
    duration VARCHAR(50) CHECK (duration IN ('short_term', 'long_term', 'ongoing')),
    is_premium BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('draft', 'pending_approval', 'open', 'closed', 'filled')),
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    application_deadline TIMESTAMP WITH TIME ZONE,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_contact_email ON jobs(contact_email) WHERE contact_email IS NOT NULL;

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    cover_letter TEXT,
    proposed_rate DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT application_applicant_check CHECK (
        (artist_id IS NOT NULL AND team_id IS NULL) OR 
        (artist_id IS NULL AND team_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_artist_id ON applications(artist_id);
CREATE INDEX IF NOT EXISTS idx_applications_team_id ON applications(team_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- ============================================
-- JOB INVITATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS job_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT invitation_recipient_check CHECK (
        (artist_id IS NOT NULL AND team_id IS NULL) OR 
        (artist_id IS NULL AND team_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_job_invitations_job_id ON job_invitations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_artist_id ON job_invitations(artist_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_team_id ON job_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_status ON job_invitations(status);

-- ============================================
-- PORTFOLIO CLIPS
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by_type VARCHAR(20) NOT NULL CHECK (uploaded_by_type IN ('artist', 'team')),
    uploaded_by_id UUID NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50),
    role VARCHAR(100),
    roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    original_video_url TEXT,
    video_embed_url TEXT,
    video_source VARCHAR(50),
    thumbnail_url TEXT,
    project_name VARCHAR(255),
    duration_seconds INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    approved_for_visual_direction BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_owner_check CHECK (
        (artist_id IS NOT NULL AND team_id IS NULL) OR 
        (artist_id IS NULL AND team_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_portfolio_clips_artist_id ON portfolio_clips(artist_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_team_id ON portfolio_clips(team_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_uploaded_by ON portfolio_clips(uploaded_by_type, uploaded_by_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_featured ON portfolio_clips(is_featured);

-- ============================================
-- ENDORSEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    recipient_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT endorsement_recipient_check CHECK (
        (recipient_artist_id IS NOT NULL AND recipient_team_id IS NULL) OR 
        (recipient_artist_id IS NULL AND recipient_team_id IS NOT NULL)
    ),
    CONSTRAINT unique_endorsement UNIQUE (endorser_id, recipient_email, skill)
);

CREATE INDEX IF NOT EXISTS idx_endorsements_endorser_id ON endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_recipient_email ON endorsements(recipient_email);
CREATE INDEX IF NOT EXISTS idx_endorsements_recipient_artist_id ON endorsements(recipient_artist_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_recipient_team_id ON endorsements(recipient_team_id);

-- ============================================
-- TESTIMONIALS
-- ============================================

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    recipient_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT testimonial_recipient_check CHECK (
        (recipient_artist_id IS NOT NULL AND recipient_team_id IS NULL) OR 
        (recipient_artist_id IS NULL AND recipient_team_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_testimonials_author_id ON testimonials(author_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_recipient_email ON testimonials(recipient_email);
CREATE INDEX IF NOT EXISTS idx_testimonials_recipient_artist_id ON testimonials(recipient_artist_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_recipient_team_id ON testimonials(recipient_team_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_project_id ON testimonials(project_id);

-- ============================================
-- CONNECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id),
    CONSTRAINT no_self_connection CHECK (requester_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- ============================================
-- MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
    CONSTRAINT no_self_conversation CHECK (participant_1_id != participant_2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('job_application', 'job_invitation', 'connection_request', 'message', 'endorsement', 'testimonial', 'project_update', 'system', 'subscription', 'payment', 'connects', 'ticket_response', 'job_status')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- BACKING / FUNDING
-- ============================================

CREATE TABLE IF NOT EXISTS backing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    backer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    backing_type VARCHAR(50) NOT NULL CHECK (backing_type IN ('sponsorship', 'investment', 'donation')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backing_project_id ON backing(project_id);
CREATE INDEX IF NOT EXISTS idx_backing_backer_id ON backing(backer_id);
CREATE INDEX IF NOT EXISTS idx_backing_status ON backing(status);

-- ============================================
-- E-COMMERCE SHOP
-- ============================================

CREATE TABLE IF NOT EXISTS shop_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    featured BOOLEAN DEFAULT FALSE,
    sold_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_products_sku ON shop_products(sku);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status);
CREATE INDEX IF NOT EXISTS idx_shop_products_featured ON shop_products(featured);

CREATE TABLE IF NOT EXISTS shop_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
    shipping_address TEXT NOT NULL,
    items_count INTEGER DEFAULT 0,
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_customer_email ON shop_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_status ON shop_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status ON shop_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS shop_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product_id ON shop_order_items(product_id);

CREATE TABLE IF NOT EXISTS shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_settings_key ON shop_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_shop_settings_category ON shop_settings(category);

-- ============================================
-- CMS & SEO
-- ============================================

CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    og_image TEXT,
    custom_head TEXT,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    last_modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);

CREATE TABLE IF NOT EXISTS url_redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_path VARCHAR(500) NOT NULL,
    to_path VARCHAR(500) NOT NULL,
    redirect_type VARCHAR(10) DEFAULT '301' CHECK (redirect_type IN ('301', '302')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_url_redirects_from ON url_redirects(from_path);
CREATE INDEX IF NOT EXISTS idx_url_redirects_status ON url_redirects(status);

-- ============================================
-- CONTENT CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_status ON content_categories(status);

-- ============================================
-- FEATURED WORK
-- ============================================

CREATE TABLE IF NOT EXISTS featured_work (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,
  featured_type VARCHAR(20) DEFAULT 'admin_pick' CHECK (featured_type IN ('admin_pick', 'paid', 'subscription')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order INTEGER DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  portfolio_clip_id UUID REFERENCES portfolio_clips(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_featured_work_status ON featured_work(status);
CREATE INDEX IF NOT EXISTS idx_featured_work_display_order ON featured_work(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_work_project_id ON featured_work(project_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_artist_id ON featured_work(artist_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_portfolio_clip_id ON featured_work(portfolio_clip_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_featured_type ON featured_work(featured_type);

-- ============================================
-- SUCCESS STORIES
-- ============================================

CREATE TABLE IF NOT EXISTS success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  story TEXT NOT NULL,
  testimonial TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  score DECIMAL(3,1),
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON success_stories(status);

-- ============================================
-- RECENT PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS recent_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  studio VARCHAR(255),
  type VARCHAR(100),
  images JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recent_projects_is_active ON recent_projects(is_active);

-- ============================================
-- USER INVITATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('artist', 'team', 'client', 'backer', 'admin')),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);

-- ============================================
-- API KEYS
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    rate_limit INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- ADMIN SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    referrer TEXT,
    landing_page TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON user_sessions(country);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity DESC);

CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    time_on_page_seconds INTEGER,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    page_path TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON analytics_events(occurred_at DESC);

CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    error_type VARCHAR(100),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    page_path TEXT,
    component_name VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs(occurred_at DESC);

CREATE TABLE IF NOT EXISTS subscription_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    plan_name VARCHAR(100),
    plan_tier VARCHAR(50),
    monthly_price DECIMAL(10, 2),
    start_date DATE NOT NULL,
    end_date DATE,
    cancellation_date DATE,
    churn_reason TEXT,
    renewal_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_analytics_user_id ON subscription_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_plan_tier ON subscription_analytics(plan_tier);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_is_active ON subscription_analytics(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_start_date ON subscription_analytics(start_date DESC);

-- ============================================
-- REAL-TIME TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS live_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    current_page TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    country VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_live_users_user_id ON live_users(user_id);
CREATE INDEX IF NOT EXISTS idx_live_users_session_id ON live_users(session_id);
CREATE INDEX IF NOT EXISTS idx_live_users_last_activity ON live_users(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_live_users_country ON live_users(country);

-- ============================================
-- SETTINGS (for Brevo and other integrations)
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- TICKER ENTRIES
-- ============================================

CREATE TABLE IF NOT EXISTS ticker_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text VARCHAR(500) NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticker_entries_active ON ticker_entries(is_active);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    job_applications_limit INTEGER DEFAULT 10,
    message_limit INTEGER DEFAULT 50,
    connects_included INTEGER DEFAULT 10,
    featured_listing BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    analytics_access BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    invitation_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_packages_name ON subscription_packages(name);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    package_id UUID REFERENCES subscription_packages(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    referred_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_owners_updated_at BEFORE UPDATE ON project_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backers_updated_at BEFORE UPDATE ON backers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_clips_updated_at BEFORE UPDATE ON portfolio_clips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backing_updated_at BEFORE UPDATE ON backing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticker_entries_updated_at BEFORE UPDATE ON ticker_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_products_updated_at BEFORE UPDATE ON shop_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at BEFORE UPDATE ON shop_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON shop_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_url_redirects_updated_at BEFORE UPDATE ON url_redirects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_work_updated_at BEFORE UPDATE ON featured_work
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_success_stories_updated_at BEFORE UPDATE ON success_stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recent_projects_updated_at BEFORE UPDATE ON recent_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update conversation last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_at AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ============================================
-- SUPPORT TICKETS / SUGGESTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('bug', 'feature', 'suggestion', 'support', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email ON support_tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_is_public ON support_tickets(is_public);

CREATE TABLE IF NOT EXISTS ticket_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    responder_email VARCHAR(255) NOT NULL,
    responder_name VARCHAR(255) NOT NULL,
    responder_role VARCHAR(50) NOT NULL,
    response TEXT NOT NULL,
    reply_to VARCHAR(255),
    attachments JSONB DEFAULT '[]'::jsonb,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_created_at ON ticket_responses(created_at DESC);

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    ticket_num VARCHAR(20);
    prefix VARCHAR(10) := 'TKT';
    sequence_num INTEGER;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number, 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM support_tickets
    WHERE ticket_number LIKE prefix || '%';
    
    -- Format as TKT-XXXXX (5 digits, padded with zeros)
    ticket_num := prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
    
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- Trigger to update updated_at
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS (Supabase Storage)
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-photos', 'profile-photos', true),
  ('portfolio-clips', 'portfolio-clips', true),
  ('project-images', 'project-images', true),
  ('team-logos', 'team-logos', true),
  ('backer-logos', 'backer-logos', true),
  ('message-attachments', 'message-attachments', true),
  ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for all the above buckets
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
  USING (bucket_id IN ('profile-photos', 'portfolio-clips', 'project-images', 'team-logos', 'backer-logos', 'message-attachments', 'shop-images'));

-- Authenticated users can upload to all the above buckets
CREATE POLICY "Authenticated upload access" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('profile-photos', 'portfolio-clips', 'project-images', 'team-logos', 'backer-logos', 'message-attachments', 'shop-images') AND auth.role() = 'authenticated');

-- Authenticated users can update/delete their own uploaded files
CREATE POLICY "Authenticated update own files" ON storage.objects FOR UPDATE
  USING (bucket_id IN ('profile-photos', 'portfolio-clips', 'project-images', 'team-logos', 'backer-logos', 'message-attachments', 'shop-images') AND auth.uid() = owner);

CREATE POLICY "Authenticated delete own files" ON storage.objects FOR DELETE
  USING (bucket_id IN ('profile-photos', 'portfolio-clips', 'project-images', 'team-logos', 'backer-logos', 'message-attachments', 'shop-images') AND auth.uid() = owner);

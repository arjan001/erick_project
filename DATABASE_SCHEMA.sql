-- Studio22 Database Schema
-- PostgreSQL Schema for Production Deployment
-- Version: 1.1
-- Last Updated: June 29, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country);

-- ============================================
-- ARTISTS
-- ============================================

CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    stage_name VARCHAR(255),
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    years_experience INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    admin_approval_status VARCHAR(50) DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    social_media_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_approval_status ON artists(admin_approval_status);
CREATE INDEX idx_artists_availability ON artists(availability_status);

-- ============================================
-- TEAMS
-- ============================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_teams_approval_status ON teams(admin_approval_status);
CREATE INDEX idx_teams_availability ON teams(availability_status);

-- ============================================
-- TEAM MEMBERS
-- ============================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- ============================================
-- CLIENTS
-- ============================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    budget_range VARCHAR(100),
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- ============================================
-- BACKERS
-- ============================================

CREATE TABLE backers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255),
    investment_focus TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_invested DECIMAL(15, 2) DEFAULT 0,
    investment_count INTEGER DEFAULT 0,
    website_url TEXT,
    social_media_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_backers_user_id ON backers(user_id);
CREATE INDEX idx_backers_investment_count ON backers(investment_count);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('commercial', 'short_film', 'film', 'music_video', 'documentary', 'other')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_production', 'released', 'cancelled')),
    budget DECIMAL(12, 2),
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);

-- ============================================
-- BACKED PROJECTS
-- ============================================

CREATE TABLE backed_projects (
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

CREATE INDEX idx_backed_projects_backer_id ON backed_projects(backer_id);
CREATE INDEX idx_backed_projects_project_id ON backed_projects(project_id);
CREATE INDEX idx_backed_projects_status ON backed_projects(status);

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('director', 'cinematographer', 'editor', 'sound_engineer', 'producer', 'actor', 'other')),
    location VARCHAR(255),
    budget DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled')),
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    application_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_project_id ON jobs(project_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
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

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_artist_id ON applications(artist_id);
CREATE INDEX idx_applications_team_id ON applications(team_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================
-- JOB INVITATIONS
-- ============================================

CREATE TABLE job_invitations (
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

CREATE INDEX idx_job_invitations_job_id ON job_invitations(job_id);
CREATE INDEX idx_job_invitations_artist_id ON job_invitations(artist_id);
CREATE INDEX idx_job_invitations_team_id ON job_invitations(team_id);
CREATE INDEX idx_job_invitations_status ON job_invitations(status);

-- ============================================
-- PORTFOLIO CLIPS
-- ============================================

CREATE TABLE portfolio_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    project_name VARCHAR(255),
    role VARCHAR(100),
    duration_seconds INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_owner_check CHECK (
        (artist_id IS NOT NULL AND team_id IS NULL) OR 
        (artist_id IS NULL AND team_id IS NOT NULL)
    )
);

CREATE INDEX idx_portfolio_clips_artist_id ON portfolio_clips(artist_id);
CREATE INDEX idx_portfolio_clips_team_id ON portfolio_clips(team_id);
CREATE INDEX idx_portfolio_clips_featured ON portfolio_clips(is_featured);

-- ============================================
-- ENDORSEMENTS
-- ============================================

CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    CONSTRAINT unique_endorsement UNIQUE (endorser_id, recipient_artist_id, skill),
    CONSTRAINT unique_team_endorsement UNIQUE (endorser_id, recipient_team_id, skill)
);

CREATE INDEX idx_endorsements_endorser_id ON endorsements(endorser_id);
CREATE INDEX idx_endorsements_recipient_artist_id ON endorsements(recipient_artist_id);
CREATE INDEX idx_endorsements_recipient_team_id ON endorsements(recipient_team_id);

-- ============================================
-- TESTIMONIALS
-- ============================================

CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_testimonials_author_id ON testimonials(author_id);
CREATE INDEX idx_testimonials_recipient_artist_id ON testimonials(recipient_artist_id);
CREATE INDEX idx_testimonials_recipient_team_id ON testimonials(recipient_team_id);
CREATE INDEX idx_testimonials_project_id ON testimonials(project_id);

-- ============================================
-- CONNECTIONS
-- ============================================

CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id),
    CONSTRAINT no_self_connection CHECK (requester_id != receiver_id)
);

CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_receiver_id ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);

-- ============================================
-- MESSAGES
-- ============================================

CREATE TABLE conversations (
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

CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_job_id ON conversations(job_id);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('job_application', 'job_invitation', 'connection_request', 'message', 'endorsement', 'testimonial', 'project_update', 'system')),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- BACKING / FUNDING
-- ============================================

CREATE TABLE backing (
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

CREATE INDEX idx_backing_project_id ON backing(project_id);
CREATE INDEX idx_backing_backer_id ON backing(backer_id);
CREATE INDEX idx_backing_status ON backing(status);

-- ============================================
-- E-COMMERCE SHOP
-- ============================================

CREATE TABLE shop_products (
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

CREATE INDEX idx_shop_products_sku ON shop_products(sku);
CREATE INDEX idx_shop_products_category ON shop_products(category);
CREATE INDEX idx_shop_products_status ON shop_products(status);
CREATE INDEX idx_shop_products_featured ON shop_products(featured);

CREATE TABLE shop_orders (
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

CREATE INDEX idx_shop_orders_customer_email ON shop_orders(customer_email);
CREATE INDEX idx_shop_orders_order_status ON shop_orders(order_status);
CREATE INDEX idx_shop_orders_payment_status ON shop_orders(payment_status);
CREATE INDEX idx_shop_orders_created_at ON shop_orders(created_at DESC);

CREATE TABLE shop_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shop_order_items_order_id ON shop_order_items(order_id);
CREATE INDEX idx_shop_order_items_product_id ON shop_order_items(product_id);

CREATE TABLE shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shop_settings_key ON shop_settings(setting_key);
CREATE INDEX idx_shop_settings_category ON shop_settings(category);

-- ============================================
-- CMS & SEO
-- ============================================

CREATE TABLE cms_pages (
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

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON cms_pages(status);

CREATE TABLE url_redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_path VARCHAR(500) NOT NULL,
    to_path VARCHAR(500) NOT NULL,
    redirect_type VARCHAR(10) DEFAULT '301' CHECK (redirect_type IN ('301', '302')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_url_redirects_from ON url_redirects(from_path);
CREATE INDEX idx_url_redirects_status ON url_redirects(status);

-- ============================================
-- USER INVITATIONS
-- ============================================

CREATE TABLE user_invitations (
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

CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(token);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);

-- ============================================
-- API KEYS
-- ============================================

CREATE TABLE api_keys (
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

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- ADMIN SETTINGS
-- ============================================

CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- TICKER ENTRIES (for landing page banner)
-- ============================================

CREATE TABLE ticker_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text VARCHAR(500) NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticker_entries_active ON ticker_entries(is_active);

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
-- SAMPLE DATA (for development/testing)
-- ============================================

-- Insert admin user (password: admin123 - should be hashed in production)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@studio22.com', '$2b$10$placeholder_hash', 'Admin', 'User', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample admin settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Studio22', 'string', 'Site name'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode toggle'),
('max_upload_size_mb', '50', 'number', 'Maximum file upload size in MB')
ON CONFLICT (setting_key) DO NOTHING;
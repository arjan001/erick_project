-- Studio22 — Supabase migration for Jobs / Projects / Applications / Job Invitations
-- Run this in your Supabase project's SQL editor.
-- Replaces the old `jobs`, `applications`, `job_invitations`, `projects` tables
-- (which used internal UUID foreign keys to a `users`/`clients`/`artists` schema
-- that this app does not populate) with simple, email-keyed tables that match
-- what the app actually sends.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS job_invitations CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================
-- PROJECTS (client project briefs, e.g. "Post a Project")
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_owner_email VARCHAR(255) NOT NULL,
    project_owner_name VARCHAR(255),
    project_owner_company VARCHAR(255),
    open_to_backing BOOLEAN DEFAULT FALSE,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('commercial', 'short_film', 'film', 'music_video', 'documentary', 'funding_coproduction', 'other')),
    location_city VARCHAR(255),
    location_country VARCHAR(255),
    timeline_start DATE,
    timeline_deadline DATE,
    budget_range VARCHAR(50),
    notes TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'in_progress', 'delivered', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner_email ON projects(project_owner_email);

-- ============================================
-- JOBS (specific role postings, e.g. "Post a Job")
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    client_name VARCHAR(255),
    client_email VARCHAR(255) NOT NULL,
    client_avatar_url TEXT,
    location VARCHAR(255),
    budget_min NUMERIC(10,2),
    budget_max NUMERIC(10,2),
    budget_type VARCHAR(20) DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
    roles_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_required TEXT[] DEFAULT ARRAY[]::TEXT[],
    project_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_email ON jobs(client_email);

-- ============================================
-- APPLICATIONS (an artist applying to a Job OR a Project)
-- ============================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    artist_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'chat_started', 'shortlisted', 'hired', 'accepted', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cover_letter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT application_target_check CHECK (
        (job_id IS NOT NULL AND project_id IS NULL) OR
        (job_id IS NULL AND project_id IS NOT NULL)
    )
);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_applications_artist_email ON applications(artist_email);

-- ============================================
-- JOB INVITATIONS (client invites an artist to apply to a Job)
-- ============================================
CREATE TABLE job_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    artist_email VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_job_invitations_artist_email ON job_invitations(artist_email);
CREATE INDEX idx_job_invitations_status ON job_invitations(status);

-- Allow anon/authenticated read+write (app handles its own auth via Base44)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON job_invitations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TEAMS TABLE UPDATE (team registration + invited members)
-- ============================================
-- Aligns the `teams` table with the app's Team entity: city/country are no
-- longer required at signup (collected later in the onboarding modal), and
-- adds team_code/contact/specialty/size/language/equipment fields. Invited
-- team members are linked to their team via a `team_id` claim on their own
-- Supabase auth account (user_metadata.team_id) — NOT a separate row here —
-- so there is no mixup between which team a member belongs to.

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name VARCHAR(255) NOT NULL,
    team_code VARCHAR(50),
    contact_email VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(255),
    country VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add any columns missing from an existing (older) teams table instead of
-- failing — safe to re-run.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_code VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country VARCHAR(255);
ALTER TABLE teams ALTER COLUMN city DROP NOT NULL;
ALTER TABLE teams ALTER COLUMN country DROP NOT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_size VARCHAR(20);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS equipment_owned TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS portfolio_clips TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS availability VARCHAR(20) DEFAULT 'available';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_logo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS approved_date DATE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_contact_email ON teams(contact_email);
CREATE INDEX IF NOT EXISTS idx_teams_team_code ON teams(team_code);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access" ON teams;
CREATE POLICY "Public full access" ON teams FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TEAM INVITES (invite a member to a specific team_id)
-- ============================================
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'artist',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE,
    invited_by_email VARCHAR(255),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team_name VARCHAR(255),
    member_name VARCHAR(255),
    member_role VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invites_team_id ON invites(team_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access" ON invites;
CREATE POLICY "Public full access" ON invites FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ADMIN SETTINGS: TRANSACTIONAL EMAIL PROVIDER
-- ============================================
-- Toggle between Brevo and Resend for outbound emails (login/invite emails).
-- Actual API keys are stored as server-side environment variables, never in
-- this table — this only stores which provider + sender address to use.
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
('email_provider', 'brevo', 'string', 'Transactional email provider: brevo or resend'),
('email_sender_address', '', 'string', 'From address used when sending transactional emails')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- SUBSCRIPTION ORDERS (checkout/test payment records)
-- ============================================
-- QA/testing only: this app is not yet wired to a real payment processor,
-- so test card details are stored fully unmasked here for QA verification.
-- Never store real, live card numbers/CVVs in a table like this.
CREATE TABLE IF NOT EXISTS subscription_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    package_id VARCHAR(255) NOT NULL,
    package_name VARCHAR(255),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('completed', 'failed', 'pending', 'refunded')),
    payment_method VARCHAR(50) DEFAULT 'card',
    card_number VARCHAR(32),
    card_last4 VARCHAR(4),
    card_expiry VARCHAR(10),
    card_cvv VARCHAR(8),
    cardholder_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_email ON subscription_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON subscription_orders(status);

ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access" ON subscription_orders;
CREATE POLICY "Public full access" ON subscription_orders FOR ALL USING (true) WITH CHECK (true);
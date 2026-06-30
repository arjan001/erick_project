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
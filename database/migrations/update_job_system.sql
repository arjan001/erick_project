-- Comprehensive SQL migration for job system improvements
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. UPDATE JOBS TABLE WITH ADDITIONAL FIELDS
-- ============================================================

-- Add metadata column if not exists
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add additional fields to match frontend needs
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS about_project TEXT,
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS production_types TEXT[],
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS budget_min NUMERIC,
ADD COLUMN IF NOT EXISTS budget_max NUMERIC,
ADD COLUMN IF NOT EXISTS budget_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT,
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'freelance',
ADD COLUMN IF NOT EXISTS audition_format TEXT DEFAULT 'video',
ADD COLUMN IF NOT EXISTS audition_duration TEXT,
ADD COLUMN IF NOT EXISTS audition_language TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS audition_details TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS is_work_from_home BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

-- Drop check constraint that's causing issues
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_duration_check;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_jobs_urgency ON public.jobs(urgency);
CREATE INDEX IF NOT EXISTS idx_jobs_contract_type ON public.jobs(contract_type);
CREATE INDEX IF NOT EXISTS idx_jobs_audition_format ON public.jobs(audition_format);
CREATE INDEX IF NOT EXISTS idx_jobs_expiry_date ON public.jobs(expiry_date);

-- ============================================================
-- 2. CREATE ROLE TEMPLATES TABLE FOR PREDEFINED ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- acting, voice_over, ugc, crew, etc.
  description TEXT,
  requirements TEXT[],
  skills TEXT[],
  default_audition_format TEXT DEFAULT 'video',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined roles (Actor/UGC/Voice Over/Stunts/Extras focused - NO CREW ROLES)
INSERT INTO public.role_templates (name, category, description) VALUES
-- Acting Roles
('Lead Actor', 'Acting', 'Main character in a production'),
('Supporting Actor', 'Acting', 'Secondary character role'),
('Extra / Background', 'Acting', 'Background performer'),
('Stunt Double', 'Stunts', 'Performs stunts for actors'),
('Stunt Performer', 'Stunts', 'Performs dangerous stunts'),
('Stand-in', 'Acting', 'Replaces actor during setup'),
('Body Double', 'Acting', 'Body replacement for specific scenes'),
('Voice Actor', 'Acting', 'Voice-only performance'),

-- Voice Over Roles
('Commercial Voice Over', 'Voice Over', 'TV or radio commercial voice'),
('Narrator', 'Voice Over', 'Documentary or narration voice'),
('Character Voice', 'Voice Over', 'Animated character voice'),
('Audiobook Narrator', 'Voice Over', 'Book narration'),
('E-Learning Voice Over', 'Voice Over', 'Educational content narration'),
('IVR Voice Over', 'Voice Over', 'Interactive voice response'),
('Video Game Voice', 'Voice Over', 'Video game character voice'),

-- UGC Roles
('UGC Creator', 'UGC', 'User-generated content creator'),
('Product Reviewer', 'UGC', 'Product review content creator'),
('Testimonial Creator', 'UGC', 'Customer testimonial creator'),
('Unboxing Creator', 'UGC', 'Product unboxing content'),
('Lifestyle Content Creator', 'UGC', 'Lifestyle and daily vlogs'),
('Tech Reviewer', 'UGC', 'Technology product reviews'),

-- Stunt Roles
('Stunt Coordinator', 'Stunts', 'Coordinates stunt sequences'),
('Fight Choreographer', 'Stunts', 'Designs fight scenes'),
('High Fall Performer', 'Stunts', 'Performs high fall stunts'),
('Fire Stunt Performer', 'Stunts', 'Performs fire-related stunts'),
('Water Stunt Performer', 'Stunts', 'Performs water stunts'),

-- Extra Roles
('Background Extra', 'Extras', 'Background crowd performer'),
('Featured Extra', 'Extras', 'Non-speaking featured role'),
('Crowd Extra', 'Extras', 'Large crowd scene participant'),
('Atmosphere Extra', 'Extras', 'Background atmosphere creator'),

-- Additional Talent Roles
('Presenter / Host', 'Acting', 'TV or event presenter'),
('Model', 'Acting', 'Print or runway model'),
('Dancer', 'Acting', 'Professional dancer'),
('Choreographer', 'Acting', 'Dance routine designer')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. CREATE JOB ATTACHMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- image, video, pdf, document
  file_size NUMERIC,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_attachments_job_id ON public.job_attachments(job_id);

-- ============================================================
-- 4. UPDATE JOB APPLICATIONS TABLE
-- ============================================================

-- Add fields for audition files
ALTER TABLE public.job_applications
ADD COLUMN IF NOT EXISTS audition_file_url TEXT,
ADD COLUMN IF NOT EXISTS audition_file_type TEXT,
ADD COLUMN IF NOT EXISTS audition_file_name TEXT,
ADD COLUMN IF NOT EXISTS role_applied_for TEXT,
ADD COLUMN IF NOT EXISTS applicant_name TEXT,
ADD COLUMN IF NOT EXISTS applicant_email TEXT,
ADD COLUMN IF NOT EXISTS applicant_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shortlisted_by UUID REFERENCES public.users(id);

-- ============================================================
-- 5. CREATE APPLICATION MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.application_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_bulk BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_messages_application_id ON public.application_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_application_messages_sender_id ON public.application_messages(sender_id);

-- ============================================================
-- 6. CREATE JOB ANALYTICS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_analytics_job_id ON public.job_analytics(job_id);

-- ============================================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER trg_job_applications_updated_at BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_role_templates_updated_at ON public.role_templates;
CREATE TRIGGER trg_role_templates_updated_at BEFORE UPDATE ON public.role_templates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_job_analytics_updated_at ON public.job_analytics;
CREATE TRIGGER trg_job_analytics_updated_at BEFORE UPDATE ON public.job_analytics
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables updated: jobs, job_applications';
  RAISE NOTICE 'New tables created: role_templates, job_attachments, application_messages, job_analytics';
END $$;

-- ============================================================
-- ADD CLIENT PROFILES FIELDS FOR KYC AND CLIENT NAME DISTINCTION
-- ============================================================

-- Add client_name field to distinguish from company_name
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Add licensing certificate fields for KYC
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS license_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS license_certificate_issued_date DATE,
ADD COLUMN IF NOT EXISTS license_certificate_expiry_date DATE,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kyc_verified_by UUID REFERENCES public.users(id);

-- Add organization_type and username if not exists
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS organization_type TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add created_date field
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DO $$
BEGIN
  RAISE NOTICE 'Client profile fields added for KYC and client_name distinction';
END $$;

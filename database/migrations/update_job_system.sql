-- Comprehensive SQL migration for job system improvements
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. UPDATE JOBS TABLE WITH ADDITIONAL FIELDS
-- ============================================================

-- Add metadata column if not exists
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add additional fields
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
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS is_work_from_home BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

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

-- Insert predefined roles
INSERT INTO public.role_templates (name, category, description, requirements, skills) VALUES
-- Acting Roles
('Lead Actor', 'acting', 'Main character in a production', ARRAY['Drama experience', 'Memorization skills'], ARRAY['Acting', 'Script Analysis', 'Emotional Range']),
('Supporting Actor', 'acting', 'Secondary character role', ARRAY['Previous acting experience'], ARRAY['Acting', 'Character Development']),
('Extra / Background', 'acting', 'Background performer', ARRAY['Punctuality', 'Ability to follow directions'], ARRAY['Acting', 'Movement']),
('Voice Actor', 'acting', 'Voice-only performance', ARRAY['Voice training', 'Clear diction'], ARRAY['Voice Acting', 'Diction', 'Character Voices']),

-- Voice Over Roles
('Commercial Voice Over', 'voice_over', 'TV or radio commercial voice', ARRAY['Professional voice quality', 'Clear articulation'], ARRAY['Voice Over', 'Commercial', 'Articulation']),
('Narrator', 'voice_over', 'Documentary or narration voice', ARRAY['Authoritative voice', 'Clear pronunciation'], ARRAY['Narration', 'Voice Control', 'Pacing']),
('Character Voice', 'voice_over', 'Animated character voice', ARRAY['Versatile voice range', 'Character work'], ARRAY['Character Voices', 'Voice Acting', 'Improv']),
('Audiobook Narrator', 'voice_over', 'Book narration', ARRAY['Stamina for long sessions', 'Storytelling ability'], ARRAY['Narration', 'Storytelling', 'Voice Control']),

-- UGC Roles
('UGC Creator', 'ugc', 'User-generated content creator', ARRAY['On-camera presence', 'Authentic delivery'], ARRAY['Content Creation', 'On-Camera', 'Script Delivery']),
('Product Reviewer', 'ugc', 'Product review content creator', ARRAY['Knowledgeable delivery', 'Engaging personality'], ARRAY['Product Reviews', 'Content Creation', 'On-Camera']),
('Testimonial Creator', 'ugc', 'Customer testimonial creator', ARRAY['Natural delivery', 'Authentic presence'], ARRAY['Testimonials', 'Storytelling', 'On-Camera']),

-- Crew Roles
('Camera Operator', 'crew', 'Camera equipment operator', ARRAY['Camera operation experience', 'Technical knowledge'], ARRAY['Camera Operation', 'Lighting', 'Technical']),
('Sound Engineer', 'crew', 'Audio recording and mixing', ARRAY['Audio equipment knowledge', 'Sound mixing skills'], ARRAY['Sound Engineering', 'Audio Equipment', 'Mixing']),
('Lighting Technician', 'crew', 'Lighting setup and operation', ARRAY['Lighting knowledge', 'Safety awareness'], ARRAY['Lighting', 'Electrical', 'Safety']),
('Editor', 'crew', 'Video post-production editing', ARRAY['Editing software proficiency', 'Creative storytelling'], ARRAY['Video Editing', 'Post-Production', 'Storytelling']),

-- Production Roles
('Director', 'production', 'Production director', ARRAY['Leadership experience', 'Creative vision'], ARRAY['Directing', 'Leadership', 'Creative Vision']),
('Producer', 'production', 'Production coordinator', ARRAY['Organization skills', 'Budget management'], ARRAY['Producing', 'Organization', 'Budget Management']),
('Script Writer', 'production', 'Script and screenplay writer', ARRAY['Writing skills', 'Story structure knowledge'], ARRAY['Writing', 'Screenwriting', 'Storytelling'])
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

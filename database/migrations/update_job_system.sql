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
ADD COLUMN IF NOT EXISTS audition_details TEXT,
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

-- Insert predefined roles from filmIndustryRoles.json
INSERT INTO public.role_templates (name, category, description) VALUES
-- Pre-production
('Director', 'pre_production', 'Directs the overall vision of the production'),
('Producer', 'pre_production', 'Manages production logistics and budget'),
('Executive Producer', 'pre_production', 'Provides funding and oversees production'),
('Writer', 'pre_production', 'Writes scripts and screenplays'),
('Screenwriter', 'pre_production', 'Creates screenplays for films and shows'),
('Storyboard Artist', 'pre_production', 'Creates visual storyboards for scenes'),
('Concept Artist', 'pre_production', 'Develops visual concepts and designs'),
('Art Director', 'pre_production', 'Oversees the visual style of production'),
('Production Designer', 'pre_production', 'Designs the overall visual look'),
('Location Scout', 'pre_production', 'Finds and secures filming locations'),
('Casting Director', 'pre_production', 'Casts actors for roles'),

-- Production
('Director of Photography', 'production', 'Manages camera and lighting'),
('Cinematographer', 'production', 'Oversees the visual aspects of filming'),
('Camera Operator', 'production', 'Operates camera equipment'),
('1st AC', 'production', 'First assistant camera - focus puller'),
('Focus Puller', 'production', 'Maintains focus during filming'),
('2nd AC', 'production', 'Second assistant camera - slate and equipment'),
('Drone Pilot', 'production', 'Operates drone cameras for aerial shots'),
('FPV Pilot', 'production', 'First-person view drone pilot'),
('Gaffer', 'production', 'Head of lighting department'),
('Best Boy Electric', 'production', 'Chief electrician assistant'),
('Lighting Technician', 'production', 'Sets up and operates lighting'),
('Grip', 'production', 'Supports camera and lighting equipment'),
('Key Grip', 'production', 'Head of grip department'),
('Dolly Grip', 'production', 'Operates camera dollies and tracks'),
('Sound Recordist', 'production', 'Records on-set audio'),
('Boom Operator', 'production', 'Holds and positions boom microphone'),
('Production Assistant', 'production', 'General production support'),
('Set Designer', 'production', 'Designs and builds sets'),
('Set Decorator', 'production', 'Decorates sets with props and furniture'),
('Prop Master', 'production', 'Manages all props on set'),
('Hair Artist', 'production', 'Styles actors hair'),
('Makeup Artist', 'production', 'Applies makeup to actors'),
('Costume Designer', 'production', 'Designs and creates costumes'),

-- 3D/CGI
('3D Generalist', '3d_cgi', 'General 3D modeling and animation'),
('Hard Surface Modeler', '3d_cgi', 'Creates hard surface 3D models'),
('Character Artist', '3d_cgi', 'Creates 3D character models'),
('Environment Artist', '3d_cgi', 'Creates 3D environment assets'),
('Texture Artist', '3d_cgi', 'Creates textures for 3D models'),
('Material Artist', '3d_cgi', 'Creates materials and shaders'),
('Look Development Artist', '3d_cgi', 'Develops visual look of 3D assets'),
('Lighting Artist', '3d_cgi', 'Lights 3D scenes'),
('Rendering Artist', '3d_cgi', 'Handles rendering of 3D scenes'),
('Animator', '3d_cgi', 'Animates 3D characters and objects'),
('Character Animator', '3d_cgi', 'Specializes in character animation'),
('Motion Designer', '3d_cgi', 'Creates motion graphics'),
('VFX Artist', '3d_cgi', 'Creates visual effects'),
('FX Artist', '3d_cgi', 'Creates particle and physics effects'),
('Houdini Artist', '3d_cgi', 'Specializes in Houdini'),
('Cloth Artist', '3d_cgi', 'Simulates cloth and fabrics'),
('Groom Artist', '3d_cgi', 'Creates hair and fur'),
('Rigger', '3d_cgi', 'Rigs characters for animation'),
('Technical Artist', '3d_cgi', 'Bridges art and programming'),
('Unreal Engine Artist', '3d_cgi', 'Works with Unreal Engine'),
('Virtual Production Artist', '3d_cgi', 'Virtual production and real-time rendering'),

-- Post-production
('Video Editor', 'post_production', 'Edits video footage'),
('Assistant Editor', 'post_production', 'Assists with editing tasks'),
('Colorist', 'post_production', 'Color grades video footage'),
('Online Editor', 'post_production', 'Final assembly and finishing'),
('Compositor', 'post_production', 'Composites visual effects'),
('Matchmove Artist', 'post_production', 'Tracks camera movement'),
('Rotoscope Artist', 'post_production', 'Creates rotoscope mattes'),
('Paint Artist', 'post_production', 'Paints and cleans footage'),
('Cleanup Artist', 'post_production', 'Cleans up footage'),
('Motion Graphics Designer', 'post_production', 'Creates motion graphics'),
('Title Designer', 'post_production', 'Designs titles and graphics'),
('Sound Designer', 'post_production', 'Designs audio tracks'),
('Foley Artist', 'post_production', 'Creates foley sound effects'),
('Dialogue Editor', 'post_production', 'Edits dialogue audio'),
('Re Recording Mixer', 'post_production', 'Mixes final audio'),
('Music Composer', 'post_production', 'Composes music'),
('Music Producer', 'post_production', 'Produces music tracks'),
('Voice Over Artist', 'post_production', 'Records voice over'),

-- Photography/Product
('Product Photographer', 'photography_product', 'Photographs products'),
('Automotive Photographer', 'photography_product', 'Photographs vehicles'),
('Retoucher', 'photography_product', 'Retouches photos'),
('CGI Product Artist', 'photography_product', 'Creates CGI product visuals'),

-- Marketing/Social Media
('Creative Director', 'marketing_social_media', 'Oversees creative direction'),
('Content Creator', 'marketing_social_media', 'Creates digital content'),
('Social Media Manager', 'marketing_social_media', 'Manages social media accounts'),
('Thumbnail Designer', 'marketing_social_media', 'Designs video thumbnails'),
('Graphic Designer', 'marketing_social_media', 'Creates graphic designs'),
('Copywriter', 'marketing_social_media', 'Writes marketing copy'),
('Community Manager', 'marketing_social_media', 'Manages online communities'),
('SEO Specialist', 'marketing_social_media', 'Optimizes for search engines'),

-- Technical
('Pipeline TD', 'technical', 'Develops production pipelines'),
('Render Wrangler', 'technical', 'Manages render farms'),
('Render Farm Manager', 'technical', 'Manages rendering infrastructure'),
('Software Developer', 'technical', 'Develops software tools'),
('AI Artist', 'technical', 'Uses AI for creative work'),
('Prompt Engineer', 'technical', 'Crafts AI prompts')
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

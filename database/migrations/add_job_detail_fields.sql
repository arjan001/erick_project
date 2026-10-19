-- Add missing fields to jobs table for comprehensive job posting
-- This migration adds fields needed for the detailed job posting page

-- Add metadata JSONB column for storing additional job details
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add fields that were missing
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS about_project TEXT,
ADD COLUMN IF NOT EXISTS job_description TEXT,
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
ADD COLUMN IF NOT EXISTS is_work_from_home BOOLEAN DEFAULT false;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_jobs_urgency ON public.jobs(urgency);
CREATE INDEX IF NOT EXISTS idx_jobs_contract_type ON public.jobs(contract_type);
CREATE INDEX IF NOT EXISTS idx_jobs_audition_format ON public.jobs(audition_format);

-- Comment on metadata column
COMMENT ON COLUMN public.jobs.metadata IS 'Stores additional job details as JSON: roles_needed, attachments, etc.';

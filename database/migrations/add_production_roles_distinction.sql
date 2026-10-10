-- Migration: Add Production vs Roles Distinction for Jobs
-- This migration adds the ability to distinguish between single role jobs and production jobs with multiple roles

-- Create job_roles table for production roles (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_roles' AND table_schema = 'public') THEN
    CREATE TABLE public.job_roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      compensation_display TEXT,
      gender_requirement TEXT DEFAULT 'Any',
      age_min INTEGER,
      age_max INTEGER,
      ethnicity_requirement TEXT DEFAULT 'Any',
      union_requirement TEXT DEFAULT 'Any',
      description TEXT,
      role_sequence INTEGER DEFAULT 0,
      application_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_job_roles_job_id ON public.job_roles(job_id);
    CREATE INDEX idx_job_roles_sequence ON public.job_roles(role_sequence);
  END IF;
END $$;

-- Add is_production flag to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'is_production'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN is_production BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add production_id to jobs table (for single roles that belong to a production)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'production_id'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN production_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add role_sequence to jobs table (for ordering roles within a production)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'role_sequence'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN role_sequence INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add role requirements fields (gender, age range, ethnicity, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'gender_requirement'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN gender_requirement TEXT; -- Male, Female, Non-Binary, Any
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'age_min'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN age_min INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'age_max'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN age_max INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'ethnicity_requirement'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN ethnicity_requirement TEXT;
  END IF;
END $$;

-- Add union requirement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'union_requirement'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN union_requirement TEXT; -- SAG-AFTRA, Equity, Non-Union, Any
  END IF;
END $$;

-- Add compensation display field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'compensation_display'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN compensation_display TEXT; -- e.g., "$800 (est. 2 hours of work)"
  END IF;
END $$;

-- Add client company name for display
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'client_company_name'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN client_company_name TEXT;
  END IF;
END $$;

-- Add client logo URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'client_logo_url'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN client_logo_url TEXT;
  END IF;
END $$;

-- Add application count (cached)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'application_count'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN application_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add indexes for production queries
CREATE INDEX IF NOT EXISTS idx_jobs_is_production ON public.jobs(is_production);
CREATE INDEX IF NOT EXISTS idx_jobs_production_id ON public.jobs(production_id);
CREATE INDEX IF NOT EXISTS idx_jobs_role_sequence ON public.jobs(role_sequence);
CREATE INDEX IF NOT EXISTS idx_jobs_gender_requirement ON public.jobs(gender_requirement);
CREATE INDEX IF NOT EXISTS idx_jobs_age_range ON public.jobs(age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_jobs_compensation_display ON public.jobs(compensation_display);

-- Add comment to explain is_production
COMMENT ON COLUMN public.jobs.is_production IS 'If true, this job has multiple roles. If false, it is a single role posting.';

-- Add trigger to update job_roles updated_at
CREATE OR REPLACE FUNCTION public.update_job_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_roles_updated_at
  BEFORE UPDATE ON public.job_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_roles_updated_at();

-- Add trigger to update application_count on job_roles
CREATE OR REPLACE FUNCTION public.update_role_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.job_roles SET application_count = application_count + 1 WHERE id = NEW.job_role_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add job_role_id to job_applications if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_applications' AND column_name = 'job_role_id'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN job_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL;
  END IF;
END $$;

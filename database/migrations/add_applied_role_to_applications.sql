-- Add applied_role column to job_applications table
-- This allows artists to apply to specific roles in production jobs

ALTER TABLE public.job_applications
ADD COLUMN IF NOT EXISTS applied_role TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.job_applications.applied_role IS 'The specific role (discipline) the user applied for within a production job';

-- Add index for faster queries on applied_role
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_role ON public.job_applications(applied_role);

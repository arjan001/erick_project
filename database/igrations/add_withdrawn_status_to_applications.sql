-- Add withdrawn status to job_applications
-- Run this in Supabase SQL Editor

-- Update the status column to include 'withdrawn'
-- This is a data type change that allows the new status
-- No migration needed since status is TEXT, just need to update the policies if needed

-- Add comment to document withdrawn status
COMMENT ON COLUMN public.job_applications.status IS 'Application status: pending, viewed, shortlisted, rejected, hired, withdrawn';

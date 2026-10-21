-- ============================================================
-- ADD CLIENT_NAME TO JOBS TABLE
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor

-- Add client_name column to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_name ON public.jobs(client_name);

-- ============================================================
-- COMPLETED
-- ============================================================
-- The jobs table now has a client_name column to store the name of the client who posted the job.

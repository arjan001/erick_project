-- ============================================================
-- ADD FEATURED FLAG TO JOBS TABLE
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor

-- Add is_featured column to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON public.jobs(is_featured);

-- ============================================================
-- COMPLETED
-- ============================================================
-- The jobs table now has an is_featured column to mark jobs as featured for the landing page.

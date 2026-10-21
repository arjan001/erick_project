-- ============================================================
-- DISABLE RLS ON ADMIN-RELATED TABLES
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor

-- Disable RLS on tables used by admin modules
ALTER TABLE public.ticker_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMPLETED
-- ============================================================
-- RLS is now disabled on admin-related tables.
-- Admin panel can now manage these tables without permission errors.

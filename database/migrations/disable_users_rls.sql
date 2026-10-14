-- TEMPORARY: Disable RLS on users table to test if it's blocking reads
-- Run this in Supabase SQL Editor

-- Disable RLS on users table (this allows all reads/writes)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

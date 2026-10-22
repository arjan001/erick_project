-- Completely disable RLS on ticker_items table
-- Run this in Supabase SQL Editor to fix ticker creation/editing issues

-- First, drop all existing RLS policies on ticker_items
DROP POLICY IF EXISTS "Users can view ticker_items" ON public.ticker_items;
DROP POLICY IF EXISTS "Users can insert ticker_items" ON public.ticker_items;
DROP POLICY IF EXISTS "Users can update ticker_items" ON public.ticker_items;
DROP POLICY IF EXISTS "Users can delete ticker_items" ON public.ticker_items;
DROP POLICY IF EXISTS "Service role can all ticker_items" ON public.ticker_items;

-- Then disable RLS entirely on the table
ALTER TABLE public.ticker_items DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'ticker_items';

-- Verify no policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname 
FROM pg_policies 
WHERE tablename = 'ticker_items';

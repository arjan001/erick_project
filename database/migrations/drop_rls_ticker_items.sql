-- ============================================================
-- DROP ALL RLS POLICIES ON TICKER_ITEMS TABLE
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor

-- Drop all RLS policies on ticker_items table
DROP POLICY IF EXISTS "ticker_items_insert_policy" ON public.ticker_items;
DROP POLICY IF EXISTS "ticker_items_select_policy" ON public.ticker_items;
DROP POLICY IF EXISTS "ticker_items_update_policy" ON public.ticker_items;
DROP POLICY IF EXISTS "ticker_items_delete_policy" ON public.ticker_items;

-- Disable RLS completely
ALTER TABLE public.ticker_items DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMPLETED
-- ============================================================
-- All RLS policies have been dropped and RLS is disabled on ticker_items table.

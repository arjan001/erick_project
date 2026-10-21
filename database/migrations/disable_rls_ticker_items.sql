-- ============================================================
-- DISABLE RLS ON TICKER_ITEMS TABLE
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor

-- Disable RLS on ticker_items table to allow admin to read/write
ALTER TABLE public.ticker_items DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMPLETED
-- ============================================================
-- RLS is now disabled on ticker_items table.
-- Admin panel can now create, read, update, and delete ticker items.

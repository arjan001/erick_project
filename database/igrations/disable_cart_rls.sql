-- Completely disable RLS on cart table to fix 403 errors
-- Run this in Supabase SQL Editor

ALTER TABLE public.cart DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can insert their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can delete their own cart" ON public.cart;

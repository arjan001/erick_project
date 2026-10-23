-- Add last_seen column to users table for online status tracking
-- Run this in Supabase SQL Editor

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Add is_suspended and is_disabled columns to clients and artists tables
-- Run this in Supabase SQL Editor

-- Add to clients table (is_suspended already exists, just add is_disabled)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_disabled boolean DEFAULT false;

-- Add to artists table (neither exists)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS is_disabled boolean DEFAULT false;

-- Verify the columns
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name IN ('clients', 'artists') 
AND column_name IN ('is_suspended', 'is_disabled')
ORDER BY table_name, column_name;

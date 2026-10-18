-- Fix production schema mismatches based on actual deployed schema
-- This migration aligns the database with what the production tables actually have

-- Fix notifications table - use user_id instead of recipient_id
-- Note: The production notifications table may already use user_id
-- This ensures RLS policies are correct

-- Fix connections table - it uses connected_artist_id in production
-- The unique constraint is on (user_id, connected_artist_id)

-- Ensure connections table has correct structure
ALTER TABLE public.connections
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS connected_artist_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'network',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Ensure artists table has basic columns (what production actually has)
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC,
ADD COLUMN IF NOT EXISTS availability_status TEXT,
ADD COLUMN IF NOT EXISTS admin_approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS social_media_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Ensure notifications table uses user_id
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS link_url TEXT,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

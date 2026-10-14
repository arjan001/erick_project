-- Add all missing columns to artists table to match frontend expectations
-- This migration addresses all schema validation errors

-- Add project specialties
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS project_specialties TEXT[];

-- Add physical appearance columns
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS height_cms INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg INTEGER,
ADD COLUMN IF NOT EXISTS eye_color TEXT,
ADD COLUMN IF NOT EXISTS hair_color TEXT,
ADD COLUMN IF NOT EXISTS skin_tone TEXT,
ADD COLUMN IF NOT EXISTS build TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add location and contact columns
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS countries_worked TEXT[],
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Add portfolio and activity columns
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS portfolio_urls JSONB,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Add credits columns
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS film_credits JSONB,
ADD COLUMN IF NOT EXISTS commercial_credits JSONB;

-- Add education column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS education JSONB;

-- Add self recording column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS self_recording_description TEXT;

-- Add performing samples column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS performing_samples JSONB;

-- Add language column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];

-- Add location columns
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS based_in_city TEXT,
ADD COLUMN IF NOT EXISTS based_in_country TEXT;

-- Add profile photo column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add full name column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add bio column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add profession column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS profession TEXT;

-- Add gender column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add union/license columns
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS union_membership JSONB,
ADD COLUMN IF NOT EXISTS license_passport JSONB;

-- Add appearance as JSONB for complex data
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS appearance JSONB;

-- Add credits as JSONB for complex data
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS credits JSONB;

-- Add representation column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS representation JSONB;

-- Add onboarding column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add connects balance column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS connects_balance INTEGER DEFAULT 0;

-- Add is_team column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT false;

-- Add status column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add roles column
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS roles TEXT[];

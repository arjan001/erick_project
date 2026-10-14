-- Add missing columns to artists table
-- This migration adds columns that were previously in the UI but missing from the schema

-- Add text fields for contact information
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media TEXT;

-- Note: website_url and social_media_url already exist in the schema
-- We'll keep both for compatibility and migrate data later if needed

-- Add JSONB fields for credits and countries
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS film_credits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS commercial_credits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS countries_worked TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add self-recording description field
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS self_recording_description TEXT;

-- Add performance samples as JSONB
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS performing_samples JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_countries_worked ON artists USING GIN(countries_worked);
CREATE INDEX IF NOT EXISTS idx_artists_film_credits ON artists USING GIN(film_credits);
CREATE INDEX IF NOT EXISTS idx_artists_commercial_credits ON artists USING GIN(commercial_credits);

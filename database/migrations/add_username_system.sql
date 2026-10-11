-- Add username system for SmartGigs Kenya
-- This migration adds username field to creators table and ensures uniqueness

-- Add username column to creators table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN username TEXT;
    END IF;
END $$;

-- Add unique constraint on username
DROP INDEX IF EXISTS idx_creators_username_unique;
CREATE UNIQUE INDEX idx_creators_username_unique ON public.creators(username) WHERE username IS NOT NULL;

-- Add index for faster username lookups
DROP INDEX IF EXISTS idx_creators_username;
CREATE INDEX idx_creators_username ON public.creators(username);

-- Add comment
COMMENT ON COLUMN public.creators.username IS 'Unique username for artist profile and login';

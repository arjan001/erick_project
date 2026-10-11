-- Add username system for SmartGigs Kenya
-- This migration adds username field to all user-related tables and ensures uniqueness

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

-- Add username column to teams table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'teams'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN username TEXT;
    END IF;
END $$;

-- Add username column to clients table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN username TEXT;
    END IF;
END $$;

-- Add username column to backers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'backers'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.backers ADD COLUMN username TEXT;
    END IF;
END $$;

-- Add unique constraints on username for each table
DROP INDEX IF EXISTS idx_creators_username_unique;
CREATE UNIQUE INDEX idx_creators_username_unique ON public.creators(username) WHERE username IS NOT NULL;

DROP INDEX IF EXISTS idx_teams_username_unique;
CREATE UNIQUE INDEX idx_teams_username_unique ON public.teams(username) WHERE username IS NOT NULL;

DROP INDEX IF EXISTS idx_clients_username_unique;
CREATE UNIQUE INDEX idx_clients_username_unique ON public.clients(username) WHERE username IS NOT NULL;

DROP INDEX IF EXISTS idx_backers_username_unique;
CREATE UNIQUE INDEX idx_backers_username_unique ON public.backers(username) WHERE username IS NOT NULL;

-- Add indexes for faster username lookups
DROP INDEX IF EXISTS idx_creators_username;
CREATE INDEX idx_creators_username ON public.creators(username);

DROP INDEX IF EXISTS idx_teams_username;
CREATE INDEX idx_teams_username ON public.teams(username);

DROP INDEX IF EXISTS idx_clients_username;
CREATE INDEX idx_clients_username ON public.clients(username);

DROP INDEX IF EXISTS idx_backers_username;
CREATE INDEX idx_backers_username ON public.backers(username);

-- Add comments
COMMENT ON COLUMN public.creators.username IS 'Unique username for artist profile and login';
COMMENT ON COLUMN public.teams.username IS 'Unique username for team profile and login';
COMMENT ON COLUMN public.clients.username IS 'Unique username for client profile and login';
COMMENT ON COLUMN public.backers.username IS 'Unique username for backer profile and login';

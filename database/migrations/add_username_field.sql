-- Add username field to support login with username or email
-- This migration adds username fields to creator and client tables

-- Add username to creators table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN username TEXT UNIQUE;
    END IF;

    -- Add index for faster username lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_creators_username'
    ) THEN
        CREATE INDEX idx_creators_username ON public.creators(username);
    END IF;

    COMMENT ON COLUMN public.creators.username IS 'Unique username for login (alternative to email)';
END $$;

-- Add username to clients table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN username TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_clients_username'
    ) THEN
        CREATE INDEX idx_clients_username ON public.clients(username);
    END IF;

    COMMENT ON COLUMN public.clients.username IS 'Unique username for login (alternative to email)';
END $$;

-- Add username to teams table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'teams'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN username TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_teams_username'
    ) THEN
        CREATE INDEX idx_teams_username ON public.teams(username);
    END IF;

    COMMENT ON COLUMN public.teams.username IS 'Unique username for login (alternative to email)';
END $$;

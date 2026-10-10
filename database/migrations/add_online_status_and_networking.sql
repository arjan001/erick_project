-- Add online status and networking enhancements
-- This migration adds fields for online status and role-based networking tags

-- Check if column exists first for creators table
DO $$
BEGIN
    -- Add online status and last_active to creators table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'is_online'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN is_online BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'last_active'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add organization_type and organization_name for networking tags
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'organization_type'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN organization_type VARCHAR(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'organization_name'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN organization_name VARCHAR(255);
    END IF;

    -- Add index for online status queries
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_creators_online'
    ) THEN
        CREATE INDEX idx_creators_online ON public.creators(is_online);
    END IF;

    -- Add comments
    COMMENT ON COLUMN public.creators.is_online IS 'Online status indicator (green/red like WhatsApp)';
    COMMENT ON COLUMN public.creators.last_active IS 'Last active timestamp for auto-offline';
    COMMENT ON COLUMN public.creators.organization_type IS 'Organization type: individual, production_company, film_agency, casting_director, etc.';
    COMMENT ON COLUMN public.creators.organization_name IS 'Name of the organization for networking tags';
END $$;

-- Add similar fields to clients table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'is_online'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN is_online BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'last_active'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'organization_type'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN organization_type VARCHAR(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_clients_online'
    ) THEN
        CREATE INDEX idx_clients_online ON public.clients(is_online);
    END IF;

    COMMENT ON COLUMN public.clients.is_online IS 'Online status indicator';
    COMMENT ON COLUMN public.clients.last_active IS 'Last active timestamp';
    COMMENT ON COLUMN public.clients.organization_type IS 'Organization type: individual, production_company, film_agency, etc.';
END $$;

-- Add to teams table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'teams'
        AND column_name = 'is_online'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN is_online BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'teams'
        AND column_name = 'last_active'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_teams_online'
    ) THEN
        CREATE INDEX idx_teams_online ON public.teams(is_online);
    END IF;

    COMMENT ON COLUMN public.teams.is_online IS 'Online status indicator';
    COMMENT ON COLUMN public.teams.last_active IS 'Last active timestamp';
END $$;

-- Function to update online status automatically
CREATE OR REPLACE FUNCTION public.update_online_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_online = true;
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for creators if not exists
DROP TRIGGER IF EXISTS trg_creators_update_online ON public.creators;
CREATE TRIGGER trg_creators_update_online
    BEFORE UPDATE ON public.creators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_online_status();

-- Create trigger for clients if not exists
DROP TRIGGER IF EXISTS trg_clients_update_online ON public.clients;
CREATE TRIGGER trg_clients_update_online
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_online_status();

-- Create trigger for teams if not exists
DROP TRIGGER IF EXISTS trg_teams_update_online ON public.teams;
CREATE TRIGGER trg_teams_update_online
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_online_status();

-- Add email column to creators table for easier lookups
-- This fixes the "column creators.email does not exist" error

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN email TEXT;
    END IF;

    -- Add index for faster email lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_creators_email'
    ) THEN
        CREATE INDEX idx_creators_email ON public.creators(email);
    END IF;

    COMMENT ON COLUMN public.creators.email IS 'User email address for direct lookups';
END $$;

-- Also add full_name field if it doesn't exist (for consistency with code)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creators'
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.creators ADD COLUMN full_name TEXT;
    END IF;

    COMMENT ON COLUMN public.creators.full_name IS 'Full name of the creator/artist';
END $$;

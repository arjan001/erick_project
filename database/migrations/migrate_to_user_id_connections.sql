-- Migration script to migrate connections table from email-based to user_id-based
-- This script handles the transition from the old schema to the new user_id-based schema

-- Step 1: Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'requester_id') THEN
        ALTER TABLE public.connections ADD COLUMN requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'receiver_id') THEN
        ALTER TABLE public.connections ADD COLUMN receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Migrate data from email columns to user_id columns
UPDATE public.connections
SET requester_id = u.id
FROM public.users u
WHERE connections.requester_email = u.email AND connections.requester_id IS NULL;

UPDATE public.connections
SET receiver_id = u.id
FROM public.users u
WHERE connections.recipient_email = u.email AND connections.receiver_id IS NULL;

-- Step 3: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON public.connections(receiver_id);

-- Step 4: Add constraints (only if data migration is successful)
DO $$
BEGIN
    -- Check if all records have been migrated
    IF (SELECT COUNT(*) FROM public.connections WHERE requester_id IS NULL OR receiver_id IS NULL) = 0 THEN
        -- Add unique constraint
        ALTER TABLE public.connections ADD CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id);
        -- Add no self-connection constraint
        ALTER TABLE public.connections ADD CONSTRAINT no_self_connection CHECK (requester_id != receiver_id);
    END IF;
END $$;

-- Step 5: Drop old email columns (only after successful migration)
-- Uncomment the following lines only after verifying data migration is successful
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'requester_email') THEN
--         ALTER TABLE public.connections DROP COLUMN requester_email;
--     END IF;
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'recipient_email') THEN
--         ALTER TABLE public.connections DROP COLUMN recipient_email;
--     END IF;
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'requester_type') THEN
--         ALTER TABLE public.connections DROP COLUMN requester_type;
--     END IF;
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'recipient_type') THEN
--         ALTER TABLE public.connections DROP COLUMN recipient_type;
--     END IF;
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'connection_type') THEN
--         ALTER TABLE public.connections DROP COLUMN connection_type;
--     END IF;
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'connected_artist_id') THEN
--         ALTER TABLE public.connections DROP COLUMN connected_artist_id;
--     END IF;
-- END $$;

-- Drop old indexes
DROP INDEX IF EXISTS idx_connections_requester;
DROP INDEX IF EXISTS idx_connections_recipient;
DROP INDEX IF EXISTS idx_connections_type;
DROP INDEX IF EXISTS idx_connections_artist;

COMMENT ON TABLE public.connections IS 'Network connections between users (migrated to user_id-based)';

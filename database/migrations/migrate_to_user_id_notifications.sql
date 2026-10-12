-- Migration script to migrate notifications table from email-based to user_id-based
-- This script handles the transition from the old schema to the new user_id-based schema

-- Step 1: Add new user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
        ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Migrate data from recipient_email to user_id
UPDATE public.notifications
SET user_id = u.id
FROM public.users u
WHERE notifications.recipient_email = u.email AND notifications.user_id IS NULL;

-- Step 3: Create index for new column
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Step 4: Drop old recipient_email column (only after successful migration)
-- Uncomment the following lines only after verifying data migration is successful
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_email') THEN
--         ALTER TABLE public.notifications DROP COLUMN recipient_email;
--     END IF;
-- END $$;

-- Drop old index
DROP INDEX IF EXISTS idx_notifications_recipient_email;

COMMENT ON TABLE public.notifications IS 'User notifications (migrated to user_id-based)';

-- Migration: Populate user_id fields for legacy email-based data
-- This migration ensures all entity tables use user_id foreign keys to public.users
-- and migrates any legacy email-based references to the new schema

-- Step 1: Ensure all auth.users have corresponding public.users records
-- This is the authoritative source for user data

-- Function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.sync_auth_to_public_users()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
  existing_user RECORD;
BEGIN
  -- Loop through all auth users
  FOR auth_user IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    -- Check if user already exists in public.users
    SELECT * INTO existing_user FROM public.users WHERE id = auth_user.id LIMIT 1;

    IF NOT FOUND THEN
      -- Insert new user record
      INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        is_verified,
        created_at,
        updated_at
      )
      VALUES (
        auth_user.id,
        auth_user.email,
        COALESCE(
          auth_user.raw_user_meta_data->>'full_name',
          auth_user.raw_user_meta_data->>'name',
          SPLIT_PART(auth_user.email, '@', 1)
        ),
        COALESCE(
          auth_user.raw_user_meta_data->>'role',
          'creator'
        ),
        false,
        NOW(),
        NOW()
      );
    ELSE
      -- Update existing user record
      UPDATE public.users
      SET
        email = auth_user.email,
        full_name = COALESCE(
          auth_user.raw_user_meta_data->>'full_name',
          auth_user.raw_user_meta_data->>'name',
          existing_user.full_name
        ),
        role = COALESCE(
          auth_user.raw_user_meta_data->>'role',
          existing_user.role
        ),
        is_verified = false,
        updated_at = NOW()
      WHERE id = auth_user.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function
SELECT public.sync_auth_to_public_users();

-- Step 2: Migrate creators table to use user_id
-- For existing creators, find the corresponding user_id from public.users

UPDATE public.creators c
SET user_id = u.id
FROM public.users u
WHERE c.user_id IS NULL
  AND c.email = u.email;

-- Step 3: Migrate clients table to use user_id
-- For existing clients, find the corresponding user_id from public.users

UPDATE public.clients c
SET user_id = u.id
FROM public.users u
WHERE c.user_id IS NULL
  AND c.contact_email = u.email;

-- Step 4: Migrate teams table to use user_id
-- For existing teams, find the corresponding user_id from public.users

UPDATE public.teams t
SET user_id = u.id
FROM public.users u
WHERE t.user_id IS NULL
  AND t.contact_email = u.email;

-- Step 5: Migrate backers table to use user_id
-- For existing backers, find the corresponding user_id from public.users
-- NOTE: backers table uses contact_email, not email

UPDATE public.backers b
SET user_id = u.id
FROM public.users u
WHERE b.user_id IS NULL
  AND b.contact_email = u.email;

-- Step 6: Migrate jobs table to use client_id properly
-- NOTE: jobs table already uses client_id, no client_email column exists
-- This step is not needed

-- Step 7: Migrate projects table to use client_id properly
-- NOTE: projects table already uses client_id, no project_owner_email column exists
-- This step is not needed

-- Step 8: Migrate applications table to use user_id
-- NOTE: applications table already uses user_id, no artist_email column exists
-- This step is not needed

-- Step 9: Migrate notifications table to use user_id
-- NOTE: This is handled in update_notifications_schema.sql
-- This step is not needed

-- Step 10: Migrate messages table to use conversation_id and sender_id
-- NOTE: Messages table already uses conversation_id and sender_id
-- This step is not needed

-- Step 11: Migrate subscriptions table to use user_id
-- NOTE: subscriptions table already uses user_id, no user_email column exists
-- This step is not needed

-- Step 12: Migrate connections table to use user_id
-- NOTE: This is handled in add_connections_table.sql (table is recreated)
-- This step is not needed

-- Step 13: Create trigger to automatically sync new auth users to public.users
-- This replaces the old trigger that went directly to entity tables

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
BEGIN
  -- Insert or update public.users record
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'creator'
    ),
    false,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      EXCLUDED.full_name
    ),
    role = COALESCE(
      NEW.raw_user_meta_data->>'role',
      EXCLUDED.role
    ),
    is_verified = false,
    updated_at = NOW();

  -- Create entity record based on role (now using user_id)
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'creator'
  );
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  IF user_role = 'creator' OR user_role = 'artist' THEN
    INSERT INTO public.creators (user_id, display_name, full_name, created_at)
    VALUES (NEW.id, user_full_name, user_full_name, NOW())
    ON CONFLICT (user_id) DO NOTHING;

  ELSIF user_role = 'team' THEN
    INSERT INTO public.teams (user_id, team_name, contact_name, contact_email, team_code, created_at)
    VALUES (NEW.id, user_full_name, user_full_name, NEW.email, 'TM' || EXTRACT(EPOCH FROM NOW())::TEXT, NOW())
    ON CONFLICT (user_id) DO NOTHING;

  ELSIF user_role = 'client' OR user_role = 'project_owner' THEN
    INSERT INTO public.clients (user_id, display_name, contact_email, created_at)
    VALUES (NEW.id, user_full_name, NEW.email, NOW())
    ON CONFLICT (user_id) DO NOTHING;

  ELSIF user_role = 'backer' THEN
    INSERT INTO public.backers (user_id, display_name, contact_email, created_at)
    VALUES (NEW.id, user_full_name, NEW.email, NOW())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Cleanup: Optionally remove old email-based columns after verifying migration is successful
-- Uncomment these lines ONLY after verifying the migration worked correctly

-- ALTER TABLE public.jobs DROP COLUMN IF EXISTS client_email;
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS project_owner_email;
-- ALTER TABLE public.application DROP COLUMN IF EXISTS artist_email;
-- ALTER TABLE public.notifications DROP COLUMN IF EXISTS recipient_email;
-- ALTER TABLE public.messages DROP COLUMN IF EXISTS sender_email;
-- ALTER TABLE public.messages DROP COLUMN IF EXISTS recipient_email;
-- ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS user_email;
-- ALTER TABLE public.connections DROP COLUMN IF EXISTS user_email;

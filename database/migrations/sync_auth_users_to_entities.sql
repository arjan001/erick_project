-- Sync Supabase Auth users to entity tables
-- This ensures that when users sign up, they are automatically saved to the appropriate entity table
-- Updated to use user_id foreign keys instead of email-based columns

-- Function to handle new user signup and create entity record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
  existing_record RECORD;
BEGIN
  -- Get user metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'artist'
  );

  -- Create entity record based on role (check if exists first using user_id)
  IF user_role = 'artist' THEN
    SELECT * INTO existing_record FROM public.artists WHERE user_id = NEW.id LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.artists (user_id, display_name, created_at, updated_at)
      VALUES (NEW.id, user_full_name, NOW(), NOW());
    END IF;

  ELSIF user_role = 'team' THEN
    SELECT * INTO existing_record FROM public.teams WHERE user_id = NEW.id LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.teams (user_id, team_name, team_code, created_at, updated_at)
      VALUES (NEW.id, user_full_name, 'TM' || EXTRACT(EPOCH FROM NOW())::TEXT, NOW(), NOW());
    END IF;

  ELSIF user_role = 'client' OR user_role = 'project_owner' THEN
    SELECT * INTO existing_record FROM public.clients WHERE user_id = NEW.id LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.clients (user_id, company_name, created_at, updated_at)
      VALUES (NEW.id, user_full_name, NOW(), NOW());
    END IF;

  ELSIF user_role = 'backer' THEN
    SELECT * INTO existing_record FROM public.backers WHERE user_id = NEW.id LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.backers (user_id, organization_name, created_at, updated_at)
      VALUES (NEW.id, user_full_name, NOW(), NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to fire on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to sync existing auth users to entity tables
CREATE OR REPLACE FUNCTION public.sync_existing_auth_users()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
  user_role TEXT;
  user_full_name TEXT;
  existing_record RECORD;
BEGIN
  -- Loop through all auth users
  FOR auth_user IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    user_full_name := COALESCE(
      auth_user.raw_user_meta_data->>'full_name',
      auth_user.raw_user_meta_data->>'name',
      SPLIT_PART(auth_user.email, '@', 1)
    );
    user_role := COALESCE(
      auth_user.raw_user_meta_data->>'role',
      'artist'
    );

    -- Create entity record based on role (check if exists first using user_id)
    IF user_role = 'artist' THEN
      SELECT * INTO existing_record FROM public.artists WHERE user_id = auth_user.id LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO public.artists (user_id, display_name, created_at, updated_at)
        VALUES (auth_user.id, user_full_name, NOW(), NOW());
      END IF;

    ELSIF user_role = 'team' THEN
      SELECT * INTO existing_record FROM public.teams WHERE user_id = auth_user.id LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO public.teams (user_id, team_name, team_code, created_at, updated_at)
        VALUES (auth_user.id, user_full_name, 'TM' || EXTRACT(EPOCH FROM NOW())::TEXT, NOW(), NOW());
      END IF;

    ELSIF user_role = 'client' OR user_role = 'project_owner' THEN
      SELECT * INTO existing_record FROM public.clients WHERE user_id = auth_user.id LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO public.clients (user_id, company_name, created_at, updated_at)
        VALUES (auth_user.id, user_full_name, NOW(), NOW());
      END IF;

    ELSIF user_role = 'backer' THEN
      SELECT * INTO existing_record FROM public.backers WHERE user_id = auth_user.id LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO public.backers (user_id, organization_name, created_at, updated_at)
        VALUES (auth_user.id, user_full_name, NOW(), NOW());
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function for existing users
SELECT public.sync_existing_auth_users();

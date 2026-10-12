-- Sync Supabase Auth users to entity tables
-- This ensures that when users sign up, they are automatically saved to the appropriate entity table

-- Function to handle new user signup and create entity record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Get user metadata
  user_email := NEW.email;
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'artist'
  );

  -- Create entity record based on role
  IF user_role = 'artist' THEN
    INSERT INTO public.artists (email, full_name, role, status, created_at)
    VALUES (user_email, user_full_name, 'director', 'pending', NOW())
    ON CONFLICT (email) DO NOTHING;

  ELSIF user_role = 'team' THEN
    INSERT INTO public.teams (team_name, team_code, contact_email, contact_name, city, country, status, created_at)
    VALUES (user_full_name, 'TM' || EXTRACT(EPOCH FROM NOW())::TEXT, user_email, user_full_name, '', '', 'pending', NOW())
    ON CONFLICT (contact_email) DO NOTHING;

  ELSIF user_role = 'client' OR user_role = 'project_owner' THEN
    INSERT INTO public.project_owners (email, full_name, created_at)
    VALUES (user_email, user_full_name, NOW())
    ON CONFLICT (email) DO NOTHING;

  ELSIF user_role = 'backer' THEN
    INSERT INTO public.backers (organization_name, contact_email, created_at)
    VALUES (user_full_name, user_email, NOW())
    ON CONFLICT (contact_email) DO NOTHING;
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

    -- Create entity record based on role
    IF user_role = 'artist' THEN
      INSERT INTO public.artists (email, full_name, role, status, created_at)
      VALUES (auth_user.email, user_full_name, 'director', 'pending', NOW())
      ON CONFLICT (email) DO NOTHING;

    ELSIF user_role = 'team' THEN
      INSERT INTO public.teams (team_name, team_code, contact_email, contact_name, city, country, status, created_at)
      VALUES (user_full_name, 'TM' || EXTRACT(EPOCH FROM NOW())::TEXT, auth_user.email, user_full_name, '', '', 'pending', NOW())
      ON CONFLICT (contact_email) DO NOTHING;

    ELSIF user_role = 'client' OR user_role = 'project_owner' THEN
      INSERT INTO public.project_owners (email, full_name, created_at)
      VALUES (auth_user.email, user_full_name, NOW())
      ON CONFLICT (email) DO NOTHING;

    ELSIF user_role = 'backer' THEN
      INSERT INTO public.backers (organization_name, contact_email, created_at)
      VALUES (user_full_name, auth_user.email, NOW())
      ON CONFLICT (contact_email) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function for existing users
SELECT public.sync_existing_auth_users();

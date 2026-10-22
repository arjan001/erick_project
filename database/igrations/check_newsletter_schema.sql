-- Check existing newsletter_subscribers table structure
-- Run this in Supabase SQL Editor to see what columns exist

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'newsletter_subscribers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If table doesn't exist, this will return no results
-- If it exists but has different columns, we'll see them here

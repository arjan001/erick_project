# Admin Registration Guide

## Admin Route
The admin dashboard is accessible at: `/Admin`

## How to Register an Admin Account

### Option 1: Using Supabase Dashboard (EASIEST METHOD)

1. **Register the user normally**
   - Go to the app's Sign Up page
   - Register with your email and password
   - Sign in with the account

2. **Change the role in Supabase Dashboard**
   - Go to Supabase Dashboard → Table Editor
   - Select the `public` schema
   - Open the `users` table
   - Find your user by email
   - Edit the `role` column and change it from `artist` to `admin`
   - Click Save

3. **Sign out and sign back in**
   - The app will now recognize you as an admin
   - Navigate to `/Admin` to access the admin dashboard

### Option 2: Using SQL (Direct Database)

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Update an existing user to admin role
UPDATE public.users
SET role = 'admin',
    is_verified = true
WHERE email = 'your-email@example.com';

-- Or insert directly (requires the user to exist in auth.users first)
INSERT INTO public.users (id, email, full_name, role, is_verified)
VALUES (
  'YOUR_USER_ID', -- Get this from auth.users
  'admin@smartgigs.oneplusafrica.com',
  'Admin Name',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = true;
```

### Option 3: Using the Sign Up Page with Admin Metadata (Not Recommended)

Supabase Dashboard doesn't have a UI to edit user_metadata directly. The easiest way is Option 1 above.

## Important Notes

### Users Table
All users (artists, clients, teams, backers, admins) are now saved in the `public.users` table. This is enforced by:
- The `handle_new_user()` trigger that syncs auth.users to public.users
- The `ensureProfile()` function in AuthContext that creates user records

### Auth Trigger Fix
The SQL migration fixes the Supabase auth trigger error:
- "there is no unique or exclusion constraint matching the ON CONFLICT specification"
- This was causing invite/create user failures
- The trigger now properly handles the ON CONFLICT clause with the id primary key

### After SQL Migration
Run the migration in Supabase Dashboard → SQL Editor:
```sql
-- Copy contents of database/migrations/update_job_system.sql
-- Run it to apply all fixes including:
-- - Client KYC fields
-- - Auth trigger fix
-- - Job system improvements
```

## Current Issues Fixed

1. ✅ Connect button now uses user_id instead of artist_id
2. ✅ Messaging white screen issue - error handling improved
3. ✅ User registration - all users saved in public.users table
4. ✅ Supabase invite/create error - auth trigger fixed
5. ✅ Admin route is `/Admin` (accessible with admin role)

## Accessing Admin Dashboard

Once you have admin access:
1. Sign in with your admin account
2. Navigate to `/Admin`
3. You will see the admin dashboard with full access to all admin modules

## Troubleshooting

### If you still get "Database error saving new user"
- Ensure the SQL migration has been run
- Check that the `handle_new_user()` trigger exists
- Verify the `public.users` table has the correct schema

### If admin role doesn't work
- Verify the user's role in `public.users` table is set to 'admin'
- Check that the user is marked as `is_verified = true` if needed
- Sign out and sign back in to refresh the session

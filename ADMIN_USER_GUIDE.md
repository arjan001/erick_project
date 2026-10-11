# Admin User Setup Guide

## Overview
This guide explains how to create an admin user for SmartGigs Kenya and access the admin panel.

## Admin Login Route
- **Route**: `/erick` (not `/admin/login` - this is hidden to prevent unauthorized access attempts)
- **Access**: Only users with `role: 'admin'` in their Supabase user metadata can log in

## Step 1: Create Admin User in Supabase

### Option A: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://kjikqldkdufxoaeenwsd.supabase.co
   - Go to **Authentication** → **Users**

2. **Create New User**
   - Click **Add user** → **Create new user**
   - Enter email: `admin@smartgigskenya.com` (or your preferred admin email)
   - Enter a strong password
   - **Important**: Disable "Auto Confirm User" (user will need to verify email first)
   - Click **Create**

3. **Set User Role**
   - After creating the user, click on the user in the list
   - Go to **User Metadata** section
   - Add the following JSON:
     ```json
     {
       "role": "admin",
       "full_name": "Admin User"
     }
     ```
   - Click **Save**

4. **Confirm Email**
   - The admin user will receive a confirmation email
   - Click the link in the email to verify the account
   - Or, for development, you can manually confirm in Supabase Dashboard:
     - Click on the user
     - Change **Email Confirmed** to `true`
     - Click **Save**

### Option B: Via SQL

Run this SQL in Supabase SQL Editor:

```sql
-- Create admin user (you'll need to sign up through the app first, then run this)
-- This updates an existing user to have admin role

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@smartgigskenya.com';

-- Or for any user by ID
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'USER_ID_HERE';
```

## Step 2: Log In as Admin

1. **Navigate to Admin Login**
   - Go to: `https://smartgigs.oneplusafrica.com/erick`
   - Or locally: `http://localhost:5173/erick`

2. **Enter Credentials**
   - Email: The admin email you created
   - Password: The password you set

3. **Access Admin Dashboard**
   - After successful login, you'll be redirected to `/admin`
   - The admin dashboard gives you full access to:
     - User management
     - Content management
     - Analytics
     - Settings
     - And all other admin features

## Step 3: Verify Admin Access

To verify the user has admin role, you can check in Supabase:

```sql
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
```

## Security Notes

1. **Keep the `/erick` route secret** - Don't publicly document it
2. **Use strong passwords** for admin accounts
3. **Enable 2FA** if available in Supabase
4. **Limit admin users** - Only give admin access to trusted personnel
5. **Monitor admin activity** - Check auth logs regularly
6. **Rotate credentials** - Change admin passwords periodically

## Creating Additional Admin Users

Repeat Step 1 for each additional admin user you need. Each admin user must have:
- `role: 'admin'` in their user metadata
- Email confirmed
- Strong password

## Troubleshooting

### "Access denied. Admin access only."
- Check that the user has `role: 'admin'` in their Supabase user metadata
- Verify the user's email is confirmed
- Make sure you're using the correct password

### Can't find the admin login
- The route is `/erick` - not `/admin/login`
- This is intentional to hide the admin login from the public

### User metadata not updating
- Make sure you're saving the JSON correctly in Supabase Dashboard
- The metadata should be: `{"role": "admin", "full_name": "..."}`
- Check for syntax errors in the JSON

## Login/Logout Notifications

The application now shows notifications when:
- **User logs in**: "Welcome back, [Name]!" (green toast)
- **User logs out**: "Goodbye, [Name]!" (blue toast)

These notifications appear as:
- In-app toast notifications (top-right corner)
- Browser notifications (if permission granted)

## Support

If you encounter issues:
1. Check Supabase Auth logs
2. Verify user metadata in Supabase Dashboard
3. Check browser console for errors
4. Ensure Supabase URL and keys are correctly configured in `.env`

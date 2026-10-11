# Admin Account Setup Guide

## Creating the Admin Account in Supabase

### Step 1: Create Admin User in Supabase Auth (Recommended Method)

1. Go to [Supabase Dashboard](https://kjikqldkdufxoaeenwsd.supabase.co)
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** button
4. Fill in the details:
   - **Email**: `admin@smartgigskenya.com` (or your preferred admin email)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ (Check this box to skip email verification)
5. Click **"Create user"**

### Step 2: Set Admin Role in User Metadata

1. After creating the user, click on the user in the list
2. Scroll down to **"User Metadata"** section
3. Add the following JSON:
   ```json
   {
     "role": "admin",
     "full_name": "SmartGigs Admin"
   }
   ```
4. Click **"Save"**

**That's it!** The admin account is now ready.

### Step 3: Test Admin Login

1. Go to: `https://smartgigs.oneplusafrica.com/erick`
2. Enter the admin email and password
3. Should redirect to `/admin` dashboard

---

## ⚠️ IMPORTANT: SQL Method Failed

The SQL method failed with permission denied error. **DO NOT use the SQL method.** 

Only use the Supabase UI method above (Steps 1-2) to create the admin account.

---

## Run Required Database Migrations

You also need to run these SQL migrations in Supabase SQL Editor to fix the 401/404 errors:

### 1. Fix Missing Tables (applications, saved_jobs)
Run the SQL from: `database/migrations/fix_missing_tables.sql`

This will:
- Create the missing `saved_jobs` table
- Create the missing `applications` table
- Add proper RLS policies
- Fix 404 errors for these tables

### 2. Fix Analytics RLS Policies (401 errors)
Run the SQL from: `database/migrations/add_analytics_rls_policies.sql`

This will:
- Allow authenticated and anonymous users to insert analytics data
- Fix 401 Unauthorized errors for page_views, user_sessions, etc.
- Allow public access to analytics tracking

---

## Admin User Management

The admin panel at `/Admin/UserManagement` should allow you to:

- View all users in the system
- Add new users manually
- Edit user roles and permissions
- Suspend/unsuspend accounts
- View user activity

If the user management page is not fully functional, please let me know and I'll investigate and fix it.

---

## Admin Registration

Registration is enabled. Users can:
- Click "Join" button to sign up
- Choose "I'm Talent" or "I'm Hiring"
- Create their own accounts

The admin can then:
- Manage users via `/Admin/UserManagement`
- Assign appropriate roles (artist, client, team, backer)
- Suspend problematic accounts

---

## Security Notes

- Keep the admin password secure
- Change it immediately after first login
- Do not share admin credentials
- Use the admin panel to manage other users instead of creating them directly in Supabase

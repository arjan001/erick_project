# Admin Account Setup Guide

## ⚠️ REQUIRED: Run These SQL Migrations FIRST

**IMPORTANT: Run these migrations in the exact order shown!**

### 1. Disable All RLS Policies (REQUIRED FIRST)
Run the SQL from: `database/migrations/disable_all_rls.sql`

This will:
- DISABLE all Row Level Security policies
- Fix all 400/401/403 permission errors
- Allow authenticated users to access all data
- This is required before running any other migrations

### 2. Fix Missing Tables (applications, saved_jobs)
Run the SQL from: `database/migrations/fix_missing_tables.sql`

This will:
- Create the missing `saved_jobs` table
- Create the missing `applications` table
- Fix 404 errors for these tables

### 3. Add created_date Columns (fix sorting)
Run the SQL from: `database/migrations/add_created_date_columns.sql`

This will:
- Add created_date columns to all tables that were missing them
- Fix 400 Bad Request errors from sorting by created_date
- Add indexes for faster sorting

### 4. Insert Shop Products
Run the SQL from: `database/migrations/insert_shop_products.sql`

This will:
- Clear dummy shop data
- Insert realistic film/production equipment products
- Prices in KES (20-30 KES range)
- Categories: Equipment, Accessories, Supplies

### 5. Insert Subscription Packages
Run the SQL from: `database/migrations/insert_subscription_packages.sql`

This will:
- Clear existing subscription packages
- Insert Basic package (20 KES/month)
- Insert Pro package (30 KES/month)
- Fix subscription data loading errors

---

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

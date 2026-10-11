# Admin Account Setup Guide

## Creating the Admin Account in Supabase

### Step 1: Create Admin User in Supabase Auth

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

### Step 3: Alternative Method - SQL

If you prefer using SQL, run this in the Supabase SQL Editor:

```sql
-- Update user metadata to set admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@smartgigskenya.com';

-- Or insert a new admin user directly
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@smartgigskenya.com',
  crypt('your-password', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "full_name": "SmartGigs Admin"}'::jsonb,
  NOW(),
  NOW()
);
```

### Step 4: Test Admin Login

1. Go to: `https://smartgigs.oneplusafrica.com/erick`
2. Enter the admin email and password
3. Should redirect to `/admin` dashboard

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

Registration is currently disabled. Only the admin account created above can access the system. To create additional accounts:

1. Use the **Admin User Management** page at `/Admin/UserManagement`
2. Click **"Add User"** to create new accounts
3. Assign appropriate roles (artist, client, team, backer)

This ensures only the admin can add users to the system.

---

## Security Notes

- Keep the admin password secure
- Change it immediately after first login
- Do not share admin credentials
- Use the admin panel to manage other users instead of creating them directly in Supabase

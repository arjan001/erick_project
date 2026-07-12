-- ============================================
-- MIGRATE USERS TO NEW ROLE-BASED PERMISSION SYSTEM
-- ============================================
-- This migration migrates existing users from the old role column
-- to the new user_roles junction table

-- First, run the roles_permissions schema migration
-- This should be run BEFORE this migration

-- ============================================
-- MIGRATE EXISTING USERS TO NEW ROLE SYSTEM
-- ============================================

-- Map old role values to new role keys
-- admin -> admin
-- artist -> artist
-- team -> team
-- client -> client
-- project_owner -> client (mapped to client role)
-- backer -> backer

-- Insert user_roles for existing users based on their current role
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active, assigned_at)
SELECT 
    u.id as user_id,
    r.id as role_id,
    u.id as assigned_by, -- User assigned the role to themselves
    TRUE as is_active,
    u.created_at as assigned_at
FROM users u
JOIN roles r ON r.role_key = CASE 
    WHEN u.role = 'project_owner' THEN 'client'
    ELSE u.role
END
WHERE u.role IS NOT NULL
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- BACKUP OLD ROLE COLUMN (OPTIONAL)
-- ============================================
-- Uncomment if you want to keep the old role column for backup
-- ALTER TABLE users RENAME COLUMN role TO role_backup;

-- ============================================
-- DROP OLD ROLE COLUMN (OPTIONAL)
-- ============================================
-- Only run this after verifying the migration was successful
-- ALTER TABLE users DROP COLUMN role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check how many users were migrated
-- SELECT COUNT(*) as migrated_users FROM user_roles;

-- Check users without roles
-- SELECT id, email, role FROM users u 
-- LEFT JOIN user_roles ur ON u.id = ur.user_id 
-- WHERE ur.user_id IS NULL;

-- Check role distribution
-- SELECT r.role_name, COUNT(ur.user_id) as user_count 
-- FROM roles r 
-- LEFT JOIN user_roles ur ON r.id = ur.role_id 
-- GROUP BY r.role_name 
-- ORDER BY user_count DESC;

-- ============================================================
-- COMPREHENSIVE ROLES AND PERMISSIONS SYSTEM
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This populates the existing RBAC tables with permissions and roles
-- NOTE: Tables already exist - this only adds data and helper functions

-- ============================================================
-- 1. INSERT SYSTEM PERMISSIONS
-- ============================================================

-- Artists Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('artists.view', 'View artists list and details', 'View artists list and details', 'artists', 'read', 'all'),
('artists.create', 'Create new artist profiles', 'Create new artist profiles', 'artists', 'create', 'all'),
('artists.edit', 'Edit artist profiles', 'Edit artist profiles', 'artists', 'update', 'all'),
('artists.delete', 'Delete artist profiles', 'Delete artist profiles', 'artists', 'delete', 'all'),
('artists.approve', 'Approve artist applications', 'Approve artist applications', 'artists', 'approve', 'all'),
('artists.suspend', 'Suspend artist accounts', 'Suspend artist accounts', 'artists', 'suspend', 'all'),
('artists.media', 'Manage artist media files', 'Manage artist media files', 'artists', 'manage', 'media')
ON CONFLICT (permission_key) DO NOTHING;

-- Clients Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('clients.view', 'View clients list and details', 'View clients list and details', 'clients', 'read', 'all'),
('clients.create', 'Create new client profiles', 'Create new client profiles', 'clients', 'create', 'all'),
('clients.edit', 'Edit client profiles', 'Edit client profiles', 'clients', 'update', 'all'),
('clients.delete', 'Delete client profiles', 'Delete client profiles', 'clients', 'delete', 'all'),
('clients.suspend', 'Suspend client accounts', 'Suspend client accounts', 'clients', 'suspend', 'all'),
('clients.verify', 'Verify client KYC documents', 'Verify client KYC documents', 'clients', 'verify', 'all')
ON CONFLICT (permission_key) DO NOTHING;

-- Jobs Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('jobs.view', 'View all jobs', 'View all jobs', 'jobs', 'read', 'all'),
('jobs.create', 'Create job postings', 'Create job postings', 'jobs', 'create', 'all'),
('jobs.edit', 'Edit job postings', 'Edit job postings', 'jobs', 'update', 'all'),
('jobs.delete', 'Delete job postings', 'Delete job postings', 'jobs', 'delete', 'all'),
('jobs.approve', 'Approve job postings', 'Approve job postings', 'jobs', 'approve', 'all'),
('jobs.close', 'Close job postings', 'Close job postings', 'jobs', 'close', 'all'),
('jobs.applications', 'View job applications', 'View job applications', 'jobs', 'read', 'applications')
ON CONFLICT (permission_key) DO NOTHING;

-- Users Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('users.view', 'View all users', 'View all users', 'users', 'read', 'all'),
('users.create', 'Create new users', 'Create new users', 'users', 'create', 'all'),
('users.edit', 'Edit user profiles', 'Edit user profiles', 'users', 'update', 'all'),
('users.delete', 'Delete users', 'Delete users', 'users', 'delete', 'all'),
('users.roles', 'Assign roles to users', 'Assign roles to users', 'users', 'manage', 'roles'),
('users.impersonate', 'Impersonate other users', 'Impersonate other users', 'users', 'impersonate', 'all')
ON CONFLICT (permission_key) DO NOTHING;

-- Teams Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('teams.view', 'View teams list and details', 'View teams list and details', 'teams', 'read', 'all'),
('teams.create', 'Create new teams', 'Create new teams', 'teams', 'create', 'all'),
('teams.edit', 'Edit team profiles', 'Edit team profiles', 'teams', 'update', 'all'),
('teams.delete', 'Delete teams', 'Delete teams', 'teams', 'delete', 'all'),
('teams.members', 'Manage team members', 'Manage team members', 'teams', 'manage', 'members')
ON CONFLICT (permission_key) DO NOTHING;

-- Backers Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('backers.view', 'View backers list and details', 'View backers list and details', 'backers', 'read', 'all'),
('backers.create', 'Create new backer profiles', 'Create new backer profiles', 'backers', 'create', 'all'),
('backers.edit', 'Edit backer profiles', 'Edit backer profiles', 'backers', 'update', 'all'),
('backers.delete', 'Delete backer profiles', 'Delete backer profiles', 'backers', 'delete', 'all'),
('backers.investments', 'View and manage investments', 'View and manage investments', 'backers', 'manage', 'investments')
ON CONFLICT (permission_key) DO NOTHING;

-- Admin Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('admin.dashboard', 'Access admin dashboard', 'Access admin dashboard', 'admin', 'read', 'dashboard'),
('admin.settings', 'Manage system settings', 'Manage system settings', 'admin', 'update', 'settings'),
('admin.analytics', 'View system analytics', 'View system analytics', 'admin', 'read', 'analytics'),
('admin.audit_logs', 'View audit logs', 'View audit logs', 'admin', 'read', 'audit_logs'),
('admin.notifications', 'Send system notifications', 'Send system notifications', 'admin', 'create', 'notifications'),
('admin.email', 'Manage email settings', 'Manage email settings', 'admin', 'update', 'email'),
('admin.payments', 'Manage payment settings', 'Manage payment settings', 'admin', 'update', 'payments'),
('admin.roles', 'Manage roles and permissions', 'Manage roles and permissions', 'admin', 'manage', 'roles')
ON CONFLICT (permission_key) DO NOTHING;

-- Shop Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('shop.view', 'View shop products', 'View shop products', 'shop', 'read', 'all'),
('shop.create', 'Create shop products', 'Create shop products', 'shop', 'create', 'all'),
('shop.edit', 'Edit shop products', 'Edit shop products', 'shop', 'update', 'all'),
('shop.delete', 'Delete shop products', 'Delete shop products', 'shop', 'delete', 'all'),
('shop.orders', 'View and manage orders', 'View and manage orders', 'shop', 'manage', 'orders'),
('shop.settings', 'Manage shop settings', 'Manage shop settings', 'shop', 'update', 'settings')
ON CONFLICT (permission_key) DO NOTHING;

-- Content Module Permissions
INSERT INTO public.permissions (permission_key, permission_name, description, module, action, resource) VALUES
('content.cms', 'Manage CMS content', 'Manage CMS content', 'content', 'update', 'cms'),
('content.categories', 'Manage categories', 'Manage categories', 'content', 'update', 'categories'),
('content.featured', 'Manage featured content', 'Manage featured content', 'content', 'update', 'featured'),
('content.seo', 'Manage SEO settings', 'Manage SEO settings', 'content', 'update', 'seo')
ON CONFLICT (permission_key) DO NOTHING;

-- ============================================================
-- 2. INSERT SYSTEM ROLES
-- ============================================================

-- Super Admin - Full access to everything
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('super_admin', 'Super Administrator', 'Super Administrator with full system access', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- Admin - Most permissions but not all
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('admin', 'Administrator', 'Administrator with most system permissions', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- Artist Admin - Manage artists
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('artist_admin', 'Artist Administrator', 'Artist Administrator - manages artists', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- Client Admin - Manage clients
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('client_admin', 'Client Administrator', 'Client Administrator - manages clients', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- Team Admin - Manage teams
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('team_admin', 'Team Administrator', 'Team Administrator - manages teams', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- Content Manager - Manage content
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('content_manager', 'Content Manager', 'Content Manager - manages CMS and content', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- Support - View-only access for support
INSERT INTO public.roles (role_key, role_name, description, is_system_role, is_active) VALUES
('support', 'Support', 'Support - view-only access for customer support', true, true)
ON CONFLICT (role_key) DO NOTHING;

-- ============================================================
-- 3. ASSIGN PERMISSIONS TO ROLES
-- ============================================================

-- Super Admin gets ALL permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'super_admin'), id
FROM public.permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin gets most permissions (except super-specific ones)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'admin'), id
FROM public.permissions
WHERE permission_key NOT IN ('users.impersonate')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Artist Admin gets artist-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'artist_admin'), id
FROM public.permissions
WHERE module IN ('artists', 'users') AND action IN ('read', 'create', 'update', 'approve', 'suspend')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Client Admin gets client-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'client_admin'), id
FROM public.permissions
WHERE module IN ('clients', 'jobs') AND action IN ('read', 'create', 'update', 'approve', 'suspend')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Team Admin gets team-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'team_admin'), id
FROM public.permissions
WHERE module IN ('teams', 'users') AND action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Content Manager gets content-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'content_manager'), id
FROM public.permissions
WHERE module IN ('content', 'shop') AND action IN ('read', 'create', 'update', 'delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Support gets view-only permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE role_key = 'support'), id
FROM public.permissions
WHERE action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 4. CREATE HELPER FUNCTIONS
-- ============================================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    INNER JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    INNER JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND p.permission_key = p_permission_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE(permission_key TEXT, permission_name TEXT, module TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.permission_key, p.permission_name, p.module, p.action
  FROM public.user_roles ur
  INNER JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  INNER JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id UUID)
RETURNS TABLE(role_key TEXT, role_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.role_key, r.role_name
  FROM public.user_roles ur
  INNER JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. DISABLE RLS POLICIES (DISABLED PER USER REQUEST)
-- ============================================================

-- Disable RLS on roles and permissions tables for now
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON public.user_roles(expires_at);

-- ============================================================
-- 6. MIGRATE EXISTING ADMIN USERS TO NEW SYSTEM
-- ============================================================

-- Assign admin role to users with admin role in users table
INSERT INTO public.user_roles (user_id, role_id, assigned_at, is_active)
SELECT 
  u.id,
  (SELECT id FROM public.roles WHERE role_key = 'admin'),
  NOW(),
  true
FROM public.users u
WHERE u.role = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================
-- COMPLETED
-- ============================================================
-- The roles and permissions system is now populated.
-- 
-- Usage:
-- 1. Use public.user_has_permission(user_id, permission_key) to check permissions
-- 2. Use public.get_user_permissions(user_id) to get all permissions for a user
-- 3. Use public.get_user_roles(user_id) to get all roles for a user
-- 4. Assign roles via INSERT INTO public.user_roles (user_id, role_id, assigned_at)
-- 5. Create custom roles via INSERT INTO public.roles (role_key, role_name, description)
-- 6. Create custom permissions via INSERT INTO public.permissions (permission_key, permission_name, module, action)
-- 7. Assign permissions to roles via INSERT INTO public.role_permissions (role_id, permission_id)

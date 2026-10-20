-- ============================================================
-- COMPREHENSIVE ROLES AND PERMISSIONS SYSTEM
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This creates a complete role-based access control (RBAC) system

-- ============================================================
-- 1. CREATE PERMISSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL, -- artists, clients, jobs, users, etc.
  action TEXT NOT NULL, -- create, read, update, delete, approve, etc.
  resource TEXT, -- specific resource if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. CREATE ROLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
  level INTEGER DEFAULT 0, -- Role hierarchy level (higher = more permissions)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. CREATE ROLE_PERMISSIONS TABLE (MANY-TO-MANY)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- ============================================================
-- 4. CREATE USER_ROLES TABLE (ASSIGN ROLES TO USERS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration for temporary roles
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- ============================================================
-- 5. INSERT SYSTEM PERMISSIONS
-- ============================================================

-- Artists Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('artists.view', 'View artists list and details', 'artists', 'read', 'all'),
('artists.create', 'Create new artist profiles', 'artists', 'create', 'all'),
('artists.edit', 'Edit artist profiles', 'artists', 'update', 'all'),
('artists.delete', 'Delete artist profiles', 'artists', 'delete', 'all'),
('artists.approve', 'Approve artist applications', 'artists', 'approve', 'all'),
('artists.suspend', 'Suspend artist accounts', 'artists', 'suspend', 'all'),
('artists.media', 'Manage artist media files', 'artists', 'manage', 'media');

-- Clients Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('clients.view', 'View clients list and details', 'clients', 'read', 'all'),
('clients.create', 'Create new client profiles', 'clients', 'create', 'all'),
('clients.edit', 'Edit client profiles', 'clients', 'update', 'all'),
('clients.delete', 'Delete client profiles', 'clients', 'delete', 'all'),
('clients.suspend', 'Suspend client accounts', 'clients', 'suspend', 'all'),
('clients.verify', 'Verify client KYC documents', 'clients', 'verify', 'all');

-- Jobs Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('jobs.view', 'View all jobs', 'jobs', 'read', 'all'),
('jobs.create', 'Create job postings', 'jobs', 'create', 'all'),
('jobs.edit', 'Edit job postings', 'jobs', 'update', 'all'),
('jobs.delete', 'Delete job postings', 'jobs', 'delete', 'all'),
('jobs.approve', 'Approve job postings', 'jobs', 'approve', 'all'),
('jobs.close', 'Close job postings', 'jobs', 'close', 'all'),
('jobs.applications', 'View job applications', 'jobs', 'read', 'applications');

-- Users Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('users.view', 'View all users', 'users', 'read', 'all'),
('users.create', 'Create new users', 'users', 'create', 'all'),
('users.edit', 'Edit user profiles', 'users', 'update', 'all'),
('users.delete', 'Delete users', 'users', 'delete', 'all'),
('users.roles', 'Assign roles to users', 'users', 'manage', 'roles'),
('users.impersonate', 'Impersonate other users', 'users', 'impersonate', 'all');

-- Teams Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('teams.view', 'View teams list and details', 'teams', 'read', 'all'),
('teams.create', 'Create new teams', 'teams', 'create', 'all'),
('teams.edit', 'Edit team profiles', 'teams', 'update', 'all'),
('teams.delete', 'Delete teams', 'teams', 'delete', 'all'),
('teams.members', 'Manage team members', 'teams', 'manage', 'members');

-- Backers Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('backers.view', 'View backers list and details', 'backers', 'read', 'all'),
('backers.create', 'Create new backer profiles', 'backers', 'create', 'all'),
('backers.edit', 'Edit backer profiles', 'backers', 'update', 'all'),
('backers.delete', 'Delete backer profiles', 'backers', 'delete', 'all'),
('backers.investments', 'View and manage investments', 'backers', 'manage', 'investments');

-- Admin Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('admin.dashboard', 'Access admin dashboard', 'admin', 'read', 'dashboard'),
('admin.settings', 'Manage system settings', 'admin', 'update', 'settings'),
('admin.analytics', 'View system analytics', 'admin', 'read', 'analytics'),
('admin.audit_logs', 'View audit logs', 'admin', 'read', 'audit_logs'),
('admin.notifications', 'Send system notifications', 'admin', 'create', 'notifications'),
('admin.email', 'Manage email settings', 'admin', 'update', 'email'),
('admin.payments', 'Manage payment settings', 'admin', 'update', 'payments'),
('admin.roles', 'Manage roles and permissions', 'admin', 'manage', 'roles');

-- Shop Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('shop.view', 'View shop products', 'shop', 'read', 'all'),
('shop.create', 'Create shop products', 'shop', 'create', 'all'),
('shop.edit', 'Edit shop products', 'shop', 'update', 'all'),
('shop.delete', 'Delete shop products', 'shop', 'delete', 'all'),
('shop.orders', 'View and manage orders', 'shop', 'manage', 'orders'),
('shop.settings', 'Manage shop settings', 'shop', 'update', 'settings');

-- Content Module Permissions
INSERT INTO public.permissions (name, description, module, action, resource) VALUES
('content.cms', 'Manage CMS content', 'content', 'update', 'cms'),
('content.categories', 'Manage categories', 'content', 'update', 'categories'),
('content.featured', 'Manage featured content', 'content', 'update', 'featured'),
('content.seo', 'Manage SEO settings', 'content', 'update', 'seo');

-- ============================================================
-- 6. INSERT SYSTEM ROLES
-- ============================================================

-- Super Admin - Full access to everything
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('super_admin', 'Super Administrator with full system access', true, 100);

-- Admin - Most permissions but not all
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('admin', 'Administrator with most system permissions', true, 90);

-- Artist Admin - Manage artists
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('artist_admin', 'Artist Administrator - manages artists', true, 60);

-- Client Admin - Manage clients
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('client_admin', 'Client Administrator - manages clients', true, 60);

-- Team Admin - Manage teams
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('team_admin', 'Team Administrator - manages teams', true, 60);

-- Content Manager - Manage content
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('content_manager', 'Content Manager - manages CMS and content', true, 50);

-- Support - View-only access for support
INSERT INTO public.roles (name, description, is_system_role, level) VALUES
('support', 'Support - view-only access for customer support', true, 30);

-- ============================================================
-- 7. ASSIGN PERMISSIONS TO ROLES
-- ============================================================

-- Super Admin gets ALL permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'super_admin'), id
FROM public.permissions;

-- Admin gets most permissions (except super-specific ones)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'admin'), id
FROM public.permissions
WHERE name NOT IN ('users.impersonate');

-- Artist Admin gets artist-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'artist_admin'), id
FROM public.permissions
WHERE module IN ('artists', 'users') AND action IN ('view', 'create', 'edit', 'approve', 'suspend');

-- Client Admin gets client-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'client_admin'), id
FROM public.permissions
WHERE module IN ('clients', 'jobs') AND action IN ('view', 'create', 'edit', 'approve', 'suspend');

-- Team Admin gets team-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'team_admin'), id
FROM public.permissions
WHERE module IN ('teams', 'users') AND action IN ('view', 'create', 'edit');

-- Content Manager gets content-related permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'content_manager'), id
FROM public.permissions
WHERE module IN ('content', 'shop') AND action IN ('view', 'create', 'edit', 'delete');

-- Support gets view-only permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT (SELECT id FROM public.roles WHERE name = 'support'), id
FROM public.permissions
WHERE action = 'view';

-- ============================================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_name TEXT
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
      AND p.name = p_permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE(permission_name TEXT, module TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.module, p.action
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
RETURNS TABLE(role_name TEXT, role_level INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.level
  FROM public.user_roles ur
  INNER JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
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
-- 10. CREATE UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 11. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for permissions (read-only for authenticated users)
CREATE POLICY "Permissions read for authenticated" ON public.permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for roles (read-only for authenticated users)
CREATE POLICY "Roles read for authenticated" ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for role_permissions (read-only for authenticated users)
CREATE POLICY "Role permissions read for authenticated" ON public.role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for user_roles (users can see their own roles, admins can see all)
CREATE POLICY "User roles read own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User roles read all for admins" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.level >= 90
    )
  );

-- Only admins can insert/update/delete user_roles
CREATE POLICY "User roles manage for admins" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.level >= 90
    )
  );

-- ============================================================
-- 12. MIGRATE EXISTING ADMIN USERS TO NEW SYSTEM
-- ============================================================

-- Assign admin role to users with admin role in users table
INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
SELECT 
  u.id,
  (SELECT id FROM public.roles WHERE name = 'admin'),
  u.id,
  true
FROM public.users u
WHERE u.role = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================
-- COMPLETED
-- ============================================================
-- The roles and permissions system is now set up.
-- 
-- Usage:
-- 1. Use public.user_has_permission(user_id, permission_name) to check permissions
-- 2. Use public.get_user_permissions(user_id) to get all permissions for a user
-- 3. Use public.get_user_roles(user_id) to get all roles for a user
-- 4. Assign roles via INSERT INTO public.user_roles (user_id, role_id, assigned_by)
-- 5. Create custom roles via INSERT INTO public.roles (name, description, level)
-- 6. Create custom permissions via INSERT INTO public.permissions (name, description, module, action)
-- 7. Assign permissions to roles via INSERT INTO public.role_permissions (role_id, permission_id)

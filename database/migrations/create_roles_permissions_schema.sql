-- ============================================
-- ROLES & PERMISSIONS SCHEMA MIGRATION
-- ============================================
-- This migration creates a comprehensive role-based access control system
-- covering all modules in the Studio22 system with granular CRUD permissions

-- ============================================
-- DROP EXISTING TABLES WITH WRONG SCHEMA
-- ============================================
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
-- Stores all available permissions in the system
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- view, create, edit, delete, manage, etc.
    resource VARCHAR(100), -- specific resource if applicable
    category VARCHAR(100), -- for grouping in UI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_key ON permissions(permission_key);
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_category ON permissions(category);

-- ============================================
-- ROLES TABLE
-- ============================================
-- Stores all roles in the system
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_key ON roles(role_key);

-- ============================================
-- ROLE_PERMISSIONS TABLE
-- ============================================
-- Junction table linking roles to permissions
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================
-- USER_ROLES TABLE
-- ============================================
-- Junction table linking users to roles (supports multiple roles per user)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiry for temporary roles
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- ============================================
-- INSERT SYSTEM PERMISSIONS
-- ============================================
-- These cover all modules in the system with CRUD operations

-- Admin Dashboard
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('admin.dashboard.view', 'View Admin Dashboard', 'Can access and view the admin dashboard', 'admin', 'view', 'dashboard', 'Admin'),
('admin.dashboard.manage', 'Manage Admin Dashboard', 'Can manage dashboard settings and widgets', 'admin', 'manage', 'dashboard', 'Admin');

-- User Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('users.view', 'View Users', 'Can view user list and details', 'users', 'view', 'users', 'User Management'),
('users.create', 'Create Users', 'Can create new users', 'users', 'create', 'users', 'User Management'),
('users.edit', 'Edit Users', 'Can edit user information', 'users', 'edit', 'users', 'User Management'),
('users.delete', 'Delete Users', 'Can delete users', 'users', 'delete', 'users', 'User Management'),
('users.manage', 'Manage Users', 'Full user management access', 'users', 'manage', 'users', 'User Management');

-- Role Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('roles.view', 'View Roles', 'Can view roles and permissions', 'roles', 'view', 'roles', 'Role Management'),
('roles.create', 'Create Roles', 'Can create custom roles', 'roles', 'create', 'roles', 'Role Management'),
('roles.edit', 'Edit Roles', 'Can edit role permissions', 'roles', 'edit', 'roles', 'Role Management'),
('roles.delete', 'Delete Roles', 'Can delete custom roles', 'roles', 'delete', 'roles', 'Role Management'),
('roles.assign', 'Assign Roles', 'Can assign roles to users', 'roles', 'assign', 'roles', 'Role Management');

-- Artists Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('artists.view', 'View Artists', 'Can view artist list and profiles', 'artists', 'view', 'artists', 'Content Management'),
('artists.create', 'Create Artists', 'Can create artist profiles', 'artists', 'create', 'artists', 'Content Management'),
('artists.edit', 'Edit Artists', 'Can edit artist information', 'artists', 'edit', 'artists', 'Content Management'),
('artists.delete', 'Delete Artists', 'Can delete artists', 'artists', 'delete', 'artists', 'Content Management'),
('artists.approve', 'Approve Artists', 'Can approve artist applications', 'artists', 'approve', 'artists', 'Content Management'),
('artists.suspend', 'Suspend Artists', 'Can suspend artist accounts', 'artists', 'suspend', 'artists', 'Content Management');

-- Teams Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('teams.view', 'View Teams', 'Can view team list and profiles', 'teams', 'view', 'teams', 'Content Management'),
('teams.create', 'Create Teams', 'Can create team profiles', 'teams', 'create', 'teams', 'Content Management'),
('teams.edit', 'Edit Teams', 'Can edit team information', 'teams', 'edit', 'teams', 'Content Management'),
('teams.delete', 'Delete Teams', 'Can delete teams', 'teams', 'delete', 'teams', 'Content Management'),
('teams.approve', 'Approve Teams', 'Can approve team applications', 'teams', 'approve', 'teams', 'Content Management');

-- Projects Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('projects.view', 'View Projects', 'Can view project list and details', 'projects', 'view', 'projects', 'Jobs & Projects'),
('projects.create', 'Create Projects', 'Can create new projects', 'projects', 'create', 'projects', 'Jobs & Projects'),
('projects.edit', 'Edit Projects', 'Can edit project information', 'projects', 'edit', 'projects', 'Jobs & Projects'),
('projects.delete', 'Delete Projects', 'Can delete projects', 'projects', 'delete', 'projects', 'Jobs & Projects'),
('projects.manage', 'Manage Projects', 'Full project management access', 'projects', 'manage', 'projects', 'Jobs & Projects');

-- Jobs Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('jobs.view', 'View Jobs', 'Can view job postings', 'jobs', 'view', 'jobs', 'Jobs & Projects'),
('jobs.create', 'Create Jobs', 'Can create job postings', 'jobs', 'create', 'jobs', 'Jobs & Projects'),
('jobs.edit', 'Edit Jobs', 'Can edit job postings', 'jobs', 'edit', 'jobs', 'Jobs & Projects'),
('jobs.delete', 'Delete Jobs', 'Can delete job postings', 'jobs', 'delete', 'jobs', 'Jobs & Projects'),
('jobs.approve', 'Approve Jobs', 'Can approve job postings', 'jobs', 'approve', 'jobs', 'Jobs & Projects'),
('applications.manage', 'Manage Applications', 'Can approve/reject job applications', 'jobs', 'manage', 'applications', 'Jobs & Projects');

-- Clients Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('clients.view', 'View Clients', 'Can view client list and details', 'clients', 'view', 'clients', 'User Management'),
('clients.create', 'Create Clients', 'Can create client profiles', 'clients', 'create', 'clients', 'User Management'),
('clients.edit', 'Edit Clients', 'Can edit client information', 'clients', 'edit', 'clients', 'User Management'),
('clients.delete', 'Delete Clients', 'Can delete clients', 'clients', 'delete', 'clients', 'User Management');

-- Backers Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('backers.view', 'View Backers', 'Can view backer list and details', 'backers', 'view', 'backers', 'User Management'),
('backers.create', 'Create Backers', 'Can create backer profiles', 'backers', 'create', 'backers', 'User Management'),
('backers.edit', 'Edit Backers', 'Can edit backer information', 'backers', 'edit', 'backers', 'User Management'),
('backers.delete', 'Delete Backers', 'Can delete backers', 'backers', 'delete', 'backers', 'User Management');

-- Messages Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('messages.view', 'View Messages', 'Can view messages', 'messages', 'view', 'messages', 'Messaging & Network'),
('messages.send', 'Send Messages', 'Can send messages', 'messages', 'send', 'messages', 'Messaging & Network'),
('messages.delete', 'Delete Messages', 'Can delete messages', 'messages', 'delete', 'messages', 'Messaging & Network'),
('messages.manage', 'Manage Messages', 'Full message management access', 'messages', 'manage', 'messages', 'Messaging & Network');

-- Network & Connections
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('network.view', 'View Network', 'Can view network connections', 'network', 'view', 'network', 'Messaging & Network'),
('connections.manage', 'Manage Connections', 'Can manage connection requests', 'network', 'manage', 'connections', 'Messaging & Network'),
('endorsements.view', 'View Endorsements', 'Can view endorsements', 'network', 'view', 'endorsements', 'Messaging & Network'),
('endorsements.create', 'Create Endorsements', 'Can create endorsements', 'network', 'create', 'endorsements', 'Messaging & Network');

-- Content Management
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('content.view', 'View Content', 'Can view all content', 'content', 'view', 'content', 'Content Management'),
('content.edit', 'Edit Content', 'Can edit content', 'content', 'edit', 'content', 'Content Management'),
('content.delete', 'Delete Content', 'Can delete content', 'content', 'delete', 'content', 'Content Management'),
('content.moderate', 'Moderate Content', 'Can moderate and approve content', 'content', 'moderate', 'content', 'Content Management'),
('content.publish', 'Publish Content', 'Can publish content', 'content', 'publish', 'content', 'Content Management');

-- Featured Work
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('featured.view', 'View Featured Work', 'Can view featured work', 'featured', 'view', 'featured', 'Content Management'),
('featured.create', 'Create Featured Work', 'Can create featured work entries', 'featured', 'create', 'featured', 'Content Management'),
('featured.edit', 'Edit Featured Work', 'Can edit featured work', 'featured', 'edit', 'featured', 'Content Management'),
('featured.delete', 'Delete Featured Work', 'Can delete featured work', 'featured', 'delete', 'featured', 'Content Management');

-- Success Stories
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('success_stories.view', 'View Success Stories', 'Can view success stories', 'success_stories', 'view', 'success_stories', 'Content Management'),
('success_stories.create', 'Create Success Stories', 'Can create success stories', 'success_stories', 'create', 'success_stories', 'Content Management'),
('success_stories.edit', 'Edit Success Stories', 'Can edit success stories', 'success_stories', 'edit', 'success_stories', 'Content Management'),
('success_stories.delete', 'Delete Success Stories', 'Can delete success stories', 'success_stories', 'delete', 'success_stories', 'Content Management');

-- Recent Projects
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('recent_projects.view', 'View Recent Projects', 'Can view recent projects', 'recent_projects', 'view', 'recent_projects', 'Content Management'),
('recent_projects.create', 'Create Recent Projects', 'Can create recent project entries', 'recent_projects', 'create', 'recent_projects', 'Content Management'),
('recent_projects.edit', 'Edit Recent Projects', 'Can edit recent projects', 'recent_projects', 'edit', 'recent_projects', 'Content Management'),
('recent_projects.delete', 'Delete Recent Projects', 'Can delete recent projects', 'recent_projects', 'delete', 'recent_projects', 'Content Management');

-- Categories
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('categories.view', 'View Categories', 'Can view categories', 'categories', 'view', 'categories', 'Content Management'),
('categories.create', 'Create Categories', 'Can create categories', 'categories', 'create', 'categories', 'Content Management'),
('categories.edit', 'Edit Categories', 'Can edit categories', 'categories', 'edit', 'categories', 'Content Management'),
('categories.delete', 'Delete Categories', 'Can delete categories', 'categories', 'delete', 'categories', 'Content Management');

-- Ticker/Marquee
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('ticker.view', 'View Ticker', 'Can view ticker/marquee', 'ticker', 'view', 'ticker', 'Content Management'),
('ticker.edit', 'Edit Ticker', 'Can edit ticker content', 'ticker', 'edit', 'ticker', 'Content Management');

-- SEO & CMS
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('seo.view', 'View SEO Settings', 'Can view SEO settings', 'seo', 'view', 'seo', 'System'),
('seo.edit', 'Edit SEO Settings', 'Can edit SEO settings', 'seo', 'edit', 'seo', 'System'),
('cms.view', 'View CMS Content', 'Can view CMS content', 'cms', 'view', 'cms', 'System'),
('cms.edit', 'Edit CMS Content', 'Can edit CMS content', 'cms', 'edit', 'cms', 'System');

-- Image Storage
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('images.view', 'View Images', 'Can view image storage', 'images', 'view', 'images', 'System'),
('images.upload', 'Upload Images', 'Can upload images', 'images', 'upload', 'images', 'System'),
('images.delete', 'Delete Images', 'Can delete images', 'images', 'delete', 'images', 'System'),
('images.manage', 'Manage Images', 'Full image management access', 'images', 'manage', 'images', 'System');

-- Invites
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('invites.view', 'View Invites', 'Can view invites', 'invites', 'view', 'invites', 'User Management'),
('invites.create', 'Create Invites', 'Can create invites', 'invites', 'create', 'invites', 'User Management'),
('invites.revoke', 'Revoke Invites', 'Can revoke invites', 'invites', 'revoke', 'invites', 'User Management'),
('invites.manage', 'Manage Invites', 'Full invite management access', 'invites', 'manage', 'invites', 'User Management');

-- Login Providers
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('login_providers.view', 'View Login Providers', 'Can view login provider settings', 'login_providers', 'view', 'login_providers', 'Integrations'),
('login_providers.edit', 'Edit Login Providers', 'Can edit login provider settings', 'login_providers', 'edit', 'login_providers', 'Integrations'),
('login_providers.manage', 'Manage Login Providers', 'Full login provider management', 'login_providers', 'manage', 'login_providers', 'Integrations');

-- API Settings
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('api_settings.view', 'View API Settings', 'Can view API settings', 'api_settings', 'view', 'api_settings', 'Integrations'),
('api_settings.edit', 'Edit API Settings', 'Can edit API settings', 'api_settings', 'edit', 'api_settings', 'Integrations'),
('api_settings.manage', 'Manage API Settings', 'Full API settings management', 'api_settings', 'manage', 'api_settings', 'Integrations');

-- Payment Settings
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('payment_settings.view', 'View Payment Settings', 'Can view payment settings', 'payment_settings', 'view', 'payment_settings', 'Finance'),
('payment_settings.edit', 'Edit Payment Settings', 'Can edit payment gateway settings', 'payment_settings', 'edit', 'payment_settings', 'Finance'),
('payment_settings.manage', 'Manage Payment Settings', 'Full payment settings management', 'payment_settings', 'manage', 'payment_settings', 'Finance');

-- Finance Dashboard
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('finance.view', 'View Financials', 'Can view financial data', 'finance', 'view', 'finance', 'Finance'),
('finance.manage', 'Manage Financials', 'Can manage payments and transactions', 'finance', 'manage', 'finance', 'Finance'),
('finance.reports', 'View Finance Reports', 'Can view financial reports', 'finance', 'reports', 'finance', 'Finance');

-- Subscriptions
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('subscriptions.view', 'View Subscriptions', 'Can view subscription plans', 'subscriptions', 'view', 'subscriptions', 'Finance'),
('subscriptions.create', 'Create Subscriptions', 'Can create subscription plans', 'subscriptions', 'create', 'subscriptions', 'Finance'),
('subscriptions.edit', 'Edit Subscriptions', 'Can edit subscription plans', 'subscriptions', 'edit', 'subscriptions', 'Finance'),
('subscriptions.delete', 'Delete Subscriptions', 'Can delete subscription plans', 'subscriptions', 'delete', 'subscriptions', 'Finance'),
('subscriptions.manage', 'Manage Subscriptions', 'Full subscription management', 'subscriptions', 'manage', 'subscriptions', 'Finance');

-- Analytics
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('analytics.view', 'View Analytics', 'Can view analytics dashboard', 'analytics', 'view', 'analytics', 'Analytics'),
('analytics.reports', 'View Analytics Reports', 'Can view analytics reports', 'analytics', 'reports', 'analytics', 'Analytics'),
('analytics.export', 'Export Analytics', 'Can export analytics data', 'analytics', 'export', 'analytics', 'Analytics');

-- Audit Logs
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('audit.view', 'View Audit Logs', 'Can view audit logs', 'audit', 'view', 'audit_logs', 'Audit & Logs'),
('audit.delete', 'Delete Logs', 'Can delete audit logs', 'audit', 'delete', 'audit_logs', 'Audit & Logs'),
('audit.export', 'Export Logs', 'Can export audit logs', 'audit', 'export', 'audit_logs', 'Audit & Logs');

-- Settings
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('settings.general', 'General Settings', 'Can modify general settings', 'settings', 'edit', 'general', 'System'),
('settings.security', 'Security Settings', 'Can modify security settings', 'settings', 'edit', 'security', 'System'),
('settings.notifications', 'Notification Settings', 'Can modify notification settings', 'settings', 'edit', 'notifications', 'System'),
('settings.manage', 'Manage Settings', 'Full settings management access', 'settings', 'manage', 'settings', 'System');

-- Shop/Products
INSERT INTO permissions (permission_key, permission_name, description, module, action, resource, category) VALUES
('products.view', 'View Products', 'Can view products', 'products', 'view', 'products', 'E-commerce'),
('products.create', 'Create Products', 'Can create products', 'products', 'create', 'products', 'E-commerce'),
('products.edit', 'Edit Products', 'Can edit products', 'products', 'edit', 'products', 'E-commerce'),
('products.delete', 'Delete Products', 'Can delete products', 'products', 'delete', 'products', 'E-commerce'),
('orders.view', 'View Orders', 'Can view orders', 'orders', 'view', 'orders', 'E-commerce'),
('orders.manage', 'Manage Orders', 'Can manage orders', 'orders', 'manage', 'orders', 'E-commerce'),
('shop_settings.view', 'View Shop Settings', 'Can view shop settings', 'shop_settings', 'view', 'shop_settings', 'E-commerce'),
('shop_settings.edit', 'Edit Shop Settings', 'Can edit shop settings', 'shop_settings', 'edit', 'shop_settings', 'E-commerce');

-- ============================================
-- INSERT SYSTEM ROLES
-- ============================================

INSERT INTO roles (role_key, role_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Full system access with all permissions', TRUE),
('artist_admin', 'Artist Admin', 'Can manage artists and content', TRUE),
('team_admin', 'Team Admin', 'Can manage teams and projects', TRUE),
('project_admin', 'Project Admin', 'Can manage projects and jobs', TRUE),
('content_manager', 'Content Manager', 'Can manage all content', TRUE),
('finance_manager', 'Finance Manager', 'Can manage financial data', TRUE),
('support', 'Support', 'Can view user data and help users', TRUE),
('artist', 'Artist', 'Standard artist access', TRUE),
('team', 'Team', 'Standard team access', TRUE),
('client', 'Client', 'Client / project owner access', TRUE),
('backer', 'Backer', 'Backer / investor access', TRUE);

-- ============================================
-- ASSIGN PERMISSIONS TO SYSTEM ROLES
-- ============================================

-- Administrator: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'admin'),
    id
FROM permissions;

-- Artist Admin: Artists, Content, Jobs permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'artist_admin'),
    id
FROM permissions
WHERE module IN ('artists', 'content', 'featured', 'success_stories', 'recent_projects', 'categories', 'ticker', 'jobs', 'messages', 'network');

-- Team Admin: Teams, Projects, Jobs permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'team_admin'),
    id
FROM permissions
WHERE module IN ('teams', 'projects', 'jobs', 'messages', 'network');

-- Project Admin: Projects, Jobs permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'project_admin'),
    id
FROM permissions
WHERE module IN ('projects', 'jobs', 'applications');

-- Content Manager: All content permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'content_manager'),
    id
FROM permissions
WHERE module IN ('content', 'featured', 'success_stories', 'recent_projects', 'categories', 'ticker', 'seo', 'cms');

-- Finance Manager: Finance permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'finance_manager'),
    id
FROM permissions
WHERE module IN ('finance', 'payment_settings', 'subscriptions');

-- Support: View-only access to most modules
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'support'),
    id
FROM permissions
WHERE action IN ('view');

-- Artist: Limited access
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'artist'),
    id
FROM permissions
WHERE permission_key IN (
    'content.view', 'content.edit',
    'jobs.view', 'applications.manage',
    'messages.view', 'messages.send',
    'network.view', 'connections.manage',
    'endorsements.view', 'endorsements.create'
);

-- Team: Limited access
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'team'),
    id
FROM permissions
WHERE permission_key IN (
    'content.view', 'content.edit',
    'jobs.view',
    'messages.view', 'messages.send',
    'network.view', 'connections.manage'
);

-- Client: Project owner access
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'client'),
    id
FROM permissions
WHERE permission_key IN (
    'projects.view', 'projects.edit', 'projects.delete',
    'jobs.view', 'jobs.edit', 'jobs.delete',
    'applications.manage',
    'messages.view', 'messages.send',
    'finance.view'
);

-- Backer: Investor access
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_key = 'backer'),
    id
FROM permissions
WHERE permission_key IN (
    'jobs.view',
    'finance.view',
    'projects.view'
);

-- ============================================
-- MIGRATE EXISTING USERS TO NEW ROLE SYSTEM
-- ============================================
-- This will be done in a separate migration after testing
-- to ensure data integrity

-- 004_seed_permissions_and_roles.sql
-- Seed system roles, permissions, role hierarchy, and default role permissions for Yuvakshar RBAC
-- This file is compatible with the final 003 schema (role_hierarchy uses role_id and parent_role_id)

-- 1. Permissions (idempotent)
INSERT INTO permissions (name, slug, category, description)
VALUES
    ('View Users', 'view_users', 'Users', 'Read-only access to user listings'),
    ('Manage Users', 'manage_users', 'Users', 'Create, edit, or delete users'),
    ('View Articles', 'view_articles', 'Articles', 'Read articles'),
    ('Create Articles', 'create_articles', 'Articles', 'Create new articles'),
    ('Edit Articles', 'edit_articles', 'Articles', 'Edit existing articles'),
    ('Publish Articles', 'publish_articles', 'Articles', 'Publish articles to public'),
    ('Delete Articles', 'delete_articles', 'Articles', 'Delete articles'),
    ('Manage Communities', 'manage_communities', 'Communities', 'Create/modify community data'),
    ('View Reports', 'view_reports', 'Reports', 'Read analytics and reports'),
    ('Resolve Reports', 'resolve_reports', 'Reports', 'Handle reported content'),
    ('Manage Roles', 'manage_roles', 'Roles', 'Create, edit, or delete roles'),
    ('Manage Settings', 'manage_settings', 'Settings', 'Change application configuration')
ON CONFLICT (slug) DO NOTHING;

-- 2. System Roles (idempotent)
INSERT INTO roles (name, slug, is_system_role, created_by)
VALUES
    ('Founder', 'founder', TRUE, NULL),
    ('Co-Founder', 'co_founder', TRUE, NULL),
    ('Super Admin', 'super_admin', TRUE, NULL),
    ('Admin', 'admin', FALSE, NULL),
    ('Editor-in-Chief', 'editor_in_chief', FALSE, NULL),
    ('Editor', 'editor', FALSE, NULL),
    ('Moderator', 'moderator', FALSE, NULL),
    ('Reviewer', 'reviewer', FALSE, NULL)
ON CONFLICT (slug) DO NOTHING;

-- 3. Role Hierarchy (idempotent) - uses role_id (child) and parent_role_id
WITH role_ids AS (
    SELECT id, slug FROM roles WHERE slug IN (
        'founder','co_founder','super_admin','admin','editor_in_chief','editor','moderator','reviewer'
    )
)
INSERT INTO role_hierarchy (role_id, parent_role_id, sort_order, display_name)
SELECT c.id, p.id,
       ROW_NUMBER() OVER (ORDER BY CASE c.slug
            WHEN 'co_founder' THEN 2
            WHEN 'super_admin' THEN 3
            WHEN 'admin' THEN 4
            WHEN 'editor_in_chief' THEN 5
            WHEN 'editor' THEN 6
            WHEN 'moderator' THEN 7
            WHEN 'reviewer' THEN 8
            END) AS sort_order,
       initcap(replace(c.slug, '_', ' '))
FROM role_ids p
JOIN role_ids c ON (
    (p.slug = 'founder' AND c.slug = 'co_founder') OR
    (p.slug = 'co_founder' AND c.slug = 'super_admin') OR
    (p.slug = 'super_admin' AND c.slug = 'admin') OR
    (p.slug = 'admin' AND c.slug = 'editor_in_chief') OR
    (p.slug = 'editor_in_chief' AND c.slug = 'editor') OR
    (p.slug = 'editor' AND c.slug = 'moderator') OR
    (p.slug = 'moderator' AND c.slug = 'reviewer')
)
ON CONFLICT (role_id, parent_role_id) DO NOTHING;

-- 4. Default Role Permissions (idempotent)

-- Founder receives all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.slug = 'founder'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Co-Founder receives all except manage_settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'co_founder' AND p.slug <> 'manage_settings'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Super Admin receives all manage_* permissions (still valid)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'super_admin' AND p.slug LIKE 'manage_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin gets a broad set of permissions (excluding the removed manage_articles/manage_reports)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'admin' AND p.slug IN (
    'manage_users',
    'manage_communities',
    'manage_roles',
    'manage_settings',
    'create_articles',
    'edit_articles',
    'publish_articles',
    'delete_articles',
    'view_reports',
    'resolve_reports'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Editor-in-Chief gets article lifecycle permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'editor_in_chief' AND p.slug IN (
    'create_articles','edit_articles','publish_articles','delete_articles'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Editor gets create/edit/delete articles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'editor' AND p.slug IN (
    'create_articles','edit_articles','delete_articles'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Moderator gets view reports and manage communities
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'moderator' AND p.slug IN (
    'view_reports','resolve_reports','manage_communities'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Reviewer gets view articles and view reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'reviewer' AND p.slug IN (
    'view_articles','view_reports'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

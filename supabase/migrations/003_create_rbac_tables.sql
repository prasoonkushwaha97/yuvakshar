-- 003_create_rbac_tables.sql
-- RBAC upgrade migration for existing schema (idempotent)

-- 1. Alter existing `roles` table
-- Add columns if they do not exist
ALTER TABLE roles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN DEFAULT FALSE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Safely add UNIQUE constraint on name if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_key'
    ) THEN
        ALTER TABLE roles ADD CONSTRAINT roles_name_key UNIQUE (name);
    END IF;
END $$;

-- Safely add UNIQUE constraint on slug if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'roles_slug_key'
    ) THEN
        ALTER TABLE roles ADD CONSTRAINT roles_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Add updated_at trigger for roles if it doesn't exist
CREATE OR REPLACE FUNCTION trg_roles_set_timestamp() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roles_updated_at'
    ) THEN
        CREATE TRIGGER trg_roles_updated_at
        BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE FUNCTION trg_roles_set_timestamp();
    END IF;
END $$;

-- 2. Alter existing `permissions` table
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description TEXT;

-- Safely add UNIQUE constraint on slug if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'permissions_slug_key'
    ) THEN
        ALTER TABLE permissions ADD CONSTRAINT permissions_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 3. Alter existing `role_permissions` table
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Safely add primary key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_pkey'
    ) THEN
        ALTER TABLE role_permissions ADD PRIMARY KEY (role_id, permission_id);
    END IF;
END $$;

-- 4. Create missing tables
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_hierarchy (
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    parent_role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    sort_order INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    PRIMARY KEY (role_id, parent_role_id)
);

CREATE TABLE IF NOT EXISTS role_assignment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    action TEXT CHECK (action IN ('assign', 'remove', 'promote', 'demote')) NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- 5. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_child ON role_hierarchy(role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_parent ON role_hierarchy(parent_role_id);

-- 6. Trigger to prevent circular inheritance
CREATE OR REPLACE FUNCTION prevent_role_cycle() RETURNS trigger AS $$
DECLARE
    v_parent UUID;
BEGIN
    v_parent := NEW.parent_role_id;
    WHILE v_parent IS NOT NULL LOOP
        IF v_parent = NEW.role_id THEN
            RAISE EXCEPTION 'Circular role inheritance detected';
        END IF;
        SELECT parent_role_id INTO v_parent FROM role_hierarchy WHERE role_id = v_parent;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prevent_role_cycle'
    ) THEN
        CREATE TRIGGER trg_prevent_role_cycle
        BEFORE INSERT OR UPDATE ON role_hierarchy
        FOR EACH ROW EXECUTE FUNCTION prevent_role_cycle();
    END IF;
END $$;

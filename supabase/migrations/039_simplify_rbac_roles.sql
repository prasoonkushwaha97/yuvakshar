-- Migration 039: Simplify RBAC Roles (Permanent Refactor)

-- 1. Update existing roles in database
-- We will map 'super_admin' -> 'admin'
-- 'co_founder' -> 'founder'
-- 'editor_in_chief', 'managing_editor', 'author', 'contributor', 'reviewer' -> 'editor'
-- 'member', 'subscriber', 'moderator' -> delete (or map to NULL in user schemas)

-- Update user roles mapping
UPDATE public.user_roles 
SET role_id = (SELECT id FROM public.roles WHERE slug = 'admin' LIMIT 1)
WHERE role_id = (SELECT id FROM public.roles WHERE slug = 'super_admin' LIMIT 1);

UPDATE public.user_roles 
SET role_id = (SELECT id FROM public.roles WHERE slug = 'founder' LIMIT 1)
WHERE role_id = (SELECT id FROM public.roles WHERE slug = 'co_founder' LIMIT 1);

UPDATE public.user_roles 
SET role_id = (SELECT id FROM public.roles WHERE slug = 'editor' LIMIT 1)
WHERE role_id IN (SELECT id FROM public.roles WHERE slug IN ('editor_in_chief', 'managing_editor', 'author', 'contributor', 'reviewer'));

-- Delete mapping for community roles
DELETE FROM public.user_roles
WHERE role_id IN (SELECT id FROM public.roles WHERE slug IN ('member', 'subscriber', 'moderator'));

-- 1. Remove references to these legacy roles in user_roles and role_hierarchy
DELETE FROM public.user_roles 
WHERE role_id IN (
    SELECT id FROM public.roles WHERE slug IN ('super_admin', 'co_founder', 'editor_in_chief', 'managing_editor', 'author', 'contributor', 'reviewer', 'member', 'subscriber', 'moderator')
);

DELETE FROM public.role_hierarchy
WHERE role_id IN (
    SELECT id FROM public.roles WHERE slug IN ('super_admin', 'co_founder', 'editor_in_chief', 'managing_editor', 'author', 'contributor', 'reviewer', 'member', 'subscriber', 'moderator')
) OR parent_role_id IN (
    SELECT id FROM public.roles WHERE slug IN ('super_admin', 'co_founder', 'editor_in_chief', 'managing_editor', 'author', 'contributor', 'reviewer', 'member', 'subscriber', 'moderator')
);

-- 2. Delete the actual legacy roles from the roles table
DELETE FROM public.roles 
WHERE slug IN ('super_admin', 'co_founder', 'editor_in_chief', 'managing_editor', 'author', 'contributor', 'reviewer', 'member', 'subscriber', 'moderator');

-- 3. We must update the `auth_has_any_role` SQL function if it hardcodes any legacy roles
-- Note: auth_has_any_role is usually dynamic, but let's recreate it just to be safe and clean.
CREATE OR REPLACE FUNCTION public.auth_has_any_role(role_slugs text[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count integer;
BEGIN
  -- Superuser override check could be here if needed
  -- But we only check user_roles now
  SELECT count(1) INTO v_count
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  AND r.slug = ANY(role_slugs);

  RETURN v_count > 0;
END;
$function$;

-- 4. Recreate major RLS policies using only the 3 permitted roles
-- We need to drop old policies that specifically referenced deleted roles.
-- Example: 'allow_managing_editor_insert', etc.
-- Let's dynamically drop policies with those names if they exist.

DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE policyname ILIKE '%managing_editor%' 
       OR policyname ILIKE '%editor_in_chief%'
       OR policyname ILIKE '%co_founder%'
       OR policyname ILIKE '%super_admin%'
       OR policyname ILIKE '%author%'
       OR policyname ILIKE '%reviewer%'
       OR policyname ILIKE '%member%'
       OR policyname ILIKE '%subscriber%'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

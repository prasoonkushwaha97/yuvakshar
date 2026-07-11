-- Migration: 040_migrate_rbac_to_profiles.sql
-- Purpose: Move RBAC source of truth to profiles.role and allow admins to update profiles.

-- 1. Update the Postgres function to read directly from profiles.role
CREATE OR REPLACE FUNCTION public.auth_has_any_role(role_slugs text[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count integer;
BEGIN
  SELECT count(1) INTO v_count
  FROM public.profiles
  WHERE id = auth.uid()
  AND LOWER(role) = ANY(role_slugs);

  RETURN v_count > 0;
END;
$function$;

-- 2. Add RLS policy allowing Admins and Founders to update profiles (for promotions)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (public.auth_has_any_role(ARRAY['founder', 'admin']))
WITH CHECK (public.auth_has_any_role(ARRAY['founder', 'admin']));

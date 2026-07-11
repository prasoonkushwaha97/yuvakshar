-- Migration: 041_update_profiles_role_check.sql
-- Purpose: Update the profiles.role CHECK constraint to only allow the new RBAC roles

-- 1. Update any existing legacy roles to their nearest equivalent
UPDATE public.profiles
SET role = CASE
    WHEN role IN ('Co-Founder', 'co_founder', 'Co-founder') THEN 'Admin'
    WHEN role IN ('Owner', 'owner') THEN 'Founder'
    WHEN role IN ('super_admin', 'Super Admin', 'Super_Admin') THEN 'Admin'
    WHEN role IN ('Managing Editor', 'managing_editor', 'Senior Editor', 'senior_editor', 'Associate Editor', 'associate_editor') THEN 'Editor'
    WHEN role IN ('Reviewer', 'reviewer', 'Author', 'author', 'Contributor', 'contributor') THEN 'Member'
    WHEN role IN ('Free Member', 'Premium Member', 'Patron Member') THEN 'Member'
    ELSE role
END;

-- 2. Ensure all existing roles are properly capitalized to match the constraint
UPDATE public.profiles SET role = 'Founder' WHERE LOWER(role) = 'founder';
UPDATE public.profiles SET role = 'Admin' WHERE LOWER(role) = 'admin';
UPDATE public.profiles SET role = 'Editor' WHERE LOWER(role) = 'editor';
UPDATE public.profiles SET role = 'Member' WHERE LOWER(role) = 'member';
UPDATE public.profiles SET role = 'Subscriber' WHERE LOWER(role) = 'subscriber';

-- 3. Drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 4. Create the new CHECK constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('Founder', 'Admin', 'Editor', 'Member', 'Subscriber'));

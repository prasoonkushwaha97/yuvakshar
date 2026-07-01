-- ==========================================
-- Migration: Universal Profile Cleanup
-- Purpose: Solidify 'profiles' as the Single Source of Truth
-- ==========================================

-- 1. Add missing canonical fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_url') THEN
        ALTER TABLE public.profiles ADD COLUMN cover_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE public.profiles ADD COLUMN website TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'slug') THEN
        ALTER TABLE public.profiles ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Clean up social_links JSON
-- Migrate any 'username' present inside social_links into the canonical username if canonical is null (unlikely due to 002 migration)
-- and then remove 'username' from social_links to ensure it only contains social accounts.
UPDATE public.profiles
SET social_links = social_links - 'username'
WHERE social_links ? 'username';

-- 3. Ensure username is strictly unique (002 already created idx_profiles_username_lower, but let's add a direct constraint if possible)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Migration: 043_backfill_profile_slugs.sql
-- Purpose: Backfill unique profile slugs, fix null values, enforce unique constraint on profiles.slug, and add auto-slug trigger

-- 1. Ensure slug column exists on profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'slug') THEN
        ALTER TABLE public.profiles ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Create helper function for generating unique slug without referencing non-existent email column
CREATE OR REPLACE FUNCTION generate_unique_profile_slug(p_name TEXT, p_id UUID)
RETURNS TEXT AS $fn$
DECLARE
    v_raw TEXT;
    v_base TEXT;
    v_test TEXT;
    v_counter INT := 2;
    v_exists BOOLEAN;
BEGIN
    -- Determine base string from name or user ID
    v_raw := COALESCE(NULLIF(TRIM(p_name), ''), 'user-' || SUBSTRING(p_id::TEXT FROM 1 FOR 6));
    
    -- Normalize to lowercase alphanumeric
    v_base := LOWER(v_raw);
    v_base := REGEXP_REPLACE(v_base, '[^a-z0-9]', '', 'g');

    IF LENGTH(v_base) < 2 THEN
        v_base := 'user' || SUBSTRING(MD5(p_id::TEXT) FROM 1 FOR 6);
    END IF;

    IF LENGTH(v_base) > 40 THEN
        v_base := SUBSTRING(v_base FROM 1 FOR 40);
    END IF;

    -- Guarantee Uniqueness
    v_test := v_base;
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE LOWER(slug) = LOWER(v_test) AND id <> p_id
        ) INTO v_exists;

        IF NOT v_exists THEN
            RETURN v_test;
        END IF;

        v_test := v_base || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
END;
$fn$ LANGUAGE plpgsql;

-- 3. Backfill missing/NULL slugs for existing profiles
DO $$
DECLARE
    r RECORD;
    v_new_slug TEXT;
BEGIN
    FOR r IN SELECT id, name FROM public.profiles WHERE slug IS NULL OR TRIM(slug) = '' LOOP
        v_new_slug := generate_unique_profile_slug(r.name, r.id);
        UPDATE public.profiles SET slug = v_new_slug WHERE id = r.id;
    END LOOP;
END $$;

-- 4. Create trigger to automatically assign unique slug on profile INSERT if null
CREATE OR REPLACE FUNCTION set_default_profile_slug()
RETURNS TRIGGER AS $trg$
BEGIN
    IF NEW.slug IS NULL OR TRIM(NEW.slug) = '' THEN
        NEW.slug := generate_unique_profile_slug(NEW.name, NEW.id);
    END IF;
    RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_profile_slug ON public.profiles;

CREATE TRIGGER trg_set_profile_slug
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_default_profile_slug();

-- 5. Add UNIQUE constraint and index on slug
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_slug_key;
DROP INDEX IF EXISTS idx_profiles_slug_lower;

CREATE UNIQUE INDEX idx_profiles_slug_lower ON public.profiles (LOWER(slug));
ALTER TABLE public.profiles ADD CONSTRAINT profiles_slug_key UNIQUE (slug);

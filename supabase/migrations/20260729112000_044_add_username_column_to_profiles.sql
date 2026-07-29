-- ==========================================
-- Migration: Add Username Column to Profiles
-- Purpose: Ensure username, username_changed_at, and previous_username exist on public.profiles,
--          backfill missing values, enforce uniqueness & validation, and reload PostgREST schema cache.
-- ==========================================

-- 1. Add columns to public.profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50),
ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS previous_username VARCHAR(50);

-- 2. Backfill null/empty usernames with fallback from slug, name, or id
DO $$
DECLARE
    r RECORD;
    v_base TEXT;
    v_test TEXT;
    v_counter INT;
    v_exists BOOLEAN;
BEGIN
    FOR r IN SELECT id, name, username, slug FROM public.profiles LOOP
        v_base := LOWER(COALESCE(NULLIF(r.username, ''), NULLIF(r.slug, ''), REGEXP_REPLACE(r.name, '[^a-zA-Z0-9_.-]', '-', 'g'), 'user'));
        v_base := REGEXP_REPLACE(v_base, '[-_.]+', '-', 'g');
        v_base := REGEXP_REPLACE(v_base, '^[-_.]+|[-_.]+$', '', 'g');
        IF LENGTH(v_base) < 3 THEN
            v_base := RPAD(v_base, 3, '0');
        END IF;
        IF LENGTH(v_base) > 25 THEN
            v_base := SUBSTRING(v_base FROM 1 FOR 25);
        END IF;
        
        v_test := v_base;
        v_counter := 1;
        
        LOOP
            SELECT EXISTS (
                SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_test) AND id != r.id
            ) INTO v_exists;
            
            IF NOT v_exists THEN
                EXIT;
            END IF;
            
            v_test := v_base || '-' || v_counter;
            v_counter := v_counter + 1;
        END LOOP;
        
        UPDATE public.profiles SET username = v_test WHERE id = r.id;
    END LOOP;
END $$;

-- 3. Enforce NOT NULL constraint
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- 4. Check constraint for supported username characters (3-30 chars: a-z0-9_.-)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check 
    CHECK (username ~ '^[a-zA-Z0-9_.-]{3,30}$');

-- 5. Case-insensitive unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(LOWER(username));

-- 6. Notify PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

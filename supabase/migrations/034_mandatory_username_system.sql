-- ==========================================
-- Migration: Mandatory Unique Username System
-- Purpose: Safely migrate legacy users, enforce unique usernames, and allow hyphens/periods
-- ==========================================

-- Guard: Only proceed if the username column exists (created by migration 002)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    RAISE NOTICE 'Column "username" does not exist on profiles. Skipping mandatory username migration.';
    RETURN;
  END IF;

  -- 1. Drop the old username check constraint
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_check;

  -- 2. Create a temporary helper function to safely generate unique usernames for legacy users
  CREATE OR REPLACE FUNCTION generate_unique_username_temp(p_display_name TEXT, p_email TEXT) 
  RETURNS TEXT AS $fn$
  DECLARE
      v_base TEXT;
      v_test TEXT;
      v_counter INT := 2;
      v_exists BOOLEAN;
  BEGIN
      v_base := COALESCE(p_display_name, SPLIT_PART(p_email, '@', 1));
      v_base := LOWER(v_base);
      v_base := REGEXP_REPLACE(v_base, '[^a-z0-9_.-]', '-', 'g');
      v_base := REGEXP_REPLACE(v_base, '[-_.]+', '-', 'g');
      v_base := REGEXP_REPLACE(v_base, '^[-_.]+|[-_.]+$', '', 'g');
      IF LENGTH(v_base) < 3 THEN
          v_base := RPAD(v_base, 3, '0');
      END IF;
      IF LENGTH(v_base) > 25 THEN
          v_base := SUBSTRING(v_base FROM 1 FOR 25);
      END IF;
      IF v_base IN ('admin', 'administrator', 'root', 'support', 'help', 'api', 'login', 'logout', 'signup', 'register', 'settings', 'account', 'profile', 'profiles', 'user', 'users', 'home', 'about', 'contact', 'privacy', 'terms', 'search', 'news', 'article', 'articles', 'magazine', 'chaupal', 'community', 'dashboard', 'cms', 'editor', 'staff', 'team', 'official', 'yuvakshar') THEN
          v_base := v_base || '-official';
      END IF;
      v_test := v_base;
      LOOP
          SELECT EXISTS (
              SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_test)
          ) INTO v_exists;
          IF NOT v_exists THEN
              RETURN v_test;
          END IF;
          v_test := SUBSTRING(v_base FROM 1 FOR (30 - LENGTH(v_counter::TEXT) - 1)) || '-' || v_counter;
          v_counter := v_counter + 1;
      END LOOP;
  END;
  $fn$ LANGUAGE plpgsql;

  -- 3. Backfill any NULL, empty, or invalid usernames
  UPDATE public.profiles
  SET username = generate_unique_username_temp(display_name, email)
  WHERE username IS NULL OR username = '' OR NOT (username ~ '^[a-zA-Z0-9_.-]{3,30}$');

  -- 4. Clean up the temporary helper function
  DROP FUNCTION IF EXISTS generate_unique_username_temp(TEXT, TEXT);

  -- 5. Enforce NOT NULL constraint on username
  ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

  -- 6. Add the relaxed check constraint allowing hyphens and periods
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check 
      CHECK (
          username ~ '^[a-zA-Z0-9_.-]{3,30}$'
      );

  -- 7. Ensure case-insensitive unique index exists
  CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(LOWER(username));

END $$;

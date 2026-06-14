-- ==========================================
-- Migration: Add Username to Profiles
-- Purpose: Enforce unique usernames for public profiles
-- ==========================================

-- 1. Add columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50),
ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS previous_username VARCHAR(50);

-- 2. Function to generate unique usernames from email deterministically
CREATE OR REPLACE FUNCTION generate_unique_username(p_email VARCHAR) 
RETURNS VARCHAR AS $$
DECLARE
    base_username VARCHAR;
    test_username VARCHAR;
    counter INTEGER := 1;
    username_exists BOOLEAN;
BEGIN
    -- Extract part before @, remove non-alphanumeric
    base_username := regexp_replace(split_part(p_email, '@', 1), '[^a-zA-Z0-9_]', '', 'g');
    
    -- Ensure min length 3
    IF length(base_username) < 3 THEN
        base_username := rpad(base_username, 3, '0');
    END IF;

    -- Ensure max length 30
    IF length(base_username) > 30 THEN
        base_username := substr(base_username, 1, 30);
    END IF;

    -- Ensure it doesn't start/end with underscore or have consecutive
    base_username := trim(both '_' from regexp_replace(base_username, '_+', '_', 'g'));

    test_username := base_username;

    -- Loop until unique
    LOOP
        SELECT EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(test_username)) INTO username_exists;
        IF NOT username_exists THEN
            RETURN test_username;
        END IF;
        
        test_username := base_username || counter::TEXT;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Populate existing users
DO $$
DECLARE
    r RECORD;
    new_username VARCHAR;
BEGIN
    FOR r IN SELECT id, email FROM profiles WHERE username IS NULL LOOP
        new_username := generate_unique_username(r.email);
        UPDATE profiles SET username = new_username WHERE id = r.id;
        RAISE NOTICE 'Migrated % to username: %', r.email, new_username;
    END LOOP;
END $$;

-- 4. Apply Constraints and Indexes
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT profiles_username_check 
    CHECK (
        username ~ '^[a-zA-Z0-9][a-zA-Z0-9_]{1,28}[a-zA-Z0-9]$' 
        AND username NOT LIKE '%__%'
        AND length(username) BETWEEN 3 AND 30
    );

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(LOWER(username));

-- Drop the temporary function
DROP FUNCTION generate_unique_username(VARCHAR);

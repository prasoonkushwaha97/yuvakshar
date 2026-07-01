-- 032_universal_identity.sql
-- Phase 4: Username History & Profile Validation

CREATE TABLE IF NOT EXISTS public.username_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    old_username TEXT NOT NULL,
    new_username TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup when a user visits an old URL like /u/[old_username]
CREATE INDEX IF NOT EXISTS username_history_old_username_idx ON public.username_history(old_username);
CREATE INDEX IF NOT EXISTS username_history_user_id_idx ON public.username_history(user_id);

-- Alter profiles to add verification flags for UserIdentity badge rendering if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified') THEN
        ALTER TABLE public.profiles ADD COLUMN verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_type') THEN
        ALTER TABLE public.profiles ADD COLUMN verification_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'badge_color') THEN
        ALTER TABLE public.profiles ADD COLUMN badge_color TEXT;
    END IF;
END $$;

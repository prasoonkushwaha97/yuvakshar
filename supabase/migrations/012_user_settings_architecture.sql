-- 012_user_settings_architecture.sql

-- 1. Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    appearance JSONB DEFAULT '{"theme": "system", "fontSize": "medium", "readingWidth": "standard", "reducedMotion": false, "highContrast": false}'::jsonb,
    notifications JSONB DEFAULT '{"email": true, "inApp": true, "digest": "weekly", "community": true, "comments": true, "mentions": true, "editorial": true, "newsletter": true}'::jsonb,
    privacy JSONB DEFAULT '{"profileVisibility": "public", "activityVisibility": "public", "searchable": true}'::jsonb,
    language JSONB DEFAULT '{"interfaceLanguage": "hi", "contentLanguage": "hi", "bilingualMode": false}'::jsonb,
    future_2fa_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = id);
    
CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create user_login_history table
CREATE TABLE IF NOT EXISTS public.user_login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    device_info TEXT,
    location TEXT,
    success BOOLEAN DEFAULT true,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history" ON public.user_login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert login history" ON public.user_login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Automatic trigger for user_settings
CREATE OR REPLACE FUNCTION public.handle_new_user_settings() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_create_settings ON public.profiles;
CREATE TRIGGER on_profile_created_create_settings
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- 4. Backfill settings for existing users
INSERT INTO public.user_settings (id)
SELECT id FROM public.profiles
ON CONFLICT (id) DO NOTHING;

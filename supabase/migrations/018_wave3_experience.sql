-- Migration 018: Wave 3 - Experience Layer (Homepage, Settings, Navigation, Partners)

-- 1. Settings Table (Key-Value pair for JSON configurations)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Homepage Layouts
CREATE TABLE IF NOT EXISTS public.homepage_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Navigation Menus
CREATE TABLE IF NOT EXISTS public.navigation_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Partners
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_site_settings
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_homepage_layouts
    BEFORE UPDATE ON public.homepage_layouts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_navigation_menus
    BEFORE UPDATE ON public.navigation_menus
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_partners
    BEFORE UPDATE ON public.partners
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Public can read site settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage site settings"
    ON public.site_settings FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('Admin', 'Super Admin', 'Founder')
        )
    );

-- RLS Policies for homepage_layouts
CREATE POLICY "Public can read published homepage layouts"
    ON public.homepage_layouts FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins and Editors can manage homepage layouts"
    ON public.homepage_layouts FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('Admin', 'Super Admin', 'Founder', 'Managing Editor', 'Editor-in-Chief')
        )
    );

-- RLS Policies for navigation_menus
CREATE POLICY "Public can read navigation menus"
    ON public.navigation_menus FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage navigation menus"
    ON public.navigation_menus FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('Admin', 'Super Admin', 'Founder')
        )
    );

-- RLS Policies for partners
CREATE POLICY "Public can read active partners"
    ON public.partners FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage partners"
    ON public.partners FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('Admin', 'Super Admin', 'Founder')
        )
    );

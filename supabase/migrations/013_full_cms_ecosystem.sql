-- ==============================================================================
-- 013_full_cms_ecosystem.sql
-- Massive schema transformation to full database-driven CMS architecture
-- Removes hardcoded settings and establishes dynamic structure for all modules
-- ==============================================================================

BEGIN;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS group_name VARCHAR(100) DEFAULT 'general';
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;


-- 1. ENHANCE CATEGORIES (Parent Category Support)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 2. TAG MANAGEMENT
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 3. NAVIGATION MANAGEMENT
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'Main Header', 'Footer', 'Mobile Bottom'
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES public.navigation_menus(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  url VARCHAR(1024) NOT NULL,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  target VARCHAR(20) DEFAULT '_self', -- e.g., '_blank'
  required_role VARCHAR(100), -- optionally limit visibility by role
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SITE SETTINGS SYSTEM (Key-Value configuration for high flexibility)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  group_name VARCHAR(100) DEFAULT 'general', -- e.g., 'general', 'social', 'contact', 'adsense'
  is_public BOOLEAN DEFAULT true, -- If true, safe to expose to unauthenticated frontend
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. THEME MANAGEMENT (Global theme settings)
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name VARCHAR(50) NOT NULL UNIQUE, -- 'light', 'dark'
  variables JSONB NOT NULL, -- e.g., {"--primary": "#ff0000", "--background": "#ffffff"}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. HOMEPAGE BUILDER
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type VARCHAR(100) NOT NULL, -- 'hero', 'featured_articles', 'trending', 'magazine', 'community', 'ad'
  title VARCHAR(255),
  subtitle TEXT,
  configuration JSONB DEFAULT '{}'::jsonb, -- dynamic config (e.g. category to pull from, layout style)
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. MEDIA LIBRARY
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(2048) NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- 'image/jpeg', 'video/mp4'
  file_size BIGINT,
  alt_text VARCHAR(500),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  bucket_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ADVERTISEMENT MANAGEMENT
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  placement_id VARCHAR(100) NOT NULL, -- 'homepage_top', 'sidebar', 'in_article'
  ad_code TEXT NOT NULL, -- HTML/JS or image URL
  ad_type VARCHAR(50) DEFAULT 'custom', -- 'adsense', 'custom', 'sponsored'
  target_url VARCHAR(1024),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. SEO MANAGEMENT
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path VARCHAR(255) NOT NULL UNIQUE, -- '/', '/about', '/categories/*'
  meta_title VARCHAR(255),
  meta_description TEXT,
  open_graph_image VARCHAR(1024),
  twitter_card VARCHAR(100),
  canonical_url VARCHAR(1024),
  structured_data JSONB,
  robots VARCHAR(100) DEFAULT 'index, follow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(100) NOT NULL UNIQUE, -- 'community_module', 'magazine_module', 'ai_features'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rules JSONB DEFAULT '{}'::jsonb, -- e.g., {"allowed_roles": ["founder", "admin"]}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Helper function assumption: auth_has_any_role exists and checks roles.
-- If not, we will just use basic authenticated checks or standard admin role checks.

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Read policies (Public for most frontend tables)
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Article Tags are viewable by everyone" ON public.article_tags;
CREATE POLICY "Article Tags are viewable by everyone" ON public.article_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Navigation Menus are viewable by everyone" ON public.navigation_menus;
CREATE POLICY "Navigation Menus are viewable by everyone" ON public.navigation_menus FOR SELECT USING (true);
DROP POLICY IF EXISTS "Navigation Items are viewable by everyone" ON public.navigation_items;
CREATE POLICY "Navigation Items are viewable by everyone" ON public.navigation_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Site Settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Public Site Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (is_public = true);
DROP POLICY IF EXISTS "Theme Settings are viewable by everyone" ON public.theme_settings;
CREATE POLICY "Theme Settings are viewable by everyone" ON public.theme_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Homepage Sections are viewable by everyone" ON public.homepage_sections;
CREATE POLICY "Homepage Sections are viewable by everyone" ON public.homepage_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Media Files are viewable by everyone" ON public.media_files;
CREATE POLICY "Media Files are viewable by everyone" ON public.media_files FOR SELECT USING (true);
DROP POLICY IF EXISTS "Advertisements are viewable by everyone" ON public.advertisements;
CREATE POLICY "Advertisements are viewable by everyone" ON public.advertisements FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "SEO Settings are viewable by everyone" ON public.seo_settings;
CREATE POLICY "SEO Settings are viewable by everyone" ON public.seo_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Feature Flags are viewable by everyone" ON public.feature_flags;
CREATE POLICY "Feature Flags are viewable by everyone" ON public.feature_flags FOR SELECT USING (true);

-- Admin read for private settings
DROP POLICY IF EXISTS "Admins can view private settings" ON public.site_settings;
CREATE POLICY "Admins can view private settings" ON public.site_settings FOR SELECT 
USING (public.auth_has_any_role(ARRAY['founder', 'admin']));

-- Write policies (Admins / Founders only for global configs)
DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags" ON public.tags USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
DROP POLICY IF EXISTS "Admins can manage article_tags" ON public.article_tags;
CREATE POLICY "Admins can manage article_tags" ON public.article_tags USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor', 'author']));
DROP POLICY IF EXISTS "Admins can manage navigation_menus" ON public.navigation_menus;
CREATE POLICY "Admins can manage navigation_menus" ON public.navigation_menus USING (public.auth_has_any_role(ARRAY['founder', 'admin']));
DROP POLICY IF EXISTS "Admins can manage navigation_items" ON public.navigation_items;
CREATE POLICY "Admins can manage navigation_items" ON public.navigation_items USING (public.auth_has_any_role(ARRAY['founder', 'admin']));
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings" ON public.site_settings USING (public.auth_has_any_role(ARRAY['founder', 'admin']));
DROP POLICY IF EXISTS "Admins can manage theme_settings" ON public.theme_settings;
CREATE POLICY "Admins can manage theme_settings" ON public.theme_settings USING (public.auth_has_any_role(ARRAY['founder', 'admin']));
DROP POLICY IF EXISTS "Admins can manage homepage_sections" ON public.homepage_sections;
CREATE POLICY "Admins can manage homepage_sections" ON public.homepage_sections USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
DROP POLICY IF EXISTS "Admins can manage media_files" ON public.media_files;
CREATE POLICY "Admins can manage media_files" ON public.media_files USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor', 'author']));
DROP POLICY IF EXISTS "Admins can manage advertisements" ON public.advertisements;
CREATE POLICY "Admins can manage advertisements" ON public.advertisements USING (public.auth_has_any_role(ARRAY['founder', 'admin']));
DROP POLICY IF EXISTS "Admins can manage seo_settings" ON public.seo_settings;
CREATE POLICY "Admins can manage seo_settings" ON public.seo_settings USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
DROP POLICY IF EXISTS "Admins can manage feature_flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature_flags" ON public.feature_flags USING (public.auth_has_any_role(ARRAY['founder', 'admin']));

-- Seed some default values
INSERT INTO public.site_settings (key, value, description, is_public) VALUES 
('site_name', '"युवाक्षर (Yuvakshar)"', 'The global name of the website', true),
('tagline', '"युवाओं का अक्षर"', 'Website tagline', true),
('logo_url', '"/logo.png"', 'Main logo URL', true),
('contact_email', '"contact@yuvakshar.com"', 'Public contact email', true),
('social_links', '{"facebook": "", "twitter": "", "instagram": "", "youtube": ""}', 'Social media links', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.feature_flags (flag_key, name, description, is_enabled) VALUES 
('community_module', 'Community Features', 'Enables groups, discussions, and user interactions', true),
('magazine_module', 'Magazine E-Editions', 'Enables the monthly magazine module', true),
('podcast_module', 'Podcasts', 'Enables audio content sections', false),
('video_module', 'Video Series', 'Enables video content sections', false)
ON CONFLICT (flag_key) DO NOTHING;

COMMIT;

ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS group_name VARCHAR(100) DEFAULT 'general';
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Migration 015: Homepage Editorial CMS & Operating System Architecture

-- 1. Homepage Editions Table
CREATE TABLE IF NOT EXISTS public.homepage_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'national', 'mp', 'sports', 'en-national'
  language VARCHAR(50) DEFAULT 'hi',
  region VARCHAR(100) DEFAULT 'IN',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default editions
INSERT INTO public.homepage_editions (name, slug, language, region, is_default, is_active)
VALUES 
  ('राष्ट्रीय संस्करण', 'national', 'hi', 'IN', true, true),
  ('मध्य प्रदेश संस्करण', 'mp', 'hi', 'IN', false, true),
  ('उत्तर प्रदेश संस्करण', 'up', 'hi', 'IN', false, true),
  ('Sports Edition', 'sports', 'en', 'IN', false, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Immutable Layout Version Metadata (Linked to Editions)
CREATE TABLE IF NOT EXISTS public.homepage_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.homepage_editions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Review', 'Approved', 'Scheduled', 'Published', 'Archived'
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- 3. Reusable Content Blocks Table
CREATE TABLE IF NOT EXISTS public.homepage_reusable_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type VARCHAR(100) NOT NULL, -- 'alert', 'banner', 'notice', 'custom_html'
  name VARCHAR(255) NOT NULL,
  content_html TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- Seed fallback internal promos as reusable blocks
INSERT INTO public.homepage_reusable_blocks (block_type, name, content_html, configuration)
VALUES 
  ('banner', 'युवाक्षर योगदानकर्ता आमंत्रण', '📚 <b>युवाक्षर लेखक बनें</b><br/>अपनी कविता, कहानी या विचार लेख को संपादकीय समीक्षा के लिए भेजें।', '{"bg": "saffron", "link": "/submit-article"}'),
  ('alert', 'आपातकालीन सूचना पट्टी', '📢 <b>विशेष रिपोर्ट:</b> भारत की नई शिक्षा नीतियों के सकारात्मक प्रभाव पर विस्तृत समीक्षा पढ़ें।', '{"bg": "red", "link": "/category/शिक्षा"}')
ON CONFLICT DO NOTHING;

-- 4. Normalized Homepage Sections (First-class Columns)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homepage_layout_id UUID REFERENCES public.homepage_layouts(id) ON DELETE CASCADE,
  reusable_block_id UUID REFERENCES public.homepage_reusable_blocks(id) ON DELETE SET NULL,
  section_type VARCHAR(100) NOT NULL, -- 'hero', 'trending', 'opinion', 'videos', 'magazine', etc.
  title VARCHAR(255),
  subtitle TEXT,
  category VARCHAR(150),
  layout_variant VARCHAR(100) DEFAULT 'standard',
  display_order INTEGER DEFAULT 0,
  article_limit INTEGER DEFAULT 4,
  is_visible BOOLEAN DEFAULT true,
  feature_flag VARCHAR(50) DEFAULT 'enabled', -- 'enabled', 'beta', 'internal', 'seasonal', 'experimental'
  configuration_json JSONB DEFAULT '{}'::jsonb, -- dynamic spacing, colors etc
  private_notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Index for layout ordered lists
CREATE INDEX IF NOT EXISTS idx_homepage_sections_layout_order 
ON public.homepage_sections (homepage_layout_id, display_order ASC);

-- 5. Managed Assets Table
CREATE TABLE IF NOT EXISTS public.homepage_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homepage_section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  device_target VARCHAR(50) DEFAULT 'desktop', -- 'desktop', 'mobile'
  theme_target VARCHAR(50) DEFAULT 'light', -- 'light', 'dark'
  image_url VARCHAR(2048) NOT NULL,
  alt_text VARCHAR(500),
  credit VARCHAR(255),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Pinned Articles Linkage (Normalized Table)
CREATE TABLE IF NOT EXISTS public.homepage_section_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homepage_layout_id UUID REFERENCES public.homepage_layouts(id) ON DELETE CASCADE,
  homepage_section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 7. Ingestion Event Bus logs (Raw Ingestion for Performance)
CREATE TABLE IF NOT EXISTS public.homepage_section_raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- 'impression', 'click'
  device VARCHAR(50) DEFAULT 'desktop',
  country VARCHAR(100) DEFAULT 'IN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Aggregated Section Analytics (Dashboard Reporting)
CREATE TABLE IF NOT EXISTS public.homepage_section_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  average_read_time INTEGER DEFAULT 0, -- in seconds
  scroll_depth INTEGER DEFAULT 0, -- percentage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Section Editing Locks (Heartbeat Mapping)
CREATE TABLE IF NOT EXISTS public.homepage_section_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  locked_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 10. Editorial Audit Logs
CREATE TABLE IF NOT EXISTS public.homepage_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(100) NOT NULL, -- 'Layout Published', 'Preset Applied', 'Section Lock Acquired', etc.
  details TEXT,
  section_id UUID,
  previous_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Editorial Notifications Log
CREATE TABLE IF NOT EXISTS public.homepage_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_role VARCHAR(50) NOT NULL, -- 'editor', 'admin', 'founder'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security & Policies
ALTER TABLE public.homepage_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_reusable_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_notifications ENABLE ROW LEVEL SECURITY;

-- Select policies (viewable by everyone/public)
CREATE POLICY "homepage_editions_public_select" ON public.homepage_editions FOR SELECT USING (true);
CREATE POLICY "homepage_layouts_public_select" ON public.homepage_layouts FOR SELECT USING (true);
CREATE POLICY "homepage_reusable_blocks_public_select" ON public.homepage_reusable_blocks FOR SELECT USING (true);
CREATE POLICY "homepage_sections_public_select" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "homepage_assets_public_select" ON public.homepage_assets FOR SELECT USING (true);
CREATE POLICY "homepage_section_articles_public_select" ON public.homepage_section_articles FOR SELECT USING (true);
CREATE POLICY "homepage_section_analytics_public_select" ON public.homepage_section_analytics FOR SELECT USING (true);

-- Ingestion write policies (writable by anyone, i.e., client page tracking)
CREATE POLICY "homepage_section_raw_events_insert" ON public.homepage_section_raw_events FOR INSERT WITH CHECK (true);

-- Manage policies (Founder / Admin / Editor roles only)
CREATE POLICY "homepage_editions_admin_all" ON public.homepage_editions 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_layouts_admin_all" ON public.homepage_layouts 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_reusable_blocks_admin_all" ON public.homepage_reusable_blocks 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_sections_admin_all" ON public.homepage_sections 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_assets_admin_all" ON public.homepage_assets 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_section_articles_admin_all" ON public.homepage_section_articles 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_section_locks_admin_all" ON public.homepage_section_locks 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_audit_logs_admin_all" ON public.homepage_audit_logs 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "homepage_notifications_admin_all" ON public.homepage_notifications 
  USING (public.auth_has_any_role(ARRAY['founder', 'admin', 'editor']));

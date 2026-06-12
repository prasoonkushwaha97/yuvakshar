-- ==========================================
-- YUVAKSHAR CORE SCHEMA
-- ==========================================
-- Tables: 7
-- Purpose: Complete data model for production
-- Risk Level: Low (schema only, no data)
-- ==========================================

-- 1. CATEGORIES TABLE
-- Purpose: Article categories (विभाग)
-- Strategy: Lookup table, referenced by articles

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_hi VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description_hi TEXT,
  description_en TEXT,
  color VARCHAR(7) DEFAULT '#EA580C',
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE categories IS 'Article categories/sections (विभाग)';
COMMENT ON COLUMN categories.slug IS 'URL-safe identifier';
COMMENT ON COLUMN categories.color IS 'Hex color for UI';
COMMENT ON COLUMN categories.sort_order IS 'Display order in UI';

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- ==========================================

-- 2. PROFILES TABLE
-- Purpose: User profiles and metadata
-- Strategy: One-to-one with auth.users (will link in Phase F)

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  display_name VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'Free Member',
  membership VARCHAR(50) DEFAULT 'Free',
  status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '{}'::JSONB,
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_articles_written INTEGER DEFAULT 0,
  total_articles_read INTEGER DEFAULT 0,
  total_reading_time INTEGER DEFAULT 0,
  category_stats JSONB DEFAULT '{}'::JSONB,
  referral_code VARCHAR(20),
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles and metadata';
COMMENT ON COLUMN profiles.role IS 'Free Member, Premium Member, Patron Member, Editor, Author, Owner';
COMMENT ON COLUMN profiles.membership IS 'Free, Premium, Patron - subscription tier';
COMMENT ON COLUMN profiles.status IS 'active, suspended, deactivated';
COMMENT ON COLUMN profiles.total_reading_time IS 'Total minutes spent reading';
COMMENT ON COLUMN profiles.category_stats IS 'JSON: {category_name: read_count}';
COMMENT ON COLUMN profiles.referral_code IS 'Unique code for referrals';

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status) WHERE status = 'active';
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_membership ON profiles(membership);
CREATE INDEX idx_profiles_referral ON profiles(referral_code);

-- ==========================================

-- 3. ARTICLES TABLE
-- Purpose: Published articles and content
-- Strategy: Core content table, links to categories & profiles

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_hi VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary_hi TEXT,
  summary_en TEXT,
  content TEXT NOT NULL,
  cover_image VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  content_type VARCHAR(50) DEFAULT 'News',
  access_level VARCHAR(50) DEFAULT 'Free',
  section VARCHAR(50) DEFAULT 'article',
  is_featured BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  requires_eic_approval BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  language VARCHAR(10) DEFAULT 'hi'
);

COMMENT ON TABLE articles IS 'Published articles and content';
COMMENT ON COLUMN articles.status IS 'Draft, Review, Published, Archived, Rejected';
COMMENT ON COLUMN articles.content_type IS 'News, Opinion, Literature, Video, Education, Tutorial';
COMMENT ON COLUMN articles.access_level IS 'Free, Premium, Patron - who can read';
COMMENT ON COLUMN articles.section IS 'article, editorial, news, opinion, column';
COMMENT ON COLUMN articles.language IS 'hi, en - content language';

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status) WHERE status = 'Published';
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_featured ON articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_articles_access ON articles(access_level);
CREATE INDEX idx_articles_created ON articles(created_at DESC);

-- ==========================================

-- 4. MEMBERSHIPS TABLE
-- Purpose: User membership records and subscriptions
-- Strategy: Track membership changes over time

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50),
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  payment_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE memberships IS 'User membership subscriptions';
COMMENT ON COLUMN memberships.tier IS 'Free, Premium, Patron, Founding';
COMMENT ON COLUMN memberships.status IS 'active, expired, cancelled, paused';
COMMENT ON COLUMN memberships.payment_method IS 'card, upi, bank_transfer, referral, complimentary';

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status) WHERE status = 'active';
CREATE INDEX idx_memberships_expires ON memberships(expires_at);
CREATE INDEX idx_memberships_tier ON memberships(tier);

-- ==========================================

-- 5. BOOKMARKS TABLE
-- Purpose: User article bookmarks (favorites)
-- Strategy: Many-to-many relationship between users and articles

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  collection VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, article_id)
);

COMMENT ON TABLE bookmarks IS 'User bookmarked articles';
COMMENT ON COLUMN bookmarks.collection IS 'Optional collection name (e.g., "To Read", "Favorites")';

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article ON bookmarks(article_id);
CREATE INDEX idx_bookmarks_collection ON bookmarks(user_id, collection);
CREATE INDEX idx_bookmarks_created ON bookmarks(created_at DESC);

-- ==========================================

-- 6. COMMENTS TABLE
-- Purpose: Article comments and discussions
-- Strategy: Nested threaded comments (parent_id for replies)

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  likes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE comments IS 'Article comments and threaded discussions';
COMMENT ON COLUMN comments.status IS 'pending, approved, rejected, spam, hidden';
COMMENT ON COLUMN comments.parent_id IS 'Null for top-level, UUID for replies';

CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status) WHERE status = 'approved';
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- ==========================================

-- 7. MAGAZINES TABLE
-- Purpose: Magazine issues and collections
-- Strategy: Grouped articles into periodic magazines/editions

CREATE TABLE IF NOT EXISTS magazines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_hi VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  description_hi TEXT,
  description_en TEXT,
  cover_image VARCHAR(500),
  issue_number INTEGER,
  month VARCHAR(2),
  year VARCHAR(4),
  issue_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'Draft',
  is_published BOOLEAN DEFAULT false,
  pdf_url VARCHAR(500),
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE magazines IS 'Magazine issues and collections';
COMMENT ON COLUMN magazines.status IS 'Draft, Review, Published, Archived';
COMMENT ON COLUMN magazines.issue_date IS 'Publication date of the issue';

CREATE INDEX idx_magazines_slug ON magazines(slug);
CREATE INDEX idx_magazines_status ON magazines(status) WHERE status = 'Published';
CREATE INDEX idx_magazines_issue ON magazines(issue_number, year);
CREATE INDEX idx_magazines_published ON magazines(is_published) WHERE is_published = true;
CREATE INDEX idx_magazines_created ON magazines(created_at DESC);

-- ==========================================
-- SCHEMA COMPLETION VERIFICATION
-- ==========================================

-- Verify all tables created
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'profiles', 'articles', 'memberships', 'bookmarks', 'comments', 'magazines')
ORDER BY tablename;

-- Expected result: 7 rows with table names and column counts
-- ==========================================

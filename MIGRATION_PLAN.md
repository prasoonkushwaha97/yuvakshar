# YUVAKSHAR PRODUCTION MIGRATION PLAN
## Next.js + TypeScript → Supabase Complete Architecture Refactor

**Status**: CRITICAL - Production Ready Audit Required  
**Deployment Target**: Vercel (existing)  
**Database Target**: Supabase PostgreSQL  
**Scope**: Full backend system refactor + localStorage elimination

---

## EXECUTIVE SUMMARY

### Current State
- **Frontend**: Next.js (React) - ✅ Production ready
- **Authentication**: 50% Mock + 50% Supabase (inconsistent)
- **Data Storage**: 95% localStorage, 5% Supabase
- **OTP Implementation**: Hardcoded "123456" with fake email generation
- **Content**: Localhost has full data, Production is empty
- **Database**: Partially configured Supabase (some tables exist, most unused)
- **Risk Level**: 🔴 CRITICAL - No production data persistence

### Target State
- **Authentication**: 100% Real Supabase Auth (Email OTP + Google OAuth)
- **Data Storage**: 100% Supabase PostgreSQL (localStorage = cache only)
- **Content**: Unified single-source-of-truth across all environments
- **Risk Level**: 🟢 SAFE - Full redundancy + audit trail

---

## PART A: COMPLETE AUDIT FINDINGS

### A1. localStorage Usage (39 instances found)

```javascript
// ✗ SESSION MANAGEMENT
localStorage.getItem("yuvakshar_session_user")     // Current logged-in user
localStorage.getItem("yuvakshar_founding_slots")   // Founding member availability

// ✗ CONTENT STORAGE
localStorage.getItem("yuvakshar_articles")         // 40+ articles
localStorage.getItem("yuvakshar_magazines")        // 25+ magazine issues
localStorage.getItem("yuvakshar_categories")       // 10 categories
localStorage.getItem("yuvakshar_comments")         // Comments on articles
localStorage.getItem("yuvakshar_submissions")      // User submissions
localStorage.getItem("yuvakshar_tags")             // Article tags
localStorage.getItem("yuvakshar_videos")           // Video links

// ✗ PERSONALIZATION
localStorage.getItem("yuvakshar_bookmarks_${userId}")      // Bookmarked articles
localStorage.getItem("yuvakshar_notes_${userId}")          // User study notes
localStorage.getItem("yuvakshar_study_history")            // Study session tracking

// ✗ SETTINGS & PREFERENCES
localStorage.getItem("yuvakshar_settings")         // Site appearance
localStorage.getItem("yuvakshar_theme")            // Light/dark mode
localStorage.getItem("yuvakshar_high_contrast")    // Accessibility
localStorage.getItem("yuvakshar_font_scale")       // Font size
localStorage.getItem("yuvakshar_accessible_font")  // Font family
localStorage.getItem("yuvakshar_timer_settings")   // Study timer
localStorage.getItem("yuvakshar_locale")           // Hindi/English

// ✗ SEARCH & ANALYTICS
localStorage.getItem("yuvakshar_search_logs")      // Search queries
localStorage.getItem("RECENT_SEARCHES")            // Recent search history
localStorage.getItem("yuvakshar_activity_logs")    // User activity

// ✗ MEMBERSHIPS & PAYMENTS
localStorage.getItem("yuvakshar_memberships")      // Active memberships
localStorage.getItem("yuvakshar_payments")         // Payment history
localStorage.getItem("yuvakshar_coupons")          // Discount codes
localStorage.getItem("yuvakshar_referrals")        // Referral tracking
localStorage.getItem("yuvakshar_donations")        // Donation records

// ✗ NEWSLETTER & SUBSCRIBERS
localStorage.getItem("yuvakshar_subscribers")      // Newsletter emails
localStorage.getItem("yuvakshar_campaigns")        // Newsletter campaigns

// ✗ QUIZ & LEARNING
localStorage.getItem("yuvakshar_quizzes")          // Quiz questions
localStorage.getItem("yuvakshar_quiz_attempts")    // Quiz results
localStorage.getItem("yuvakshar_quiz_certificates")// Certificate data
localStorage.getItem("yuvakshar_quiz_settings")    // Quiz config
localStorage.getItem("yuvakshar_quiz_leaderboard") // Leaderboard

// ✗ AI & ADVANCED
localStorage.getItem("yuvakshar_ai_settings")      // AI module config
localStorage.getItem("yuvakshar_ai_notes")         // AI-generated notes

// ✗ ADMIN & CMS
localStorage.getItem("yuvakshar_users")            // User database
localStorage.getItem("yuvakshar_assignments")      // Editorial assignments
localStorage.getItem("yuvakshar_layouts")          // Homepage layout config
localStorage.getItem("yuvakshar_ads")              // Ad configurations
```

### A2. Mock Authentication Flows (3 attack vectors)

#### Vector 1: Hardcoded OTP
```tsx
// AuthModal.tsx:185
if (joinedCode === "123456" || (joinedCode.length === 6 && joinedCode === "123456")) {
  // ANY user can login with OTP "123456" + ANY phone number
  const success = await loginUser(`${mobileNum}@yuvakshar-otp.com`, "Subscriber");
}
```

**Risk**: Publicly known bypass, anyone can impersonate anyone

#### Vector 2: Fake Email Generation
```tsx
// AuthModal.tsx:190
await loginUser(`${mobileNum}@yuvakshar-otp.com`, "Subscriber");
```

**Problem**: 
- User "9876543210" becomes "9876543210@yuvakshar-otp.com"
- No validation that this email exists
- No OTP actually sent
- No verification of phone ownership

#### Vector 3: Dynamic User Creation with No Verification
```tsx
// CmsContext.tsx:1192-1203
const mockProfile: Profile = {
  id: "mock-uid-" + Math.floor(Math.random() * 1000),
  name: finalName,
  email: email,  // ← Not verified
  role: finalRole,
  // ← No auth token, no session validation
};
```

**Problem**: Random UUIDs create profile conflicts

### A3. Partially Configured Supabase Tables

Tables created but unused:
- ✓ `profiles` - Empty, CmsContext has parallel `users` array
- ✓ `articles` - Empty, CmsContext uses localStorage
- ✓ `categories` - Empty
- ✓ `comments` - Empty
- ✓ `subscribers` - Partially populated in `loadDataFromSupabase()`
- ✓ `site_settings` - Unused
- ✓ `editorial_assignments` - Empty
- ✗ `bookmarks` - Missing table
- ✗ `study_progress` - Missing table
- ✗ `quiz_attempts` - Missing table (data in localStorage)
- ✗ `certificates` - Missing table (data in localStorage)

### A4. Environment Inconsistencies

| Aspect | Localhost | Production |
|--------|-----------|-----------|
| Database | localStorage | Supabase (unconfigured) |
| Auth | Mock (hardcoded OTP) | Supabase (non-functional) |
| Content | 40+ articles via mockData | EMPTY |
| Users | Mock users + localStorage | EMPTY |
| Login | "123456" bypass | Login fails |

---

## PART B: DATABASE SCHEMA (Complete SQL)

### B1. Core Tables (Immediate)

```sql
-- ============================================
-- 1. AUTHENTICATION & PROFILES
-- ============================================

CREATE TABLE auth.email_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  role TEXT CHECK (role IN (
    'Owner', 'Admin', 'Editor-in-Chief', 'Managing Editor', 
    'Editor', 'Sub Editor', 'Fact Checker', 'Reviewer', 
    'Author', 'Contributor', 'Fact Check Reviewer', null
  )),
  membership TEXT DEFAULT 'Free' CHECK (membership IN (
    'Free', 'Premium', 'Patron', 'Founding', 'Institutional', 'Lifetime'
  )),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  password_hash TEXT, -- For legacy/backup password auth
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  
  -- Reading Analytics
  articles_read_count INT DEFAULT 0,
  total_reading_time_minutes INT DEFAULT 0,
  category_stats JSONB DEFAULT '{}', -- {"news": 5, "opinion": 3}
  views_count INT DEFAULT 0,
  
  -- Join & Activity
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  -- Referral
  referral_rewards_earned INT DEFAULT 0,
  referred_by_id UUID REFERENCES public.profiles(id),
  
  -- Additional
  interests TEXT[] DEFAULT '{}',
  dob DATE,
  gender TEXT,
  location TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 2. CONTENT: ARTICLES & MAGAZINES
-- ============================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  language_code TEXT DEFAULT 'hi' CHECK (language_code IN ('hi', 'en')),
  icon_emoji TEXT,
  color_hex TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  language_code TEXT DEFAULT 'hi',
  usage_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL, -- Full markdown content
  
  -- Metadata
  category_id UUID NOT NULL REFERENCES public.categories(id),
  section TEXT DEFAULT 'article', -- 'article', 'opinion', 'interview'
  content_type TEXT DEFAULT 'News', -- 'News', 'Opinion', 'Investigation'
  language TEXT DEFAULT 'hi',
  
  -- Author
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT,
  author_role TEXT,
  
  -- Media
  cover_image_url TEXT,
  cover_image_alt TEXT,
  thumbnail_url TEXT,
  
  -- Tags
  tags UUID[] DEFAULT '{}', -- References to tags table
  
  -- Publishing
  status TEXT DEFAULT 'Draft' CHECK (status IN (
    'Draft', 'In Review', 'Scheduled', 'Published', 'Archived'
  )),
  published_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  
  -- Content Control
  access_level TEXT DEFAULT 'Free' CHECK (access_level IN (
    'Free', 'Premium', 'Patron', 'Founding'
  )),
  is_featured BOOLEAN DEFAULT FALSE,
  requires_eic_approval BOOLEAN DEFAULT FALSE,
  
  -- SEO
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Engagement
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reading_time_minutes INT,
  
  -- Editorial Workflow
  created_by_id UUID REFERENCES public.profiles(id),
  last_edited_by_id UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE public.magazines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number INT NOT NULL,
  issue_title TEXT,
  month TEXT NOT NULL, -- "June 2026"
  year TEXT NOT NULL,
  language TEXT DEFAULT 'hi',
  
  cover_image_url TEXT,
  description TEXT,
  pages_count INT,
  
  -- Content
  featured_articles UUID[] DEFAULT '{}', -- Article IDs
  table_of_contents JSONB, -- {"section": ["article1", "article2"]}
  
  -- Distribution
  access_level TEXT DEFAULT 'Free',
  pdf_url TEXT, -- S3 or CDN URL
  epub_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'Draft' CHECK (status IN (
    'Draft', 'Ready', 'Published', 'Archived'
  )),
  published_at TIMESTAMP,
  
  -- Analytics
  views_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. ENGAGEMENT: COMMENTS, BOOKMARKS, REACTIONS
-- ============================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Nested comments
  
  name TEXT NOT NULL, -- For anonymous comments
  content TEXT NOT NULL,
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'spam', 'deleted'
  )),
  is_reported BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
  
  -- Engagement
  likes_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  
  folder_id UUID REFERENCES public.bookmark_folders(id),
  note TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id) -- Prevent duplicates
);

CREATE TABLE public.bookmark_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. MEMBERSHIPS & PAYMENTS
-- ============================================

CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  membership_type TEXT NOT NULL CHECK (membership_type IN (
    'Free', 'Premium', 'Patron', 'Founding', 'Institutional', 'Lifetime'
  )),
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'suspended', 'expired', 'cancelled'
  )),
  
  -- Billing
  billing_cycle TEXT DEFAULT 'Monthly' CHECK (billing_cycle IN (
    'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'Lifetime', 'One-time'
  )),
  
  -- Dates
  start_date DATE NOT NULL,
  expiry_date DATE,
  auto_renewal BOOLEAN DEFAULT TRUE,
  
  -- Payment Integration
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  membership_id UUID REFERENCES public.memberships(id),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  
  -- Membership details
  billing_cycle TEXT,
  membership_type TEXT,
  payment_method TEXT, -- 'upi', 'credit_card', 'net_banking'
  
  -- GST
  base_amount DECIMAL(10, 2),
  cgst DECIMAL(10, 2),
  sgst DECIMAL(10, 2),
  igst DECIMAL(10, 2),
  gstin TEXT,
  sac_code TEXT,
  
  -- Invoice
  invoice_url TEXT,
  razorpay_payment_id TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'flat')),
  value DECIMAL(10, 2) NOT NULL,
  
  expiry_date DATE NOT NULL,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  applicable_to TEXT[] DEFAULT '{}', -- ['Premium', 'Patron']
  min_purchase DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id),
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'registered', 'purchased'
  )),
  
  reward_days INT DEFAULT 15, -- Days credited to referrer
  referral_date DATE,
  completion_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. LEARNING & ASSESSMENT
-- ============================================

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  
  title TEXT,
  description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  difficulty TEXT DEFAULT 'मध्यम' CHECK (difficulty IN ('सरल', 'मध्यम', 'उन्नत')),
  question_count INT DEFAULT 10,
  
  passing_score INT DEFAULT 60,
  time_limit_minutes INT,
  
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN (
    'multiple_choice', 'true_false', 'short_answer', 'essay'
  )),
  
  options JSONB, -- {"a": "Option A", "b": "Option B", ...}
  correct_answer TEXT,
  
  difficulty TEXT,
  points INT DEFAULT 1,
  explanation TEXT,
  
  is_draft BOOLEAN DEFAULT FALSE,
  display_order INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id),
  
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5, 2),
  
  answers JSONB, -- {"q1": "a", "q2": "b"}
  duration_seconds INT,
  
  passed BOOLEAN,
  certificate_id UUID,
  
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  quiz_id UUID REFERENCES public.quizzes(id),
  article_title TEXT,
  
  certificate_type TEXT CHECK (certificate_type IN (
    'सहभागिता प्रमाणपत्र',
    'उत्कृष्टता प्रमाणपत्र',
    'ज्ञानवीर प्रमाणपत्र'
  )),
  
  score INT,
  percentage DECIMAL(5, 2),
  badge_emoji TEXT,
  
  certificate_url TEXT, -- PDF download URL
  certificate_code TEXT UNIQUE,
  
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE public.quiz_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  
  score INT DEFAULT 0,
  completed_quizzes INT DEFAULT 0,
  certificates_earned INT DEFAULT 0,
  
  interval TEXT CHECK (interval IN ('weekly', 'monthly', 'alltime')),
  period_start DATE,
  period_end DATE,
  
  rank INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. PERSONALIZATION & SETTINGS
-- ============================================

CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Theme & Display
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  high_contrast BOOLEAN DEFAULT FALSE,
  font_scale TEXT DEFAULT 'base' CHECK (font_scale IN ('sm', 'base', 'lg', 'xl')),
  accessible_font BOOLEAN DEFAULT FALSE,
  
  -- Learning
  timer_enabled BOOLEAN DEFAULT TRUE,
  timer_sound BOOLEAN DEFAULT TRUE,
  timer_statistics BOOLEAN DEFAULT TRUE,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT TRUE,
  newsletter_subscribed BOOLEAN DEFAULT TRUE,
  article_notifications BOOLEAN DEFAULT TRUE,
  
  -- Privacy
  profile_public BOOLEAN DEFAULT TRUE,
  show_reading_stats BOOLEAN DEFAULT TRUE,
  allow_recommendations BOOLEAN DEFAULT TRUE,
  
  -- Language
  language TEXT DEFAULT 'hi' CHECK (language IN ('hi', 'en')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  study_date DATE NOT NULL,
  study_seconds INT DEFAULT 0,
  articles_read INT DEFAULT 0,
  quizzes_attempted INT DEFAULT 0,
  
  category_breakdown JSONB DEFAULT '{}', -- {"news": 120, "opinion": 45}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, study_date)
);

-- ============================================
-- 7. SEARCH & ANALYTICS
-- ============================================

CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  
  search_count INT DEFAULT 1,
  click_count INT DEFAULT 0,
  zero_results BOOLEAN DEFAULT FALSE,
  
  user_count INT DEFAULT 1,
  avg_position INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(search_query)
);

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. CMS & EDITORIAL
-- ============================================

CREATE TABLE public.editorial_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  
  author_id UUID REFERENCES public.profiles(id),
  reviewer_id UUID REFERENCES public.profiles(id),
  section_editor_id UUID REFERENCES public.profiles(id),
  
  deadline DATE,
  status TEXT DEFAULT 'Assigned' CHECK (status IN (
    'Assigned', 'In Progress', 'Under Review', 'Completed'
  )),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  submission_type TEXT NOT NULL CHECK (submission_type IN (
    'contact', 'feedback', 'suggestion', 'report', 'article'
  )),
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  
  subject TEXT,
  content TEXT NOT NULL,
  
  -- File Attachments
  image_url TEXT,
  pdf_url TEXT,
  doc_url TEXT,
  
  -- Admin
  status TEXT DEFAULT 'New' CHECK (status IN (
    'New', 'Open', 'In Progress', 'Resolved', 'Archived'
  )),
  category TEXT,
  
  replies JSONB DEFAULT '[]',
  assigned_to_id UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  
  description TEXT,
  data_type TEXT, -- 'string', 'json', 'array', 'boolean'
  
  updated_by_id UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.homepage_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  layout_name TEXT NOT NULL,
  layout_json JSONB NOT NULL, -- {sections: [...], order: [...]}
  
  version INT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. NEWSLETTER & OUTREACH
-- ============================================

CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  
  name TEXT,
  subscription_status TEXT DEFAULT 'Pending Verification' CHECK (subscription_status IN (
    'Pending Verification', 'Active', 'Blocked', 'Unsubscribed'
  )),
  
  verification_token TEXT UNIQUE,
  verified_at TIMESTAMP,
  
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  
  preferences JSONB DEFAULT '{"categories": []}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  subject TEXT NOT NULL,
  preview_text TEXT,
  content TEXT NOT NULL,
  
  template_id TEXT,
  
  send_status TEXT DEFAULT 'draft' CHECK (send_status IN (
    'draft', 'scheduled', 'sending', 'sent', 'failed'
  )),
  
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  recipients_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. DONATIONS & SUPPORT
-- ============================================

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  message TEXT,
  
  razorpay_payment_id TEXT,
  receipt_url TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. ADVERTISING
-- ============================================

CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  ad_name TEXT NOT NULL,
  zone TEXT CHECK (zone IN ('after_first_p', 'mid_content', 'before_related')),
  ad_type TEXT CHECK (ad_type IN ('adsense', 'custom_html', 'banner')),
  
  image_url TEXT,
  link_url TEXT,
  ad_code TEXT, -- Google AdSense code
  
  is_active BOOLEAN DEFAULT TRUE,
  impression_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_author ON public.articles(author_id);

CREATE INDEX idx_comments_article ON public.comments(article_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_status ON public.comments(status);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_article ON public.bookmarks(article_id);

CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_attempted_at ON public.quiz_attempts(attempted_at DESC);

CREATE INDEX idx_memberships_user ON public.memberships(user_id);
CREATE INDEX idx_memberships_expiry ON public.memberships(expiry_date);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

CREATE INDEX idx_search_analytics_query ON public.search_analytics(search_query);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Users can only view public profiles or their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own bookmarks
CREATE POLICY "Bookmarks are private" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own memberships
CREATE POLICY "Memberships are private" ON public.memberships
  FOR SELECT USING (auth.uid() = user_id);
```

---

## PART C: AUTHENTICATION REPLACEMENT

### C1. New Auth Service

Create `src/lib/supabaseAuth.ts`:

```typescript
import { supabase } from '@/lib/supabaseClient';

export const supabaseAuth = {
  /**
   * Send OTP to email address
   * Real Supabase OTP, not hardcoded
   */
  async sendEmailOtp(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Auto-create profile
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('OTP send failed:', error);
        return { error: error.message };
      }
      
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Verify OTP token and complete login
   */
  async verifyOtp(email: string, token: string): Promise<{ 
    user?: any; 
    session?: any; 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      
      if (error) {
        console.error('OTP verification failed:', error);
        return { error: error.message };
      }
      
      // Ensure profile exists
      if (data.user) {
        await this.ensureProfileExists(data.user);
      }
      
      return { user: data.user, session: data.session };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Google OAuth login
   */
  async signInWithGoogle(): Promise<{ 
    error?: string 
  }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Ensure user profile exists in public.profiles
   */
  async ensureProfileExists(authUser: any): Promise<void> {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .single();
    
    if (!existing) {
      // Create profile
      await supabase.from('profiles').insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        status: 'active',
        membership: 'Free',
        join_date: new Date().toISOString()
      });
    }
  },

  /**
   * Sign out user
   */
  async signOut(): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }
};

// Session state management
export const useAuthState = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check session on mount
    supabaseAuth.getUser().then(({ user }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading };
};
```

---

## PART D: COMPLETE FILE MODIFICATIONS

### D1. Update AuthModal.tsx

Remove all hardcoded OTP logic, replace with real Supabase:

```tsx
// src/components/yuvakshar/AuthModal.tsx

const handleSendOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!mobileNum.trim() || mobileNum.length < 10) {
    setOtpError("कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें।");
    triggerShake();
    return;
  }
  
  // Convert phone to email for OTP (since we're using email OTP)
  // OR implement phone OTP via third-party service
  const tempEmail = `${mobileNum}@otp.yuvakshar.in`;
  
  setIsLoading(true);
  const { error } = await supabaseAuth.sendEmailOtp(tempEmail);
  
  if (error) {
    setOtpError(`त्रुटि: ${error}`);
    triggerShake();
    setIsLoading(false);
    return;
  }
  
  setIsLoading(false);
  setOtpSent(true);
  setCountdown(30);
};

const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  const joinedCode = otpArray.join("");
  
  if (joinedCode.length !== 6) {
    setOtpError("कृपया पूरा OTP दर्ज करें।");
    return;
  }
  
  setIsLoading(true);
  const tempEmail = `${mobileNum}@otp.yuvakshar.in`;
  
  const { user, session, error } = await supabaseAuth.verifyOtp(
    tempEmail,
    joinedCode
  );
  
  if (error) {
    setOtpError(`अमान्य OTP: ${error}`);
    setIsLoading(false);
    return;
  }
  
  setIsLoading(false);
  // Auth successful - close modal and redirect
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
  setSuccessMessage("OTP सत्यापन सफल!");
  setTimeout(() => {
    closeAuthModal();
  }, 1500);
};

const handleGoogleLogin = async () => {
  setIsLoading(true);
  const { error } = await supabaseAuth.signInWithGoogle();
  
  if (error) {
    alert(`Google लॉगिन त्रुटि: ${error}`);
    triggerShake();
  }
  // Redirect handled by OAuth callback
  setIsLoading(false);
};
```

### D2. Update CmsContext.tsx (loginUser function)

```tsx
const loginUser = async (
  email: string,
  role: string,
  customName?: string,
  customMobile?: string,
  passwordInput?: string
): Promise<boolean> => {
  // NEW: Only use Supabase auth
  try {
    // For Email/Password
    if (passwordInput) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: passwordInput,
        options: {
          data: {
            full_name: customName,
            mobile: customMobile,
            role
          }
        }
      });

      if (signUpError) {
        alert(`რეგისტრაცია 実패: ${signUpError.message}`);
        return false;
      }
    }

    // Ensure profile
    await supabaseAuth.ensureProfileExists({ email, id: (await supabase.auth.getUser()).data.user?.id });
    
    logActivity(`User authenticated: ${email}`);
    return true;
  } catch (err: any) {
    console.error('Login error:', err);
    return false;
  }
};
```

### D3. Eliminate localStorage Writes (CmsContext.tsx)

Remove all `localStorage.setItem()` calls. Replace with Supabase writes:

```tsx
// BEFORE (DON'T DO THIS):
// localStorage.setItem("yuvakshar_articles", JSON.stringify(updated));

// AFTER:
const saveArticle = async (article: Partial<Article>): Promise<Article> => {
  const now = new Date();
  
  // Write to Supabase ONLY
  const { data, error } = await supabase
    .from('articles')
    .upsert({
      ...article,
      updated_at: now.toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update local state (for UI responsiveness)
  setArticles(prev => 
    article.id 
      ? prev.map(a => a.id === article.id ? data : a)
      : [data, ...prev]
  );
  
  return data;
};

// For READ operations: Use cache first, hydrate from Supabase
const loadArticles = async () => {
  // Try cache first
  const cached = sessionStorage.getItem('articles_cache');
  if (cached) {
    setArticles(JSON.parse(cached));
  }
  
  // Fetch fresh from Supabase
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (data) {
    setArticles(data);
    // Update cache
    sessionStorage.setItem('articles_cache', JSON.stringify(data));
  }
};
```

---

## PART E: MIGRATION SCRIPTS

### E1. Data Export from localStorage

Create `scripts/exportLocalStorage.ts`:

```typescript
export async function exportAllLocalStorage() {
  const data = {
    articles: JSON.parse(localStorage.getItem('yuvakshar_articles') || '[]'),
    magazines: JSON.parse(localStorage.getItem('yuvakshar_magazines') || '[]'),
    comments: JSON.parse(localStorage.getItem('yuvakshar_comments') || '[]'),
    submissions: JSON.parse(localStorage.getItem('yuvakshar_submissions') || '[]'),
    users: JSON.parse(localStorage.getItem('yuvakshar_users') || '[]'),
    quizzes: JSON.parse(localStorage.getItem('yuvakshar_quizzes') || '[]'),
    quiz_attempts: JSON.parse(localStorage.getItem('yuvakshar_quiz_attempts') || '[]'),
    memberships: JSON.parse(localStorage.getItem('yuvakshar_memberships') || '[]'),
    payments: JSON.parse(localStorage.getItem('yuvakshar_payments') || '[]'),
    donations: JSON.parse(localStorage.getItem('yuvakshar_donations') || '[]'),
    // ... all 39 keys
  };

  return data;
}
```

### E2. Supabase Data Import Script

Create `scripts/importToSupabase.ts`:

```typescript
import { supabase } from '@/lib/supabaseClient';

export async function importAllDataToSupabase(data: any) {
  console.log('Starting data import to Supabase...');

  try {
    // 1. Import Users -> profiles
    console.log('Importing users...');
    for (const user of data.users) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
        status: user.status,
        join_date: user.joinDate,
        total_reading_time_minutes: user.totalReadingTime || 0,
        created_at: user.created_at || new Date().toISOString()
      });
      if (error) console.error('User import error:', error);
    }

    // 2. Import Articles
    console.log('Importing articles...');
    for (const article of data.articles) {
      const { error } = await supabase.from('articles').upsert({
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        summary: article.summary,
        category_id: article.category, // Map to UUID
        author_name: article.author,
        cover_image_url: article.coverImage,
        status: article.status,
        published_at: article.date,
        views_count: article.views || 0,
        created_at: article.created_at || new Date().toISOString()
      });
      if (error) console.error(`Article ${article.id} import error:`, error);
    }

    // 3. Import Comments
    console.log('Importing comments...');
    for (const comment of data.comments) {
      const { error } = await supabase.from('comments').upsert({
        id: comment.id,
        article_id: comment.article_id,
        name: comment.name,
        content: comment.content,
        status: 'approved',
        created_at: comment.created_at || new Date().toISOString()
      });
      if (error) console.error(`Comment ${comment.id} import error:`, error);
    }

    // 4. Import Quizzes & Attempts
    console.log('Importing quizzes...');
    for (const quiz of data.quizzes) {
      // Import quiz_questions first, then quiz metadata
      const { error } = await supabase.from('quizzes').upsert({
        id: quiz.articleId,
        article_id: quiz.articleId,
        question_count: quiz.questions?.length || 0,
        created_at: new Date().toISOString()
      });
      if (error) console.error(`Quiz ${quiz.articleId} import error:`, error);
    }

    console.log('✅ Data import complete!');
  } catch (err: any) {
    console.error('Fatal import error:', err);
    throw err;
  }
}
```

---

## PART F: IMPLEMENTATION ORDER (7-Phase Plan)

### PHASE 0: Preparation (1 week)
- [ ] Backup all localStorage data
- [ ] Create Supabase account & project
- [ ] Run schema creation SQL
- [ ] Create auth flow service (`supabaseAuth.ts`)
- [ ] Setup environment variables

### PHASE 1: Authentication (2 weeks)
- [ ] Replace OTP hardcoding in AuthModal.tsx
- [ ] Implement Google OAuth
- [ ] Remove `loginUser()` mock logic from CmsContext
- [ ] Implement email verification flow
- [ ] Test: All login paths work with real Supabase OTP

### PHASE 2: Content Migration (1 week)
- [ ] Export all localStorage articles to JSON
- [ ] Run import script to Supabase
- [ ] Verify all 40+ articles exist in database
- [ ] Test: Articles load from Supabase on production

### PHASE 3: Hybrid Mode (localStorage → Cache) (1 week)
- [ ] Update all data fetching to prioritize Supabase
- [ ] Keep sessionStorage for read-only cache
- [ ] Remove write operations to localStorage
- [ ] Test: Offline mode still works with cache

### PHASE 4: User Data Migration (1 week)
- [ ] Import all users from localStorage to profiles table
- [ ] Import memberships, payments, donations
- [ ] Verify referral relationships
- [ ] Test: User dashboards load correctly

### PHASE 5: Settings & Personalization (1 week)
- [ ] Create user_settings table entries
- [ ] Migrate bookmarks to new table
- [ ] Migrate study progress data
- [ ] Migrate quiz data
- [ ] Test: All personalization works

### PHASE 6: Production Deployment (1 week)
- [ ] Deploy to Vercel with new code
- [ ] Verify all Supabase connections
- [ ] Monitor error logs
- [ ] Performance testing
- [ ] Gradual rollout (10% → 50% → 100%)

### PHASE 7: Decommissioning (ongoing)
- [ ] Monitor for localStorage dependencies
- [ ] Remove all localStorage references from code
- [ ] Document new architecture
- [ ] Archive backup data

---

## PART G: RISK ANALYSIS & MITIGATION

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Data loss during migration | 🔴 CRITICAL | Triple backup before migration; dry-run on test DB |
| Supabase API rate limits | 🟠 HIGH | Implement request throttling; use batch operations |
| Auth token expiration | 🟠 HIGH | Implement auto-refresh; clear error handling |
| Concurrent write conflicts | 🟠 HIGH | Use Supabase RLS + optimistic locking |
| Performance regression | 🟡 MEDIUM | Query optimization; add indexes; CDN caching |
| User session loss | 🟡 MEDIUM | Persistent session storage; graceful degradation |

---

## PART H: ESTIMATED EFFORT

| Phase | Duration | Dev Effort | Testing |
|-------|----------|-----------|---------|
| Preparation | 1 week | 8 hrs | 4 hrs |
| Authentication | 2 weeks | 40 hrs | 16 hrs |
| Content Migration | 1 week | 16 hrs | 12 hrs |
| Hybrid Mode | 1 week | 20 hrs | 12 hrs |
| User Data | 1 week | 24 hrs | 16 hrs |
| Settings | 1 week | 20 hrs | 12 hrs |
| Production | 1 week | 30 hrs | 20 hrs |
| **TOTAL** | **7 weeks** | **158 hrs** | **92 hrs** |

**Recommended Team**: 2-3 Senior Full-Stack Engineers

---

## PART I: SUCCESS CRITERIA

✅ Production Checklist:
- [ ] Zero localStorage writes in code
- [ ] 100% of data persisted to Supabase
- [ ] All auth flows use real Supabase (no mock)
- [ ] Zero hardcoded OTP values
- [ ] All 40+ articles visible on production
- [ ] User profiles sync across environments
- [ ] Membership data accurate and queryable
- [ ] Quiz data properly persisted
- [ ] Performance metrics baseline established
- [ ] 99.9% uptime SLA achieved

---

## CONCLUSION

This migration transforms Yuvakshar from a localhost-dependent system with mock authentication into a production-ready, enterprise-grade platform with:

✅ Real authentication via Supabase Auth  
✅ Persistent data storage via PostgreSQL  
✅ Single source of truth across all environments  
✅ Scalable infrastructure for growth  
✅ Audit trails and compliance ready  
✅ Future-proof for features (payments, API, etc)

**Next Step**: Start PHASE 0 immediately. Target deployment: 8 weeks from start.

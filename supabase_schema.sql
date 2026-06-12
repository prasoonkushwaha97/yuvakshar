-- Supabase Schema Initialization for Yuvakshar (युवाक्षर)
-- Primary Database: Supabase PostgreSQL

-- Enable UUID generator extension
create extension if not exists "uuid-ossp";

-- 1. ROLES & PERMISSIONS
create table public.roles (
    id uuid default gen_random_uuid() primary key,
    name text not null unique check (name in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Author', 'Contributor', 'Subscriber')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.permissions (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.role_permissions (
    role_id uuid references public.roles(id) on delete cascade,
    permission_id uuid references public.permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- 2. PROFILES (Tied to auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    role text default 'Subscriber' check (role in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Author', 'Contributor', 'Subscriber')),
    status text default 'active' check (status in ('active', 'suspended')),
    bio text,
    avatar_url text,
    social_links jsonb default '{}'::jsonb,
    badges text[] default '{}'::text[], -- e.g., 'Verified Author', 'Featured Author', 'Guest Author', 'Editor''s Pick'
    views_count integer default 0,
    
    -- Author Ecosystem 2.0 extensions
    slug text unique,
    cover_banner text,
    designation text,
    current_role text,
    verification_badge text check (verification_badge in ('Verified Author', 'Verified Researcher', 'Editorial Team', 'Editor', 'Managing Editor', 'Editor-in-Chief', 'Founder')),
    institution text,
    expertise_tags text[] default '{}'::text[],
    orcid_id text,
    google_scholar_url text,
    academic_credentials text[] default '{}'::text[],
    professional_memberships text[] default '{}'::text[],
    education text,
    academic_background text,
    research_interests text,
    professional_experience text,
    social_contributions text,
    publications_list text,
    reputation_score integer default 0,
    reputation_tier text default 'Bronze' check (reputation_tier in ('Bronze', 'Silver', 'Gold', 'Platinum')),
    public_visibility boolean default true,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES (Hierarchical)
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    description text,
    parent_id uuid references public.categories(id) on delete set null,
    language_code text default 'hi' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TAGS
create table public.tags (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    language_code text default 'hi' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ARTICLES
create table public.articles (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    english_title text,
    slug text not null unique,
    summary text,
    content text not null,
    category_id uuid references public.categories(id) on delete set null,
    author_id uuid references public.profiles(id) on delete set null,
    cover_image text,
    featured boolean default false,
    status text default 'Draft' check (status in ('Draft', 'Pending Review', 'Revision Required', 'Approved', 'Scheduled', 'Published', 'Archived')),
    views integer default 0,
    likes integer default 0,
    read_time text,
    scheduled_for timestamp with time zone,
    language_code text default 'hi' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ARTICLE_TAGS (Mapping)
create table public.article_tags (
    article_id uuid references public.articles(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (article_id, tag_id)
);

-- 7. EDITORIAL ASSIGNMENTS
create table public.editorial_assignments (
    id uuid default gen_random_uuid() primary key,
    article_id uuid references public.articles(id) on delete cascade,
    author_id uuid references public.profiles(id) on delete set null,
    reviewer_id uuid references public.profiles(id) on delete set null,
    section_editor_id uuid references public.profiles(id) on delete set null,
    deadline timestamp with time zone,
    status text default 'Assigned' check (status in ('Assigned', 'In Progress', 'Under Review', 'Completed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. MAGAZINES (Monthly Volumes)
create table public.magazines (
    id uuid default gen_random_uuid() primary key,
    issue text not null,
    month text not null,
    cover_image text,
    description text,
    pages text[] default '{}'::text[],
    pdf_url text,
    language_code text default 'hi' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. COMMENTS (Threaded/Nested)
create table public.comments (
    id uuid default gen_random_uuid() primary key,
    article_id uuid references public.articles(id) on delete cascade,
    parent_id uuid references public.comments(id) on delete cascade,
    name text not null,
    user_id uuid references public.profiles(id) on delete set null,
    content text not null,
    likes integer default 0,
    status text default 'pending' check (status in ('approved', 'pending', 'spam', 'deleted')),
    is_reported boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. BOOKMARKS
create table public.bookmarks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    article_id uuid references public.articles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, article_id)
);

-- 11. SUBSCRIBERS (Newsletter with opt-in)
create table public.subscribers (
    id uuid default gen_random_uuid() primary key,
    email text not null unique,
    status text default 'Pending Verification' check (status in ('Pending Verification', 'Active', 'Unsubscribed', 'Blocked')),
    verification_token text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. NEWSLETTER CAMPAIGNS
create table public.newsletter_campaigns (
    id uuid default gen_random_uuid() primary key,
    subject text not null,
    content text not null,
    sent_at timestamp with time zone,
    sent_by uuid references public.profiles(id) on delete set null,
    stats jsonb default '{"open_count": 0, "click_count": 0}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. ADVERTISEMENTS
create table public.ads (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    zone text not null check (zone in ('after_first_p', 'mid_content', 'before_related')),
    type text not null check (type in ('adsense', 'custom_html', 'banner')),
    code text, -- AdSense or custom HTML code
    image_url text, -- Banner image URL
    link_url text, -- Banner click link
    active boolean default true,
    impression_count integer default 0,
    click_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. MEMBERSHIPS & MONETIZATION
create table public.memberships (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    type text default 'Free Reader' check (type in ('Free Reader', 'Registered Reader', 'Premium Member', 'Patron')),
    status text default 'active' check (status in ('active', 'expired', 'cancelled')),
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. SEARCH ANALYTICS
create table public.search_analytics (
    id uuid default gen_random_uuid() primary key,
    query text not null unique,
    search_count integer default 1,
    click_count integer default 0,
    zero_results boolean default false,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. CONTACT & FEEDBACK MESSAGES
create table public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    type text not null check (type in ('contact', 'feedback', 'suggestion', 'report')),
    name text not null,
    email text not null,
    mobile text,
    subject text,
    content text not null,
    status text default 'New' check (status in ('New', 'Open', 'In Progress', 'Resolved', 'Archived')),
    replies jsonb default '[]'::jsonb, -- Array of response email details
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. GLOBAL SITE SETTINGS
create table public.site_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. SLUG REDIRECTS (SEO tracking)
create table public.slug_redirects (
    id uuid default gen_random_uuid() primary key,
    old_slug text not null unique,
    new_slug text not null,
    type text default 'article' check (type in ('article', 'category', 'tag', 'author', 'magazine')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 19. HOMEPAGE LAYOUTS (Versioning)
create table public.homepage_layouts (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    layout_json jsonb not null,
    version integer default 1,
    is_published boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 20. ACTIVITY AUDIT LOGS
create table public.activity_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON USER SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_profile boolean;
  assigned_role text;
begin
  -- Check if this is the first user registering
  select (count(*) = 0) into is_first_profile from public.profiles;
  
  if is_first_profile then
    assigned_role := 'Super Admin';
  else
    assigned_role := 'Subscriber';
  end if;

  insert into public.profiles (id, name, role, status, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    assigned_role,
    'active',
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.editorial_assignments enable row level security;
alter table public.magazines enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.subscribers enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.ads enable row level security;
alter table public.memberships enable row level security;
alter table public.search_analytics enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.slug_redirects enable row level security;
alter table public.homepage_layouts enable row level security;
alter table public.activity_logs enable row level security;


-- BASIC RLS POLICIES
-- Profiles Policy: profiles readable by everyone, editable by owner or Super Admin
create policy "Public profiles are viewable by everyone" on public.profiles
    for select using (true);
create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'Super Admin');

-- Categories & Tags Policy: readable by everyone, editable by admins/editors
create policy "Categories are viewable by everyone" on public.categories
    for select using (true);
create policy "Categories are manageable by editors and admins" on public.categories
    for all using (
        (select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor')
    );

create policy "Tags are viewable by everyone" on public.tags
    for select using (true);
create policy "Tags are manageable by editors and admins" on public.tags
    for all using (
        (select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor')
    );

-- Articles Policy: viewable if published, editable by author or admins
create policy "Articles are viewable by everyone if published" on public.articles
    for select using (status = 'Published' or (select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Author'));
    
create policy "Authors can manage their own articles" on public.articles
    for all using (
        author_id = auth.uid() or 
        (select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor')
    );

-- Editorial Assignments: readable/manageable by staff roles
create policy "Editorial assignments viewable by staff" on public.editorial_assignments
    for select using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Author'));
create policy "Editorial assignments manageable by editors" on public.editorial_assignments
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));

-- Magazines Policy: readable by everyone, editable by admins
create policy "Magazines are viewable by everyone" on public.magazines
    for select using (true);
create policy "Magazines are manageable by admins and editors" on public.magazines
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));

-- Comments Policy: read if approved, write if logged in or contributor
create policy "Comments are viewable if approved" on public.comments
    for select using (status = 'approved' or (select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));
create policy "Anyone can submit comments" on public.comments
    for insert with check (true);
create policy "Admins can manage comments" on public.comments
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));

-- Bookmarks: only owner can read/write
create policy "Bookmarks viewable by owner" on public.bookmarks
    for select using (user_id = auth.uid());
create policy "Bookmarks insertable by owner" on public.bookmarks
    for insert with check (user_id = auth.uid());
create policy "Bookmarks deletable by owner" on public.bookmarks
    for delete using (user_id = auth.uid());

-- Subscribers: only admins can manage, anyone can insert
create policy "Subscribers viewable by admins" on public.subscribers
    for select using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));
create policy "Public can subscribe" on public.subscribers
    for insert with check (true);
create policy "Admins can update subscribers" on public.subscribers
    for update using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));

-- Newsletter Campaigns, Ads, Site Settings, Redirects, Homepage layouts, Audit logs: admin check
create policy "Site settings are viewable by everyone" on public.site_settings
    for select using (true);
create policy "Site settings are manageable by admins" on public.site_settings
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief'));

create policy "Homepage layouts viewable by everyone" on public.homepage_layouts
    for select using (true);
create policy "Homepage layouts manageable by editors and admins" on public.homepage_layouts
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));

create policy "Ads viewable by everyone" on public.ads
    for select using (true);
create policy "Ads manageable by admins" on public.ads
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor'));

create policy "Contact messages manageable by staff" on public.contact_messages
    for all using ((select role from public.profiles where id = auth.uid()) in ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor'));
create policy "Contact messages insertable by public" on public.contact_messages
    for insert with check (true);

-- INITIAL SEED SETTINGS
insert into public.site_settings (key, value)
values 
  ('general_settings', '{
    "site_name": "युवाक्षर",
    "tagline": "लेखन, चिंतन और परिवर्तन",
    "primary_email": "yuvakshar.editor@gmail.com",
    "editorial_email": "yuvakshar.editor@gmail.com",
    "support_email": "yuvakshar.editor@gmail.com",
    "newsletter_email": "yuvakshar.editor@gmail.com",
    "notification_email": "yuvakshar.editor@gmail.com"
  }'::jsonb),
  ('appearance_settings', '{
    "primary_color": "#EA580C",
    "secondary_color": "#0F172A",
    "background_color": "#FFFFFF",
    "logo_url": "",
    "favicon_url": "",
    "font_headlines": "Noto Serif Devanagari",
    "font_body": "Noto Sans Devanagari"
  }'::jsonb),
  ('footer_settings', '{
    "copyright_text": "© 2026 Yuvakshar. Designed for Indias youth vanguard.",
    "links": [
      {"name": "हमारे बारे में", "href": "/about"},
      {"name": "संपर्क", "href": "/contact"},
      {"name": "गोपनीयता नीति", "href": "/privacy-policy"},
      {"name": "नियम और शर्तें", "href": "/terms-and-conditions"},
      {"name": "संपादकीय नीति", "href": "/editorial-policy"}
    ]
  }'::jsonb);

-- CREATE INDICES FOR PERFORMANCE
create index idx_articles_slug on public.articles(slug);
create index idx_articles_status on public.articles(status);
create index idx_articles_author_id on public.articles(author_id);
create index idx_articles_category_id on public.articles(category_id);
create index idx_comments_article_id on public.comments(article_id);
create index idx_comments_parent_id on public.comments(parent_id);
create index idx_categories_slug on public.categories(slug);
create index idx_tags_slug on public.tags(slug);

-- 21. AUTHOR ECOSYSTEM 2.0 RELATIONAL TABLES
create table public.profile_timeline (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    date text not null,
    type text default 'milestone',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.profile_portfolio (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    url text not null,
    type text check (type in ('book', 'research_paper', 'report', 'white_paper', 'resume', 'other')) not null,
    is_public boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.profile_achievements (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    year text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.profile_followers (
    author_id uuid references public.profiles(id) on delete cascade,
    follower_id uuid references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (author_id, follower_id)
);

-- Enable Row Level Security (RLS)
alter table public.profile_timeline enable row level security;
alter table public.profile_portfolio enable row level security;
alter table public.profile_achievements enable row level security;
alter table public.profile_followers enable row level security;

-- Timeline Policies
create policy "Timeline viewable by everyone" on public.profile_timeline
    for select using (true);
create policy "Timeline manageable by profile owner" on public.profile_timeline
    for all using (user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'Super Admin');

-- Portfolio Policies
create policy "Portfolio viewable by everyone if public" on public.profile_portfolio
    for select using (is_public = true or user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'Super Admin');
create policy "Portfolio manageable by profile owner" on public.profile_portfolio
    for all using (user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'Super Admin');

-- Achievements Policies
create policy "Achievements viewable by everyone" on public.profile_achievements
    for select using (true);
create policy "Achievements manageable by profile owner" on public.profile_achievements
    for all using (user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'Super Admin');

-- Followers Policies
create policy "Followers viewable by everyone" on public.profile_followers
    for select using (true);
create policy "Followers manageable by everyone" on public.profile_followers
    for all using (true);

-- Indices for performance
create index idx_profile_timeline_user_id on public.profile_timeline(user_id);
create index idx_profile_portfolio_user_id on public.profile_portfolio(user_id);
create index idx_profile_achievements_user_id on public.profile_achievements(user_id);
create index idx_profiles_slug on public.profiles(slug);

-- 22. DATABASE AUDIT LOGGING SYSTEM (Phase 5)
create or replace function public.log_profile_changes()
returns trigger as $$
begin
  if (old.role is distinct from new.role) then
    insert into public.activity_logs (user_id, action, details)
    values (
      auth.uid(),
      'Role Changed',
      json_build_object(
        'target_user_id', new.id,
        'old_role', old.role,
        'new_role', new.role
      )::jsonb
    );
  end if;
  
  if (old.verification_badge is distinct from new.verification_badge) then
    insert into public.activity_logs (user_id, action, details)
    values (
      auth.uid(),
      'Verification Updated',
      json_build_object(
        'target_user_id', new.id,
        'old_badge', old.verification_badge,
        'new_badge', new.verification_badge
      )::jsonb
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_changed
  after update on public.profiles
  for each row execute procedure public.log_profile_changes();

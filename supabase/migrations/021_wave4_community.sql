-- 021_wave4_community.sql
-- Description: Extends Community domain tables to add moderation workflow

-- 1. Extend community_posts to support moderation statuses
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Published'; -- Draft, Published, Reported, Moderated, Archived

-- 2. Extend community_comments to support moderation statuses
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved'; -- approved, pending, spam, deleted, reported
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT false;

-- 3. Moderation Reports
CREATE TABLE IF NOT EXISTS public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- post, comment, user
    content_id UUID NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Resolved, Dismissed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Moderation Actions
CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.moderation_reports(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    action_taken VARCHAR(100) NOT NULL, -- deleted, suspended, warned, ignored
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    resolved_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Moderation Policies
CREATE POLICY "Allow auth to create moderation_reports" ON public.moderation_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

-- Allow Editorial/Admin full access to moderation tables
CREATE POLICY "Allow editorial access to moderation_reports" ON public.moderation_reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor', 'Moderator'))
);
CREATE POLICY "Allow editorial access to moderation_actions" ON public.moderation_actions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor', 'Moderator'))
);

-- Note: Policies for community_posts and community_comments already exist in 007. We just added moderation tables here.

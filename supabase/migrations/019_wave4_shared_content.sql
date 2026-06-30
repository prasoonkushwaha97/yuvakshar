-- 019_wave4_shared_content.sql
-- Description: Creates shared content models (Tags, Attachments, Media References)

-- 1. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    language_code VARCHAR(10) DEFAULT 'hi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Polymorphic Content Tags Mapping
-- content_type can be 'article', 'magazine_issue', 'community_post'
CREATE TABLE IF NOT EXISTS public.content_tags (
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tag_id, content_id, content_type)
);

-- 3. Polymorphic Content Attachments (Documents, PDFs, etc.)
CREATE TABLE IF NOT EXISTS public.content_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_attachments ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read on tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Allow public read on content_tags" ON public.content_tags FOR SELECT USING (true);
CREATE POLICY "Allow public read on content_attachments" ON public.content_attachments FOR SELECT USING (true);

-- Allow Admin/Editor write
CREATE POLICY "Allow editorial write on tags" ON public.tags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );
CREATE POLICY "Allow editorial write on content_tags" ON public.content_tags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );
CREATE POLICY "Allow editorial write on content_attachments" ON public.content_attachments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );

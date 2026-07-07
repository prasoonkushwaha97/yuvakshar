-- 020_wave4_magazine.sql
-- Description: Creates Magazine domain tables

-- 1. Magazine Issues
CREATE TABLE IF NOT EXISTS public.magazine_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue VARCHAR(255) NOT NULL,
    edition VARCHAR(255),
    month VARCHAR(50) NOT NULL,
    year VARCHAR(4),
    cover_image TEXT NOT NULL,
    description TEXT,
    category VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'Free',
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Published, Archived
    pdf_source_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_recommended BOOLEAN DEFAULT false,
    pages_json JSONB DEFAULT '[]'::jsonb, -- Array of image URLs for page reading
    publish_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Magazine Articles Mapping
-- Maps existing articles to a specific magazine issue
CREATE TABLE IF NOT EXISTS public.magazine_articles (
    magazine_id UUID NOT NULL REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (magazine_id, article_id)
);

-- RLS Policies
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read of published issues
CREATE POLICY "Allow public read on published magazine_issues" ON public.magazine_issues 
    FOR SELECT USING (status = 'Published' OR status = 'Archived');

CREATE POLICY "Allow editorial read on all magazine_issues" ON public.magazine_issues 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );

CREATE POLICY "Allow public read on magazine_articles" ON public.magazine_articles 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.magazine_issues m WHERE m.id = magazine_id AND (m.status = 'Published' OR m.status = 'Archived'))
    );

CREATE POLICY "Allow editorial read on all magazine_articles" ON public.magazine_articles 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );

-- Allow Admin/Editor write
CREATE POLICY "Allow editorial write on magazine_issues" ON public.magazine_issues
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );
CREATE POLICY "Allow editorial write on magazine_articles" ON public.magazine_articles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles u WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Editor', 'Founder', 'Managing Editor'))
    );

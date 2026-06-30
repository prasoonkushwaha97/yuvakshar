-- Wave 1: Core Publishing Additions

-- 1. Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at to articles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='updated_at') THEN
    ALTER TABLE public.articles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- 2. Triggers for updated_at
DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- 3. Article Versions (Versioning system)
CREATE TABLE IF NOT EXISTS public.article_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rollback_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for article_versions
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Article versions viewable by staff" ON public.article_versions
    FOR SELECT USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Author')
    );

CREATE POLICY "Article versions insertable by staff" ON public.article_versions
    FOR INSERT WITH CHECK (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Author')
    );

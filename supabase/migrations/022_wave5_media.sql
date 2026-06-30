-- Wave 5: Media Domain

CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document', 'archive')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    usage_count INTEGER NOT NULL DEFAULT 0,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON public.media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder_id ON public.media_assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON public.media_assets USING GIN (tags);

-- RLS
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for media_folders" ON public.media_folders FOR SELECT USING (true);
CREATE POLICY "Allow admin all access for media_folders" ON public.media_folders USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Superadmin'))
);

CREATE POLICY "Allow public read access for media_assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Allow admin all access for media_assets" ON public.media_assets USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Superadmin'))
);

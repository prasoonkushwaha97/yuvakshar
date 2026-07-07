-- Wave 5: Analytics Domain

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    label TEXT,
    value NUMERIC,
    path TEXT,
    session_id TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indexes for performance since this table will grow large
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_category ON public.analytics_events(event_type, category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON public.analytics_events(path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public to insert events (tracking from frontend)
CREATE POLICY "Allow public insert for analytics_events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Allow admin all access to read analytics_events
CREATE POLICY "Allow admin all access to analytics_events" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Superadmin'))
);

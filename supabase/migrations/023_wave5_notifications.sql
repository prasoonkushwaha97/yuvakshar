-- Wave 5: Notifications Domain

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    enabled_channels JSONB NOT NULL DEFAULT '["InApp", "Email"]'::jsonb,
    digest_mode TEXT NOT NULL DEFAULT 'None' CHECK (digest_mode IN ('None', 'Daily', 'Weekly')),
    quiet_hours_start TEXT,
    quiet_hours_end TEXT,
    category_preferences JSONB NOT NULL DEFAULT '{"Editorial": true, "Community": true, "Security": true, "System": true, "Marketing": false, "AI": true}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Editorial', 'Community', 'Security', 'System', 'Marketing', 'AI')),
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'Urgent')),
    category TEXT NOT NULL CHECK (category IN ('Editorial', 'Community', 'Security', 'System', 'Marketing', 'AI')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trigger_event_id TEXT,
    delivery_channels JSONB NOT NULL DEFAULT '["InApp"]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Delivered', 'Failed')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Preferences: Users can see and update their own
CREATE POLICY "Allow users to read own preferences" ON public.notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Allow users to update own preferences" ON public.notification_preferences FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Allow users to insert own preferences" ON public.notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());

-- Templates: Admins only
CREATE POLICY "Allow admin all access to templates" ON public.notification_templates USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Superadmin'))
);

-- Notifications: Users can see their own, System can create
CREATE POLICY "Allow users to read own notifications" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Allow users to update own notifications" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());

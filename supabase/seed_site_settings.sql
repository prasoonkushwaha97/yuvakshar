-- ==========================================
-- SITE SETTINGS SEED DATA
-- Prevents logo_url and settings crash in production
-- Run this if site_settings table is empty
-- ==========================================

-- Check if settings exist first to avoid duplicates
INSERT INTO public.site_settings (key, value, is_public, updated_at)
VALUES
  (
    'general_settings',
    '{
      "site_name": "युवाक्षर",
      "tagline": "लेखन, चिंतन और परिवर्तन",
      "primary_email": "yuvakshar.editor@gmail.com",
      "editorial_email": "yuvakshar.editor@gmail.com",
      "support_email": "yuvakshar.editor@gmail.com",
      "newsletter_email": "yuvakshar.editor@gmail.com",
      "notification_email": "yuvakshar.editor@gmail.com"
    }'::jsonb,
    true,
    now()
  ),
  (
    'appearance_settings',
    '{
      "primary_color": "#EA580C",
      "secondary_color": "#0F172A",
      "background_color": "#FFFFFF",
      "logo_url": "/yuvakshar_logo_official.png",
      "favicon_url": "/favicon.ico",
      "font_headlines": "Noto Serif Devanagari",
      "font_body": "Noto Sans Devanagari"
    }'::jsonb,
    true,
    now()
  ),
  (
    'footer_settings',
    '{
      "copyright_text": "© 2026 Yuvakshar. Designed for India'\''s youth vanguard.",
      "links": [
        { "name": "हमारे बारे में", "href": "/about" },
        { "name": "संपर्क", "href": "/contact" },
        { "name": "गोपनीयता नीति", "href": "/privacy-policy" },
        { "name": "नियम और शर्तें", "href": "/terms-and-conditions" },
        { "name": "संपादकीय नीति", "href": "/editorial-policy" }
      ]
    }'::jsonb,
    true,
    now()
  )
ON CONFLICT (key)
DO NOTHING;

-- Migration to add missing SEO fields to the articles table if they do not exist
ALTER TABLE IF EXISTS public.articles 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);

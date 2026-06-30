/**
 * Feature Flags for Phase 6 Migration
 * Allows safe rollback of specific domains if Supabase migration fails in production.
 */
export const FEATURES = {
  // Wave 1: Core Publishing
  USE_SUPABASE_ARTICLES: process.env.NEXT_PUBLIC_USE_SUPABASE_ARTICLES === 'true' || true,
  USE_SUPABASE_CATEGORIES: process.env.NEXT_PUBLIC_USE_SUPABASE_CATEGORIES === 'true' || true,
  USE_SUPABASE_PROFILES: process.env.NEXT_PUBLIC_USE_SUPABASE_PROFILES === 'true' || true,

  // Wave 2: Editorial
  USE_SUPABASE_EDITORIAL: process.env.NEXT_PUBLIC_USE_SUPABASE_EDITORIAL === 'true' || false,

  // Wave 3: Experience
  USE_SUPABASE_EXPERIENCES: process.env.NEXT_PUBLIC_USE_SUPABASE_EXPERIENCES === 'true' || false,

  // Wave 4: Content Ecosystem
  USE_SUPABASE_MAGAZINE: process.env.NEXT_PUBLIC_USE_SUPABASE_MAGAZINE === 'true' || false,
  USE_SUPABASE_COMMUNITY: process.env.NEXT_PUBLIC_USE_SUPABASE_COMMUNITY === 'true' || false,

  // Wave 5: Platform
  USE_SUPABASE_PLATFORM: true, // Activated for Wave 5 Migration
};

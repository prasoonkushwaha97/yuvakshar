export const STORAGE_CONFIG = {
  BUCKET_NAME: process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "yuvakshar-media",
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  FOLDERS: {
    ARTICLES: "articles",
    AUTHORS: "authors",
    AVATARS: "avatars",
    MAGAZINE: "magazine",
    COMMUNITY: "community",
    BANNERS: "banners",
    LOGOS: "logos",
    MISC: "misc",
  }
} as const;

export type StorageFolder = typeof STORAGE_CONFIG.FOLDERS[keyof typeof STORAGE_CONFIG.FOLDERS];

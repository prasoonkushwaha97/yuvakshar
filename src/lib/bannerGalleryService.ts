import { BannerGalleryItem, Profile } from "@/store/types";
import { supabase } from "@/lib/supabaseClient";

export const BANNER_CATEGORIES = [
  "Books & Library",
  "Journalism",
  "Culture",
  "Nature",
  "Literature",
  "Education",
  "Technology",
  "Abstract",
] as const;

export const DEFAULT_FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1507842229565-8942957584de?auto=format&fit=crop&w=1500&q=80";

export const INITIAL_PRESET_BANNERS: BannerGalleryItem[] = [
  {
    id: "bg-books-1",
    title: "विद्वत पुस्तकालय (Literary Library)",
    category: "Books & Library",
    image_url: "https://images.unsplash.com/photo-1507842229565-8942957584de?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 1,
  },
  {
    id: "bg-journalism-1",
    title: "पत्रकारिता एवं समाचार (Journalism & Press)",
    category: "Journalism",
    image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 2,
  },
  {
    id: "bg-culture-1",
    title: "भारतीय संस्कृति एवं विरासत (Bharat Heritage)",
    category: "Culture",
    image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 3,
  },
  {
    id: "bg-nature-1",
    title: "प्राकृतिक शांति (Peaceful Nature)",
    category: "Nature",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 4,
  },
  {
    id: "bg-writing-1",
    title: "लेखन मेज़ एवं कलम (Writing Desk)",
    category: "Literature",
    image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 5,
  },
  {
    id: "bg-education-1",
    title: "शिक्षा एवं विद्या (Education & Learning)",
    category: "Education",
    image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 6,
  },
  {
    id: "bg-tech-1",
    title: "तकनीक एवं एआई (Tech & AI)",
    category: "Technology",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 7,
  },
  {
    id: "bg-abstract-1",
    title: "न्यूनतम आधुनिक कला (Abstract Minimal)",
    category: "Abstract",
    image_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1500&q=80",
    status: "active",
    sort_order: 8,
  },
];

const LOCAL_STORAGE_KEY = "yuvakshar_banner_gallery_v1";

/**
 * Fetch gallery items (merges DB / storage / preset items).
 */
export async function getBannerGallery(includeDisabled = false): Promise<BannerGalleryItem[]> {
  try {
    // Try Supabase table if existing
    const { data, error } = await supabase
      .from("banner_gallery")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return includeDisabled ? data : data.filter((item) => item.status === "active");
    }
  } catch (err) {
    // DB query fallback
  }

  // LocalStorage / Memory Fallback
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: BannerGalleryItem[] = JSON.parse(saved);
        return includeDisabled ? parsed : parsed.filter((item) => item.status === "active");
      }
    } catch {}
  }

  return includeDisabled
    ? INITIAL_PRESET_BANNERS
    : INITIAL_PRESET_BANNERS.filter((item) => item.status === "active");
}

/**
 * Save / Update a gallery banner item.
 */
export async function saveBannerGalleryItem(item: BannerGalleryItem): Promise<BannerGalleryItem[]> {
  const current = await getBannerGallery(true);
  const existingIndex = current.findIndex((i) => i.id === item.id);

  let updated: BannerGalleryItem[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...item, updated_at: new Date().toISOString() };
  } else {
    updated = [...current, { ...item, created_at: new Date().toISOString() }];
  }

  // Persist locally
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }

  // Persist to Supabase if available
  try {
    await supabase.from("banner_gallery").upsert([item]);
  } catch {}

  return updated;
}

/**
 * Delete a gallery banner item.
 */
export async function deleteBannerGalleryItem(id: string): Promise<BannerGalleryItem[]> {
  const current = await getBannerGallery(true);
  const updated = current.filter((i) => i.id !== id);

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }

  try {
    await supabase.from("banner_gallery").delete().eq("id", id);
  } catch {}

  return updated;
}

/**
 * Reorder gallery banner items.
 */
export async function reorderBannerGalleryItems(items: BannerGalleryItem[]): Promise<BannerGalleryItem[]> {
  const reordered = items.map((item, idx) => ({
    ...item,
    sort_order: idx + 1,
  }));

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reordered));
  }

  try {
    await supabase.from("banner_gallery").upsert(reordered);
  } catch {}

  return reordered;
}

/**
 * Calculate the final effective banner URL for a profile following the exact priority rules:
 * 1. User Custom Banner (custom_banner_url or cover_url)
 * 2. Selected Gallery Banner (selected_gallery_banner_id)
 * 3. Default Yuvakshar Banner
 */
export function getProfileBannerUrl(user: Profile | any, galleryItems?: BannerGalleryItem[]): string {
  if (!user) return DEFAULT_FALLBACK_BANNER;

  // 1. Priority 1: User Custom Banner
  if (user.custom_banner_url && user.custom_banner_url.trim()) {
    return user.custom_banner_url.trim();
  }
  if (user.cover_url && user.cover_url.trim()) {
    return user.cover_url.trim();
  }

  // 2. Priority 2: Selected Gallery Banner
  if (user.selected_gallery_banner_id) {
    const list = galleryItems || INITIAL_PRESET_BANNERS;
    const found = list.find((g) => g.id === user.selected_gallery_banner_id);
    if (found && found.image_url) {
      return found.image_url;
    }
  }

  // 3. Priority 3: Default Yuvakshar Banner
  return DEFAULT_FALLBACK_BANNER;
}

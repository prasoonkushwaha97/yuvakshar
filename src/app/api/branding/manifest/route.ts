import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  let version = "default";
  let primaryColor = "#EA580C";
  let backgroundColor = "#FFFFFF";
  
  if (isSupabaseConfigured()) {
    try {
      // Fetch branding icons timestamp for cache-busting
      const { data: iconsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_icons")
        .single();
      if (iconsData?.value?.updated_at) {
        version = new Date(iconsData.value.updated_at).getTime().toString();
      }
      
      // Fetch theme colors
      const { data: appearanceData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "appearance_settings")
        .single();
      if (appearanceData?.value) {
        primaryColor = appearanceData.value.primary_color || primaryColor;
        backgroundColor = appearanceData.value.background_color || backgroundColor;
      }
    } catch (e) {
      console.error("Error reading manifest settings from Supabase:", e);
    }
  }

  const iconBaseUrl = `/api/branding/icon`;
  // Required sizes for PWA launchers and devices
  const iconSizes = [72, 96, 128, 144, 152, 192, 256, 384, 512];

  const manifest = {
    name: "युवाक्षर",
    short_name: "युवाक्षर",
    description: "युवाक्षर | लेखन, चिंतन और परिवर्तन - Premium Devanagari Editorial & Magazine Platform",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: backgroundColor,
    theme_color: primaryColor,
    icons: iconSizes.map((size) => ({
      src: `${iconBaseUrl}?size=${size}&v=${version}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any maskable"
    }))
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/manifest+json"
    }
  });
}

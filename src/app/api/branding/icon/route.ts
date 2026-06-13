import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") || "32";
  
  if (isSupabaseConfigured()) {
    try {
      const { data: iconsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_icons")
        .single();
        
      if (iconsData?.value && iconsData.value[size]) {
        const base64Data = iconsData.value[size];
        // Extract raw base64 data (strip off data:image/png;base64, header)
        const base64Content = base64Data.split(",")[1] || base64Data;
        const buffer = Buffer.from(base64Content, "base64");
        
        return new Response(buffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable"
          }
        });
      }
    } catch (e) {
      console.error("Error retrieving branding icon from Supabase:", e);
    }
  }

  // Fallback: Serve default logo from public directory based on size
  try {
    let fallbackFilename = `favicon-${size}x${size}.png`;
    let defaultPath = path.join(process.cwd(), "public", fallbackFilename);
    
    if (!fs.existsSync(defaultPath)) {
      fallbackFilename = "favicon.ico";
      defaultPath = path.join(process.cwd(), "public", fallbackFilename);
    }
    
    const buffer = fs.readFileSync(defaultPath);
    
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (err) {
    console.error("Error reading fallback icon:", err);
    // Return empty 1x1 transparent PNG pixel as absolute emergency fallback
    const transparentPixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );
    return new Response(transparentPixel, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  }
}

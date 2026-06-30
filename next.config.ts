import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fbvffiotmlxypxmtlrsz.supabase.co" }, // Supabase Storage
      { protocol: "https", hostname: "api.dicebear.com" }, // Dummy avatars
      { protocol: "https", hostname: "images.unsplash.com" }, // External placeholders
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub avatars
      { protocol: "https", hostname: "img.youtube.com" } // YouTube thumbnails
    ],
  }
};

export default nextConfig;
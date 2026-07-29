import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fbvffiotmlxypxmtlrsz.supabase.co" }, // Supabase Storage
      { protocol: "https", hostname: "api.dicebear.com" }, // Dummy avatars
      { protocol: "https", hostname: "images.unsplash.com" }, // External placeholders
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub avatars
      { protocol: "https", hostname: "img.youtube.com" } // YouTube thumbnails
    ],
  },
  async redirects() {
    return [
      {
        source: '/profile/:username',
        destination: '/u/:username',
        permanent: true,
      },
      {
        source: '/contribute',
        destination: '/workspace',
        permanent: true,
      },
      {
        source: '/@:username',
        destination: '/u/:username',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/login', // Will be handled by the middleware if logged in, otherwise prompts login
        permanent: false,
      }
    ]
  }
};

export default nextConfig;
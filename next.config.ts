import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    // Supabase storage URLs resolve to IPv6-mapped private IPs in this environment,
    // causing Next.js image optimization to reject them. Bypass the proxy so the
    // browser fetches images directly from their original URLs.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "fbvffiotmlxypxmtlrsz.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
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
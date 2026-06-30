import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fbvffiotmlxypxmtlrsz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/authors/:slug*',
        destination: '/profile/:slug*',
        permanent: true,
      },
      {
        source: '/author/:slug*',
        destination: '/profile/:slug*',
        permanent: true,
      },
      {
        source: '/authors',
        destination: '/',
        permanent: true,
      },
      {
        source: '/author',
        destination: '/',
        permanent: true,
      },
      {
        source: '/community/u/:slug*',
        destination: '/profile/:slug*',
        permanent: true,
      },
      {
        source: '/community/authors',
        destination: '/',
        permanent: true,
      },
      {
        source: '/community/authors/:slug*',
        destination: '/profile/:slug*',
        permanent: true,
      },
      {
        source: '/cms/:path*',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/founder/:path*',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/editorial/:path*',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/submit-article',
        destination: '/contribute',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;

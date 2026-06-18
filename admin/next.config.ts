import type { NextConfig } from 'next';

const backendUrl = (
  process.env.BACKEND_API_URL ??
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    if (!backendUrl) return [];
    // Only proxy FastAPI routes — never NextAuth routes like /api/auth/signout.
    return [
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: '/api/auth/admin/:path*',
        destination: `${backendUrl}/api/auth/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;

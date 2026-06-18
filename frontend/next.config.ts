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
    // Only proxy FastAPI routes — keep NextAuth and local API routes on Next.js.
    return [
      { source: '/api/health', destination: `${backendUrl}/api/health` },
      { source: '/api/academic/:path*', destination: `${backendUrl}/api/academic/:path*` },
      { source: '/api/public/:path*', destination: `${backendUrl}/api/public/:path*` },
      { source: '/api/auth/student/:path*', destination: `${backendUrl}/api/auth/student/:path*` },
      { source: '/api/auth/staff/:path*', destination: `${backendUrl}/api/auth/staff/:path*` },
      { source: '/api/auth/change-password', destination: `${backendUrl}/api/auth/change-password` },
      { source: '/api/student/:path*', destination: `${backendUrl}/api/student/:path*` },
      { source: '/api/staff/:path*', destination: `${backendUrl}/api/staff/:path*` },
    ];
  },
};

export default nextConfig;

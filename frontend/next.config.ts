import type { NextConfig } from 'next';

const backendUrl = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  env: {
    API_URL: backendUrl,
    NEXT_PUBLIC_API_URL: backendUrl,
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const DEV_BACKEND_DEFAULT = 'http://127.0.0.1:8000';

function resolveBackendUrl(): string {
  const explicit = process.env.BACKEND_API_URL?.trim().replace(/\/$/, '');
  if (explicit && !explicit.includes('.vercel.app') && !explicit.includes('.vercel.sh')) {
    return explicit;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_BACKEND_DEFAULT;
  }

  return '';
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = resolveBackendUrl();
    if (!backendUrl) return [];
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

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

import type { NextConfig } from 'next';

function resolveBackendUrl(): string {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  const legacy = process.env.API_URL?.replace(/\/$/, '') ?? '';
  if (legacy && !legacy.includes('.vercel.app')) return legacy;

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  if (publicUrl && !publicUrl.includes('.vercel.app')) return publicUrl;

  return '';
}

const backendUrl = resolveBackendUrl();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
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

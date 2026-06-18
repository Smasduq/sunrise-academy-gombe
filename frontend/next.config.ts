import type { NextConfig } from 'next';

<<<<<<< HEAD
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
=======
const backendUrl = (
  process.env.BACKEND_API_URL ??
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/$/, '');
>>>>>>> adcb03c32ffa6332c592a8fb026071a80bf14c1e

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

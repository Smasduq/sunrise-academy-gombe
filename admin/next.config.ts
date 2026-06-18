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

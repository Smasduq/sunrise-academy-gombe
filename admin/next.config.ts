import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    API_URL: apiUrl,
    NEXT_PUBLIC_API_URL: apiUrl,
  },
};

export default nextConfig;

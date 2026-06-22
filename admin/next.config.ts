import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

function parseAllowedDevOrigins(): string[] {
  const raw = process.env.ALLOWED_DEV_ORIGINS;
  if (raw) {
    return raw
      .split(',')
      .map((entry) => {
        const value = entry.trim();
        if (!value) return '';
        try {
          return value.includes('://') ? new URL(value).host : value;
        } catch {
          return value;
        }
      })
      .filter(Boolean);
  }

  return ['192.168.*', '10.*', '172.*'];
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: parseAllowedDevOrigins(),
};

export default nextConfig;

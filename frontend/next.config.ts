import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

function parseAllowedDevOrigins(): string[] {
  const origins = new Set<string>();

  const raw = process.env.ALLOWED_DEV_ORIGINS;
  if (raw) {
    for (const entry of raw.split(',')) {
      const value = entry.trim();
      if (!value) continue;

      try {
        if (value.includes('://')) {
          const url = new URL(value);
          origins.add(url.host);
          origins.add(url.hostname);
        } else {
          origins.add(value);
          const [host] = value.split(':');
          if (host) origins.add(host);
        }
      } catch {
        origins.add(value);
      }
    }
  }

  for (const pattern of ['192.168.*', '10.*', '172.*']) {
    origins.add(pattern);
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: parseAllowedDevOrigins(),
};

export default nextConfig;

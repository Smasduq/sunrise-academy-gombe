function isLikelyVercelAppUrl(url: string): boolean {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function getBackendUrl(): string | undefined {
  const explicit = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  // Vercel may auto-set API_URL to the deployment URL — ignore that value.
  const legacy = process.env.API_URL?.replace(/\/$/, '');
  if (legacy && !isLikelyVercelAppUrl(legacy)) return legacy;

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (publicUrl && !isLikelyVercelAppUrl(publicUrl)) return publicUrl;

  return undefined;
}

function resolveApiUrl(): string {
  const backend = getBackendUrl();

  // Browser uses same-origin /api/*; Next.js rewrites proxy to FastAPI.
  if (typeof window !== 'undefined') {
    if (backend || process.env.NODE_ENV === 'production') return '';
    return 'http://127.0.0.1:8000';
  }

  return backend ?? 'http://127.0.0.1:8000';
}

export const API_URL = resolveApiUrl();
export const BACKEND_URL = getBackendUrl() ?? 'http://127.0.0.1:8000';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function assertBackendConfigured(): void {
  if (IS_PRODUCTION && !getBackendUrl()) {
    throw new Error(
      'BACKEND_API_URL must be set in Vercel to your FastAPI server URL (not the Vercel frontend URL).',
    );
  }
}

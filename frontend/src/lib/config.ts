const DEV_BACKEND_DEFAULT = 'http://127.0.0.1:8000';

function isBlockedBackendUrl(url: string): boolean {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return host.endsWith('.vercel.app') || host.endsWith('.vercel.sh');
  } catch {
    return false;
  }
}

/** FastAPI base URL. In production only BACKEND_API_URL is used (never API_URL). */
export function getBackendUrl(): string | undefined {
  const explicit = process.env.BACKEND_API_URL?.trim().replace(/\/$/, '');
  if (explicit && !isBlockedBackendUrl(explicit)) return explicit;

  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }

  return DEV_BACKEND_DEFAULT;
}

/** Base URL for fetch(). Browser uses same-origin proxy; server calls FastAPI directly. */
export function getApiUrl(): string {
  const backend = getBackendUrl();

  if (typeof window !== 'undefined') {
    return process.env.NODE_ENV === 'production' || backend ? '' : DEV_BACKEND_DEFAULT;
  }

  return backend ?? DEV_BACKEND_DEFAULT;
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function assertBackendConfigured(): void {
  // Browser calls same-origin /api/* proxy routes; BACKEND_API_URL is only required server-side.
  if (typeof window !== 'undefined') return;

  if (IS_PRODUCTION && !getBackendUrl()) {
    throw new Error(
      'BACKEND_API_URL must be set on Vercel to your FastAPI server URL. Remove API_URL from Vercel env vars — Vercel may overwrite it with your deployment URL.',
    );
  }
}

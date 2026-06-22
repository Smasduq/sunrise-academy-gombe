const DEV_BACKEND_DEFAULT = 'http://127.0.0.1:8000';

function isBlockedBackendUrl(url: string): boolean {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return host.endsWith('.vercel.app') || host.endsWith('.vercel.sh');
  } catch {
    return false;
  }
}

/** FastAPI base URL from BACKEND_API_URL. Local dev falls back to 127.0.0.1:8000. */
export function getBackendUrl(): string | undefined {
  const explicit = process.env.BACKEND_API_URL?.trim().replace(/\/$/, '');
  if (explicit && !isBlockedBackendUrl(explicit)) return explicit;

  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }

  return DEV_BACKEND_DEFAULT;
}

/** Used by runtime API route proxies. */
export function resolveBackendUrl(): string | null {
  return getBackendUrl() ?? null;
}

/** Server-side direct calls to FastAPI (login, SSR). */
export function getServerBackendUrl(): string {
  const backend = getBackendUrl();
  if (!backend) {
    throw new Error(
      'BACKEND_API_URL must be set in production to your FastAPI host (e.g. Railway or Render).',
    );
  }
  return backend;
}

/** Browser → same-origin /api/* proxy. Server → BACKEND_API_URL. */
export function resolveApiPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (typeof window !== 'undefined') {
    return path;
  }
  return `${getServerBackendUrl()}${path}`;
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function assertBackendConfigured(): void {
  if (typeof window !== 'undefined') return;

  if (IS_PRODUCTION && !process.env.BACKEND_API_URL?.trim()) {
    throw new Error('BACKEND_API_URL must be set in production.');
  }
}

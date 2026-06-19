function isBlockedBackendUrl(url: string): boolean {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return host.endsWith('.vercel.app') || host.endsWith('.vercel.sh');
  } catch {
    return false;
  }
}

/** FastAPI base URL from BACKEND_API_URL env var. Required in all environments. */
export function getBackendUrl(): string | undefined {
  const explicit = process.env.BACKEND_API_URL?.trim().replace(/\/$/, '');
  if (explicit && !isBlockedBackendUrl(explicit)) return explicit;
  return undefined;
}

/** Base URL for fetch(). Browser uses same-origin proxy; server calls FastAPI directly. */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }

  const backend = getBackendUrl();
  if (!backend) {
    throw new Error('BACKEND_API_URL must be set on server-side. Add it to environment variables.');
  }
  return backend;
}

export function assertBackendConfigured(): void {
  // Browser calls same-origin /api/* proxy routes; BACKEND_API_URL is required server-side.
  if (typeof window !== 'undefined') return;

  if (!getBackendUrl()) {
    throw new Error('BACKEND_API_URL must be set in environment variables.');
  }
}

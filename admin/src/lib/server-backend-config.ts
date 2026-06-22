const DEV_BACKEND_DEFAULT = 'http://127.0.0.1:8000';

export type BackendConfigIssue = 'missing' | 'blocked_vercel' | 'invalid';

export type BackendConfigDiagnostic =
  | { ok: true; baseUrl: string; host: string }
  | { ok: false; issue: BackendConfigIssue; hint: string; configuredHost?: string };

function readEnv(name: 'BACKEND_API_URL' | 'API_URL'): string | undefined {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim().replace(/\/$/, '') : undefined;
}

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return null;
  }
}

function isBlockedBackendHost(host: string): boolean {
  return host.endsWith('.vercel.app') || host.endsWith('.vercel.sh');
}

/** Runtime-only backend URL resolution (never import from client components). */
export function diagnoseBackendConfig(): BackendConfigDiagnostic {
  const explicit = readEnv('BACKEND_API_URL');
  if (explicit) {
    const host = hostnameFromUrl(explicit);
    if (!host) {
      return {
        ok: false,
        issue: 'invalid',
        hint: 'BACKEND_API_URL is not a valid URL.',
      };
    }
    if (isBlockedBackendHost(host)) {
      return {
        ok: false,
        issue: 'blocked_vercel',
        configuredHost: host,
        hint:
          'BACKEND_API_URL must be your FastAPI host (Railway, Render, etc.), not a Vercel deployment URL. Set it in Vercel → Settings → Environment Variables.',
      };
    }
    return { ok: true, baseUrl: explicit, host };
  }

  const legacyApiUrl = readEnv('API_URL');
  if (legacyApiUrl) {
    const legacyHost = hostnameFromUrl(legacyApiUrl);
    if (legacyHost && isBlockedBackendHost(legacyHost)) {
      return {
        ok: false,
        issue: 'blocked_vercel',
        configuredHost: legacyHost,
        hint:
          'Vercel auto-set API_URL to this deployment. Delete API_URL on Vercel and set BACKEND_API_URL to your FastAPI URL instead. Local .env files are not used on Vercel.',
      };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return { ok: true, baseUrl: DEV_BACKEND_DEFAULT, host: '127.0.0.1' };
  }

  return {
    ok: false,
    issue: 'missing',
    hint:
      'BACKEND_API_URL is not set for this deployment. Add it in Vercel → Settings → Environment Variables (Production). Local .env is not deployed.',
  };
}

export function resolveBackendUrl(): string | null {
  const diagnostic = diagnoseBackendConfig();
  return diagnostic.ok ? diagnostic.baseUrl : null;
}

export function getServerBackendUrl(): string {
  const diagnostic = diagnoseBackendConfig();
  if (!diagnostic.ok) {
    throw new Error(diagnostic.hint);
  }
  return diagnostic.baseUrl;
}

export function buildBackendRequestUrl(path: string): string {
  return `${getServerBackendUrl()}${path}`;
}

function getBackendUrl(): string | undefined {
  // Use BACKEND_API_URL on Vercel — API_URL is often auto-set to the deployment URL.
  return (
    process.env.BACKEND_API_URL ??
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL
  )?.replace(/\/$/, '');
}

function resolveApiUrl(): string {
  const backend = getBackendUrl();

  if (process.env.NODE_ENV === 'production' && !backend) {
    throw new Error(
      'BACKEND_API_URL environment variable is required in production.',
    );
  }

  // Browser calls same-origin /api/*; Next.js rewrites proxy to the FastAPI backend.
  if (typeof window !== 'undefined' && backend) {
    return '';
  }

  return backend ?? 'http://127.0.0.1:8000';
}

export const API_URL = resolveApiUrl();
export const BACKEND_URL = getBackendUrl() ?? 'http://127.0.0.1:8000';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

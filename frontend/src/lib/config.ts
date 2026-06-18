function resolveApiUrl(): string {
  const url = process.env.API_URL?.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production' && !url) {
    throw new Error('API_URL environment variable is required in production.');
  }

  return url ?? 'http://127.0.0.1:8000';
}

export const API_URL = resolveApiUrl();

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

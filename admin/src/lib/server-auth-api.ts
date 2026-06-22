import type { LoginResponse } from '@/lib/api';
import { buildBackendRequestUrl } from '@/lib/server-backend-config';

export class ServerApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function serverApiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(buildBackendRequestUrl('/api/auth/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const message = typeof body.detail === 'string' ? body.detail : 'Request failed';
    throw new ServerApiError(message, res.status);
  }

  return res.json() as Promise<LoginResponse>;
}

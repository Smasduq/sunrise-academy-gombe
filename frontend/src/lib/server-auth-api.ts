import type { LoginResponse } from '@/lib/api';
import { buildBackendRequestUrl } from '@/lib/server-backend-config';

type PortalRole = 'student' | 'staff';

export class ServerApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function serverApiLogin(
  role: PortalRole,
  body: Record<string, string>,
): Promise<LoginResponse> {
  const res = await fetch(buildBackendRequestUrl(`/api/auth/${role}/login`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ detail: res.statusText }));
    const message = typeof payload.detail === 'string' ? payload.detail : 'Request failed';
    throw new ServerApiError(message, res.status);
  }

  return res.json() as Promise<LoginResponse>;
}

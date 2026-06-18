import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export type PortalRole = 'STUDENT' | 'STAFF';

export const getSession = cache(async () => {
  return auth();
});

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user || !session.accessToken) {
    redirect('/login');
  }
  if (session.user.status === 'SUSPENDED') {
    redirect('/login?error=suspended');
  }
  return session;
}

export async function requireRole(...roles: PortalRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as PortalRole)) {
    redirect('/login?error=unauthorized');
  }
  return session;
}

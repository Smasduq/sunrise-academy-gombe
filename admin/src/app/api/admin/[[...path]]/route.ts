import { auth } from '@/auth';
import { createProxyHandlers } from '@/lib/backend-proxy';

async function adminAccessToken() {
  const session = await auth();
  return session?.accessToken;
}

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers('/api/admin', adminAccessToken);

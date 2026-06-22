import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { createProxyHandlers } from '@/lib/backend-proxy';

async function adminAccessToken(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  return typeof token?.accessToken === 'string' ? token.accessToken : undefined;
}

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers('/api/admin', adminAccessToken);

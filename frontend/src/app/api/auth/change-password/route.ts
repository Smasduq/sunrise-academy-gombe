import { createSingleProxyHandler } from '@/lib/backend-proxy';

export const { GET, POST, PUT, PATCH, DELETE } =
  createSingleProxyHandler('/api/auth/change-password');

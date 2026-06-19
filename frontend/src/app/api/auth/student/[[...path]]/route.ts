import { createProxyHandlers } from '@/lib/backend-proxy';

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers('/api/auth/student');

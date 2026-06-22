import { createProxyHandlers } from '@/lib/backend-proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandlers('/api/staff');

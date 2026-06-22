import { createSingleProxyHandler } from '@/lib/backend-proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const { GET, POST, PUT, PATCH, DELETE } = createSingleProxyHandler('/api/health');

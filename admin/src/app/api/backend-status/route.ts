import { NextResponse } from 'next/server';
import { diagnoseBackendConfig } from '@/lib/server-backend-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const diagnostic = diagnoseBackendConfig();

  return NextResponse.json({
    ok: diagnostic.ok,
    backend_host: diagnostic.ok ? diagnostic.host : diagnostic.configuredHost ?? null,
    issue: diagnostic.ok ? null : diagnostic.issue,
    hint: diagnostic.ok ? null : diagnostic.hint,
    note:
      'Browser requests hit this Vercel site at /api/* first. The proxy forwards them to backend_host.',
  });
}

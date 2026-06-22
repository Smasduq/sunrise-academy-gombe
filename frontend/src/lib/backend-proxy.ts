import { NextRequest, NextResponse } from 'next/server';
import { diagnoseBackendConfig, resolveBackendUrl } from '@/lib/server-backend-config';

export { resolveBackendUrl };

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const diagnostic = diagnoseBackendConfig();
  if (!diagnostic.ok) {
    return NextResponse.json(
      {
        detail: diagnostic.hint,
        issue: diagnostic.issue,
        configured_host: diagnostic.configuredHost ?? null,
      },
      { status: 503 },
    );
  }

  const url = `${diagnostic.baseUrl}${backendPath}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  const res = await fetch(url, init);
  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');
  responseHeaders.set('X-Proxy-Backend-Host', diagnostic.host);

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export function createProxyHandlers(apiPrefix: string) {
  async function handler(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    const suffix = path?.length ? `/${path.join('/')}` : '';
    return proxyToBackend(request, `${apiPrefix}${suffix}`);
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}

export function createSingleProxyHandler(backendPath: string) {
  async function handler(request: NextRequest) {
    return proxyToBackend(request, backendPath);
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}

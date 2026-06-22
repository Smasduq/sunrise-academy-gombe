import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl } from '@/lib/config';

export { resolveBackendUrl };

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options?: { accessToken?: string | null },
): Promise<NextResponse> {
  const backend = resolveBackendUrl();
  if (!backend) {
    return NextResponse.json(
      {
        detail: 'BACKEND_API_URL is not set. Add your FastAPI URL in environment variables.',
      },
      { status: 503 },
    );
  }

  const url = `${backend}${backendPath}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  if (options?.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

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

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

type AccessTokenResolver = (request: NextRequest) => Promise<string | null | undefined>;

export function createProxyHandlers(apiPrefix: string, resolveAccessToken?: AccessTokenResolver) {
  async function handler(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    const suffix = path?.length ? `/${path.join('/')}` : '';
    const accessToken = resolveAccessToken ? await resolveAccessToken(request) : undefined;

    if (resolveAccessToken && !accessToken) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    return proxyToBackend(request, `${apiPrefix}${suffix}`, { accessToken });
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

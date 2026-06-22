/** Browser calls same-origin /api/*; Next.js route handlers proxy to FastAPI. */
export function resolveApiPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path;
}

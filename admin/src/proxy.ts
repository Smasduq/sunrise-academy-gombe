import { auth } from '@/auth';

export default auth;

export const config = {
  matcher: ['/', '/login', '/dashboard', '/dashboard/:path*'],
};

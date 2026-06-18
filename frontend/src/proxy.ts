import { auth } from '@/auth';

export default auth;

export const config = {
  matcher: [
    '/login',
    '/student',
    '/student/:path*',
    '/staff/:path*',
  ],
};

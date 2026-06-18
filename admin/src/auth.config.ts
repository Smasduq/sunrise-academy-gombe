import type { NextAuthConfig } from 'next-auth';

const DASHBOARD = '/dashboard';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.profileId = user.profileId;
        token.displayName = user.displayName;
        token.identifier = user.identifier;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.profileId = token.profileId as string;
        session.user.displayName = token.displayName as string;
        session.user.identifier = token.identifier as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (isLoggedIn && role === 'ADMIN' && pathname === '/login') {
        return Response.redirect(new URL(DASHBOARD, request.nextUrl));
      }

      if (pathname === '/login') {
        return true;
      }

      if (pathname === '/' || pathname.startsWith('/dashboard')) {
        if (!isLoggedIn) return false;
        return role === 'ADMIN';
      }

      return true;
    },
  },
};

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { ServerApiError, serverApiLogin } from '@/lib/server-auth-api';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        try {
          const data = await serverApiLogin(email.trim(), password);

          return {
            id: data.user_id,
            role: data.role,
            status: 'ACTIVE',
            profileId: data.profile_id,
            displayName: data.display_name,
            identifier: data.identifier,
            accessToken: data.access_token,
          };
        } catch (err) {
          if (err instanceof ServerApiError && err.status === 401) return null;
          console.error('[auth] Admin login failed:', err);
          return null;
        }
      },
    }),
  ],
});

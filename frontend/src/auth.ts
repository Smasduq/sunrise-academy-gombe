import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { ApiError, apiLogin } from '@/lib/api';
import { IS_PRODUCTION } from '@/lib/config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'student',
      name: 'Student / Parent',
      credentials: {
        admissionNumber: { label: 'Admission Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const admissionNumber = credentials?.admissionNumber as string;
        const password = credentials?.password as string;
        if (!admissionNumber || !password) return null;

        try {
          const data = await apiLogin('student', {
            admission_number: admissionNumber.trim(),
            password,
          });

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
          if (err instanceof ApiError && err.status === 401) return null;
          if (!IS_PRODUCTION) {
            console.error('[auth] Student login failed:', err);
          }
          return null;
        }
      },
    }),
    Credentials({
      id: 'staff',
      name: 'Teacher',
      credentials: {
        staffId: { label: 'Teacher ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const staffId = credentials?.staffId as string;
        const password = credentials?.password as string;
        if (!staffId || !password) return null;

        try {
          const data = await apiLogin('staff', {
            staff_id: staffId.trim(),
            password,
          });

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
          if (err instanceof ApiError && err.status === 401) return null;
          if (!IS_PRODUCTION) {
            console.error('[auth] Staff login failed:', err);
          }
          return null;
        }
      },
    }),
  ],
});

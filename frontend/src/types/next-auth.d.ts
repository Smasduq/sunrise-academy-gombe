import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    status: string;
    profileId: string;
    displayName: string;
    identifier: string;
    accessToken: string;
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      status: string;
      profileId: string;
      displayName: string;
      identifier: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    status: string;
    profileId: string;
    displayName: string;
    identifier: string;
    accessToken: string;
  }
}

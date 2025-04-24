// types/next-auth.d.ts
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extends the built-in session types to include custom properties
   */
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    userId?: string;
    error?: string;
    // Ensure the default 'user' object is still defined if needed
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT types to include custom properties
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    userId?: string;
    error?: string;
  }
}

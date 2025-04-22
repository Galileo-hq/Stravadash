import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import StravaProvider from 'next-auth/providers/strava';

/**
 * Extended session type to include Strava tokens
 */
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

/**
 * Extended JWT type to include Strava tokens
 */
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

/**
 * Configuration for Strava OAuth authentication
 * 
 * This file contains the NextAuth configuration for Strava OAuth
 * including the client ID, client secret, authorization URL, token URL,
 * and callback handling.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID || '',
      clientSecret: process.env.STRAVA_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read,activity:read,activity:read_all',
          approval_prompt: 'auto',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Save the tokens to the JWT on initial sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass tokens to the client-side session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
  // Secure cookies in production
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  // Use JWT for session handling
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Custom pages for authentication
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

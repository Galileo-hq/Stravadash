// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth"
import StravaProvider from "next-auth/providers/strava";

// Ensure environment variables are defined
if (!process.env.STRAVA_CLIENT_ID) {
  throw new Error("Missing STRAVA_CLIENT_ID environment variable");
}
if (!process.env.STRAVA_CLIENT_SECRET) {
  throw new Error("Missing STRRAVA_CLIENT_SECRET environment variable");
}
if (!process.env.NEXTAUTH_SECRET) {
  // Generate one with `openssl rand -base64 32`
  // Required for production and recommended for development
  console.warn("Missing NEXTAUTH_SECRET environment variable. Using a default for development only.");
}

export const authOptions: AuthOptions = { // Export AuthOptions for potential reuse
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!, // Use non-null assertion after check
      clientSecret: process.env.STRAVA_CLIENT_SECRET!, // Use non-null assertion after check
      authorization: {
        params: {
          scope: "activity:read_all", // Request necessary scope
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Required for JWT signing
  callbacks: { // <-- Uncommented section
    async jwt({ token, account }) {
      // Persist the OAuth access_token, refresh_token, and expires_at to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // Strava returns expires_at in seconds since epoch, convert to ms for consistency? Check strava-client usage.
        // Keep as seconds for now, assuming strava-client handles it.
        token.expiresAt = account.expires_at;
        token.userId = account.providerAccountId; // Store athlete ID
      }
      // TODO: Add token refresh logic here if needed
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token, refresh_token, user ID from the JWT token.
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.expiresAt = token.expiresAt as number;
      session.userId = token.userId as string; // Pass athlete ID to session
      session.error = token.error as string | undefined; // Pass potential errors
      return session;
    },
  },
  // You might want to add a custom error page later
  // pages: {
  //   signIn: '/auth/signin', // Optional custom sign-in page
  //   error: '/auth/error', // Optional custom error page
  // }
};

const handler = NextAuth(authOptions); // Use the options object

export { handler as GET, handler as POST }

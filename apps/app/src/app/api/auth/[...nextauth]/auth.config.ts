import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // If this is a new sign-in, get the backend user data
        if (account?.provider === 'google') {
          // OAuth tokens are available here:
          // account.access_token - Google access token
          // account.refresh_token - Google refresh token
          // account.providerAccountId - Google user ID

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/oauth`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: user.email,
                  name: user.name,
                  provider: 'google',
                  providerId: user.id,
                  image: user.image,
                }),
              }
            );

            if (response.ok) {
              const userData = await response.json();
              token.id = userData.id.toString();
              token.username =
                userData.username ||
                user.name ||
                user.email?.split('@')[0] ||
                'Player';
              token.image = userData.image;
              // Generate a secure JWT token for API authentication
              token.apiToken = generateAPIToken(userData.id.toString());
            } else {
              console.error(
                'Backend API failed:',
                response.status,
                response.statusText
              );
              // Fallback if backend call fails
              token.id = user.id;
              token.username =
                user.name || user.email?.split('@')[0] || 'Player';
              token.apiToken = generateAPIToken(user.id);
            }
          } catch (error) {
            console.error('Error creating user in backend:', error);
            // Fallback if backend call fails
            token.id = user.id;
            token.username = user.name || user.email?.split('@')[0] || 'Player';
            token.apiToken = generateAPIToken(user.id);
          }
        } else {
          // For existing sessions, keep the current token data
          token.id = user.id;
          token.username = user.name || user.email?.split('@')[0] || 'Player';
          token.image = user.image;
          // Ensure API token exists
          if (!token.apiToken) {
            token.apiToken = generateAPIToken(user.id);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.apiToken = token.apiToken;
        session.user.image = token.image as string;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // The signIn callback is now handled in the JWT callback
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// Helper function to generate JWT API tokens
function generateAPIToken(userId: string): string {
  const payload = {
    userId,
    type: 'api',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours expiration
  };

  return jwt.sign(payload, jwtSecret);
}

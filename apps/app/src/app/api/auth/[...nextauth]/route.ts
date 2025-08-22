import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.name || user.email?.split('@')[0] || 'Player';
        token.coins = 1000;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.coins = token.coins;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Call your NestJS backend API to handle user creation
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
              }),
            }
          );

          if (!response.ok) {
            console.error('Failed to create user in backend');
            return false;
          }

          const userData = await response.json();
          // Update the user object with backend data
          user.id = userData.id.toString();
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };

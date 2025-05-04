import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Full auth options including session and jwt callbacks
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    
    
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Attach user id to token on first login
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure session.user exists before adding id
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      // Add custom logic for allowed users if needed
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

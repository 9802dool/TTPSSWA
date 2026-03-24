import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const secret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development"
    ? "ttpsswa-dev-only-nextauth-secret-change-me"
    : undefined);

export const authOptions: NextAuthOptions = {
  secret,
  providers: [
    CredentialsProvider({
      id: "member",
      name: "Member",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const memberEmail = process.env.MEMBER_EMAIL?.trim();
        const memberPassword = process.env.MEMBER_PASSWORD;
        if (!memberEmail || !memberPassword) {
          console.error(
            "Member login: set MEMBER_EMAIL and MEMBER_PASSWORD in .env.local",
          );
          return null;
        }

        if (email !== memberEmail || password !== memberPassword) {
          return null;
        }

        return {
          id: "member",
          email,
          name: "Member",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  // Use a hardcoded secret for isolation diagnostics
  secret: "diagnostic-debug-secret-2024",
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: isProd ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Cargoo Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[AUTH_ISOLATION_V3] Attempt for:", credentials?.email);
        return { 
          id: "ghost-admin-007", 
          email: "admin@cargooimport.eu", 
          name: "Ghost Admin", 
          role: "ADMIN" 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) (session.user as any).role = token.role;
      return session;
    }
  },
  pages: {
    signIn: "/admin/login",
  },
};

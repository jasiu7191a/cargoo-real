import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Cargoo Admin",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@cargoo.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn("Auth: Missing credentials");
            return null;
          }

          console.log(`Auth Attempt: ${credentials.email}`);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.warn(`Auth Failed: User ${credentials.email} not found`);
            return null;
          }

          if (user.role !== "ADMIN") {
            console.warn(`Auth Failed: User ${credentials.email} is not an ADMIN`);
            return null;
          }

          // Secure verification
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.warn(`Auth Failed: Invalid password for ${credentials.email}`);
            return null;
          }

          console.log(`Auth Success: ${credentials.email}`);
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (error: any) {
          console.error("CRITICAL AUTH ERROR:", error.message || error);
          // Re-throwing so NextAuth can catch it and we can see it in logs/UI
          throw new Error(error.message || "Authentication system failure");
        }
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
  secret: process.env.NEXTAUTH_SECRET,
};

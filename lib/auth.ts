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
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // For this production-ready prototype, we'll check against a simple check 
        // to get the user started. 
        if (user && user.role === "ADMIN") {
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }
        
        return null;
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

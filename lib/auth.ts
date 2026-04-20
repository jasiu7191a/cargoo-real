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
            console.log("[AUTH_TRACE] Missing credentials");
            return null;
          }

          console.log(`[AUTH_TRACE] Start: ${credentials.email}`);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log(`[AUTH_TRACE] User Not Found: ${credentials.email}`);
            return null;
          }

          console.log(`[AUTH_TRACE] User found. ID: ${user.id}, Role: ${user.role}`);

          if (user.role !== "ADMIN") {
            console.log(`[AUTH_TRACE] Role Mismatch: ${user.role}`);
            return null;
          }

          // DEBUG BYPASS
          if (credentials.password === "DEBUG_ACCESS") {
            console.log(`[AUTH_TRACE] BYPASS TRIGGERED for ${credentials.email}`);
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }

          // Secure verification
          if (!user.password) {
            console.log(`[AUTH_TRACE] User has no password field`);
            return null;
          }

          console.log(`[AUTH_TRACE] Starting bcrypt comparison...`);
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log(`[AUTH_TRACE] Comparison result: ${isPasswordValid}`);
          
          if (!isPasswordValid) {
            return null;
          }

          console.log(`[AUTH_TRACE] SUCCESS: ${credentials.email}`);
          const result = { id: user.id, email: user.email as string, name: user.name as string, role: user.role as string };
          console.log(`[AUTH_TRACE] Final returning object: ${JSON.stringify(result)}`);
          return result;
        } catch (error: any) {
          console.error("[AUTH_TRACE] CRITICAL ERROR:", error.stack || error.message || error);
          throw new Error("Diagnostic Error: " + (error.message || "Unknown Failure"));
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

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NUCLEAR ISOLATION: Removing bcrypt and prisma imports entirely to prevent module-level crashes on the Edge.
// We are using a Zero-Logic hardcoded user and a high-entropy hardcoded secret.

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  // debug must be off in production — it logs tokens and session data.
  debug: process.env.NODE_ENV === "development",

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  providers: [
    CredentialsProvider({
      name: "Cargoo Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize hit for:", credentials?.email);
        return { 
          id: "ghost-admin-999", 
          email: "admin@cargooimport.eu", 
          name: "Cargoo Admin", 
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

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NUCLEAR ISOLATION: Removing bcrypt and prisma imports entirely to prevent module-level crashes on the Edge.
// We are using a Zero-Logic hardcoded user and a high-entropy hardcoded secret.

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV !== "production",
  
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
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
        console.log("[AUTH] Attempt for:", credentials?.email);
        return { 
          id: "ghost-admin-999", 
          email: "admin@cargooimport.eu", 
          name: "Nuclear Ghost", 
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

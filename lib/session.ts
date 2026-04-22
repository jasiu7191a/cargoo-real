import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// No fallback: a missing secret must be a hard failure, not a public default.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET env var is required but not set.");
}
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function getAdminSession() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      user: {
        email: payload.email,
        role: payload.role,
        name: "Cargoo Admin"
      }
    };
  } catch (e) {
    console.error("Session verification failed:", e);
    return null;
  }
}

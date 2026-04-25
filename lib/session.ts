import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const getSecret = () => {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET env var is required but not set.");
  return new TextEncoder().encode(s);
};

export async function getAdminSession() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.email !== "string" || typeof payload.role !== "string") return null;
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

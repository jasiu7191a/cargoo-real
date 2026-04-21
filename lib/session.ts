import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "diagnostic-secret-atomic-1234567890-abcdefghijklmnopqrstuvwxyz-!!!");

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

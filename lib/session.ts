import { getCurrentUser } from "@/lib/account-auth";

function isNextDynamicServerError(error: unknown) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).includes("DYNAMIC_SERVER_USAGE")
  );
}

export async function getAdminSession() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: "ADMIN",
        name: "Cargoo Admin",
      },
    };
  } catch (e) {
    if (isNextDynamicServerError(e)) throw e;
    console.error("Session verification failed:", e);
    return null;
  }
}

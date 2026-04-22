// This duplicate admin route tree is deprecated. The real admin lives at /admin.
// This stub redirects any visitor to the authenticated admin login.
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DeprecatedLangAdminIndex() {
  redirect("/admin/login");
}

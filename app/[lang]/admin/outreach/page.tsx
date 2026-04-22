import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DeprecatedLangAdminOutreach() {
  redirect("/admin/outreach");
}

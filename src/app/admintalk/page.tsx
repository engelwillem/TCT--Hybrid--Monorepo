import { redirect } from "next/navigation";
import { resolveServerRouteSession } from "@/lib/server-route-auth";

export const dynamic = "force-dynamic";

export default async function AdminTalkAliasPage() {
  const session = await resolveServerRouteSession();

  if (!session.authenticated) {
    redirect("/login?next=/admintalk");
  }

  if (!session.isAdmin) {
    redirect("/forbidden");
  }

  redirect("/admin/analytics/composer");
}


import { redirect } from "next/navigation";
import { resolveServerRouteSession } from "@/lib/server-route-auth";

export const dynamic = "force-dynamic";

export default async function DashboardAliasPage() {
  const session = await resolveServerRouteSession();

  if (!session.authenticated) {
    redirect("/login?next=/dashboard");
  }

  redirect("/today");
}


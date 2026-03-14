import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Standardized Inbox Messages Proxy
 * Resolved Next.js dynamic routing conflict by standardizing on [id].
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/inbox/${id}/messages${search}`);
}

import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET Inbox Messages (Thread)
 * Standardised on [id] to prevent sibling conflicts and match the relational database model.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/inbox/${id}/messages${search}`);
}

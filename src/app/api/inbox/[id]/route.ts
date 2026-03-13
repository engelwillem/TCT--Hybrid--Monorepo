import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET Inbox Thread
 * Standardised on [id] to match database schema and avoid conflict.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/inbox/${id}${search}`);
}

import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * User Follow Proxy
 * Bridges the social follow interaction between Next.js and Laravel API.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyLaravel(request, `/api/v1/users/${id}/follow-toggle`);
}

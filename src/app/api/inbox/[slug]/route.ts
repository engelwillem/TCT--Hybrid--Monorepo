import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/inbox/${slug}${search}`);
}

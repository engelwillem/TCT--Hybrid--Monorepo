import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Mentor Insight Proxy
 * Standardized on [slug] to resolve Next.js dynamic routing conflicts.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/mentor${search}`);
}

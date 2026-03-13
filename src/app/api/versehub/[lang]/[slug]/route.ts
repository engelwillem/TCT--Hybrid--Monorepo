import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Single dynamic entry for VerseHub to prevent [ref] vs [slug] conflicts.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}${search}`);
}

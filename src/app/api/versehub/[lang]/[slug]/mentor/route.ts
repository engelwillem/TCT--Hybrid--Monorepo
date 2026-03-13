import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { lang, slug } = await context.params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/mentor${search}`);
}

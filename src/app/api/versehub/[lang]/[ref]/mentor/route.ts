import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; ref: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { lang, ref } = await context.params;
  const search = request.nextUrl.search;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${ref}/mentor${search}`);
}


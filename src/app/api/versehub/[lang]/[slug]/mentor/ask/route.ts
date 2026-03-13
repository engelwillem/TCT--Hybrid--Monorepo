import { NextRequest } from "next/request";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

export async function POST(request: any, context: RouteContext) {
  const { lang, slug } = await context.params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/mentor/ask`);
}

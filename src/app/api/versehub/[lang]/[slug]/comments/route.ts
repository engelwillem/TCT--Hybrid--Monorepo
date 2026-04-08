import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { lang, slug } = await context.params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/comments`);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { lang, slug } = await context.params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/comments`);
}

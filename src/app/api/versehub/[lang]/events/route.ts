import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { lang } = await context.params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/events`);
}

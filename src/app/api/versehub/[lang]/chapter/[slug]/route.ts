import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${slug}`);
}

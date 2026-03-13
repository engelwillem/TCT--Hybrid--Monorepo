import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  // Next.js API route parameters are smarter with consistent naming
  const normalizedRef = slug.toLowerCase().replace(/\.png$/i, "");
  return proxyLaravel(request, `/versehub/id/${normalizedRef}/og.png`);
}

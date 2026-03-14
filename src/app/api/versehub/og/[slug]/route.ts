import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * Standardized OG Image Proxy
 * Consolidated [ref] and [slug] into [slug] to resolve dynamic routing conflicts.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const normalizedRef = slug.toLowerCase().replace(/\.png$/i, "");
  return proxyLaravel(request, `/versehub/id/${normalizedRef}/og.png`);
}

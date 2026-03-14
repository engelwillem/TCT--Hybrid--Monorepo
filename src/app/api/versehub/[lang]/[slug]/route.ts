import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Verse/Chapter/OG Proxy
 * Standardized on [slug] to prevent dynamic parameter conflicts ('id' !== 'slug').
 * Automatically detects .png extension for OG image proxying.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  
  if (slug.toLowerCase().endsWith('.png')) {
    const ref = slug.toLowerCase().replace(/\.png$/i, "");
    return proxyLaravel(request, `/versehub/id/${ref}/og.png`);
  }

  const segments = slug.split(/[-_.]/);
  // If it has 3+ segments, it's a verse share (e.g., yoh-3-16)
  // If fewer, it's a chapter reader (e.g., yoh-3)
  if (segments.length < 3) {
    return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${slug}${search}`);
  }

  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}${search}`);
}

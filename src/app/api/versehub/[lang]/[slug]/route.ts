import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Verse/Chapter/Mentor Fetch
 * Standardised on [slug] to prevent sibling ambiguity with [ref].
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  
  // If the slug ends with .png, it's an OG request
  if (slug.toLowerCase().endsWith('.png')) {
    const ref = slug.toLowerCase().replace(/\.png$/i, "");
    return proxyLaravel(request, `/versehub/id/${ref}/og.png`);
  }

  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}${search}`);
}

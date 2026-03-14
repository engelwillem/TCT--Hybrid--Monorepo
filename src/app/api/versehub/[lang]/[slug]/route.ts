import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Verse/Chapter/OG Fetch
 * Standardised on [slug] to prevent dynamic naming conflicts ('id' !== 'slug').
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  
  if (slug.toLowerCase().endsWith('.png')) {
    const ref = slug.toLowerCase().replace(/\.png$/i, "");
    return proxyLaravel(request, `/versehub/id/${ref}/og.png`);
  }

  const segments = slug.split(/[-_.]/);
  if (segments.length < 3) {
    return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${slug}${search}`);
  }

  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}${search}`);
}

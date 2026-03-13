import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Verse/Chapter/OG Fetch
 * Standardised on [slug] to prevent sibling ambiguity conflicts in Next.js 15.
 * Handles both verse refs (yoh-3-16) and chapter refs (yoh-3).
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  
  // Handle requests for OG images if the slug ends with .png
  if (slug.toLowerCase().endsWith('.png')) {
    const ref = slug.toLowerCase().replace(/\.png$/i, "");
    return proxyLaravel(request, `/versehub/id/${ref}/og.png`);
  }

  // Chapter content check (e.g. mat-1)
  const segments = slug.split(/[-_.]/);
  if (segments.length < 3) {
    return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${slug}${search}`);
  }

  // Default verse content
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}${search}`);
}

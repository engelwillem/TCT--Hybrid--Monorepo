import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Verse/Chapter/OG Fetch
 * Standardised on [slug] to prevent sibling ambiguity conflicts in Next.js 15.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  
  // Handle legacy OG image requests if they hit the API
  if (slug.toLowerCase().endsWith('.png')) {
    const ref = slug.toLowerCase().replace(/\.png$/i, "");
    return proxyLaravel(request, `/versehub/id/${ref}/og.png`);
  }

  // Chapter content check
  if (slug.split(/[-_.]/).length < 3) {
    return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${slug}${search}`);
  }

  // Default verse content
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}${search}`);
}

import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * POST Ask Question
 * Standardized on [slug] to resolve sibling ambiguity conflicts under [lang].
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/mentor/ask`);
}

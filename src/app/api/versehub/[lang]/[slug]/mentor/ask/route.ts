import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * POST Ask Question to Scripture Guide
 * Standardised on [slug] to prevent dynamic path collisions.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/mentor/ask`);
}

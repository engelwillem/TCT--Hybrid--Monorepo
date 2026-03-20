import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Chapter Content Proxy
 * Standardized on [slug] to resolve Next.js dynamic routing conflicts.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const normalizedSlug = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^chapter\//, "");
  const parts = normalizedSlug.split("-").filter(Boolean);
  const chapterRef = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : normalizedSlug;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${chapterRef}`);
}

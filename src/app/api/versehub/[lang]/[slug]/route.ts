
import { NextRequest } from "next/server";
import {
  buildReferenceFromSlug,
  englishBibleErrorResponse,
  fetchEnglishVerseBySlug,
  isEnglishBibleLang,
  wantsEnglishBibleFromQuery,
} from "@/lib/english-bible-api";
import { callLaravelApi } from "@/lib/laravel-api";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Consolidated Verse/Chapter Proxy
 * Standardized on [slug] to prevent dynamic parameter conflicts ('id' !== 'slug').
 * This handles both specific verse references (e.g., yoh-3-16) and chapter requests.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const search = request.nextUrl.search;
  const useEnglishApi = isEnglishBibleLang(lang) || (lang === "id" && wantsEnglishBibleFromQuery(request));

  if (useEnglishApi) {
    try {
      const sourceLang = lang === "id" ? "id" : "en";
      const baseResponse = await callLaravelApi(`/versehub/${sourceLang}/${slug}${search}`);
      const basePayload = baseResponse.ok
        ? ((await baseResponse.json()) as Record<string, unknown>)
        : null;
      const payload = await fetchEnglishVerseBySlug(slug);

      const text = String(payload.text || "").trim();
      const reference = String(payload.reference || buildReferenceFromSlug(slug)).trim();
      const translationName = String(payload.translation_name || payload.translation_id || "World English Bible");

      return Response.json({
        ref: basePayload?.ref ?? slug,
        reference,
        text,
        translation_name: translationName,
        provider: "bible-api.com",
        og_image_url: basePayload?.og_image_url ?? "",
        canonical_url: basePayload?.canonical_url ?? `/versehub/${lang}/${slug}`,
      });
    } catch (error) {
      return englishBibleErrorResponse(error);
    }
  }
  
  const segments = slug.split(/[-_.]/);
  
  // Distinguish between Chapter Reader (e.g., yoh-3) and Verse Share (e.g., yoh-3-16)
  if (segments.length < 3) {
    // If it's a chapter request, use the specialized chapter endpoint
    return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${slug}${search}`);
  }

  // Otherwise, it's a specific verse share/detail request
  return proxyLaravel(request, `/versehub/${lang}/${slug}${search}`);
}

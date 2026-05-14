import { NextRequest } from "next/server";
import {
  buildReferenceFromSlug,
  englishBibleErrorResponse,
  fetchEnglishChapter,
  isEnglishBibleLang,
  wantsEnglishBibleFromQuery,
} from "@/lib/english-bible-api";
import { callLaravelApi } from "@/lib/laravel-api";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ lang: string; slug: string }>;
}

type ChapterPayload = {
  selected_book?: string | null;
  selected_chapter?: number | null;
  chapters?: number[];
  chapter_label?: string;
  verses?: Array<{ key: string; verse: number; text: string }>;
  reflection_question?: string;
  has_reflected?: boolean;
};

function normalizeChapterSlug(slug: string): string {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^chapter\//, "");
}

function toVerseList(payload: Record<string, unknown>): Array<{ key: string; verse: number; text: string }> {
  const versesRaw = Array.isArray(payload.verses) ? payload.verses : [];
  return versesRaw
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      const verse = Number(row.verse ?? 0);
      const text = String(row.text || "").trim();
      if (!Number.isFinite(verse) || verse < 1 || !text) return null;
      return { verse, text };
    })
    .filter((row): row is { verse: number; text: string } => row !== null)
    .map((row) => ({ key: `v-${row.verse}`, verse: row.verse, text: row.text }));
}

/**
 * Consolidated Chapter Content Proxy
 * Standardized on [slug] to resolve Next.js dynamic routing conflicts.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { lang, slug } = await params;
  const useEnglishApi = isEnglishBibleLang(lang) || (lang === "id" && wantsEnglishBibleFromQuery(request));
  if (useEnglishApi) {
    try {
      const normalizedSlug = normalizeChapterSlug(slug);
      const sourceLang = lang === "id" ? "id" : "en";
      const baseResponse = await callLaravelApi(`/api/v1/versehub/${sourceLang}/chapter/${normalizedSlug}`);
      if (!baseResponse.ok) {
        return proxyLaravel(request, `/api/v1/versehub/${sourceLang}/chapter/${normalizedSlug}`);
      }

      const basePayload = (await baseResponse.json()) as ChapterPayload;
      const englishPayload = await fetchEnglishChapter(normalizedSlug);
      const englishVerses = toVerseList(englishPayload);

      const mergedVerses = Array.isArray(basePayload.verses)
        ? basePayload.verses.map((row) => {
            const english = englishVerses.find((item) => item.verse === Number(row.verse));
            return english ? { ...row, text: english.text } : row;
          })
        : englishVerses.map((row) => ({
            key: row.key,
            verse: row.verse,
            text: row.text,
          }));

      const chapterLabel = basePayload.chapter_label || buildReferenceFromSlug(normalizedSlug).replace(/:\d+$/, "");

      return Response.json({
        ...basePayload,
        chapter_label: chapterLabel,
        verses: mergedVerses,
      });
    } catch (error) {
      return englishBibleErrorResponse(error);
    }
  }

  const normalizedSlug = normalizeChapterSlug(slug);
  return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${normalizedSlug}`);
}

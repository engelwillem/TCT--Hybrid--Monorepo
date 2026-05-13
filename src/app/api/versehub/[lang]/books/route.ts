import { NextRequest } from "next/server";
import {
  englishBookLabelForCode,
  englishBibleErrorResponse,
  isEnglishBibleLang,
  wantsEnglishBibleFromQuery,
} from "@/lib/english-bible-api";
import { callLaravelApi } from "@/lib/laravel-api";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  if (isEnglishBibleLang(lang) || (lang === "id" && wantsEnglishBibleFromQuery(request))) {
    try {
      const sourceLang = lang === "id" ? "id" : "en";
      const response = await callLaravelApi(`/api/v1/versehub/${sourceLang}/books`);
      if (!response.ok) {
        return proxyLaravel(request, `/api/v1/versehub/${sourceLang}/books`);
      }
      const payload = (await response.json()) as { books?: Array<{ code?: string; label?: string; testament?: "ot" | "nt" }> };
      const books = Array.isArray(payload?.books)
        ? payload.books.map((book) => ({
            code: String(book.code || "").trim().toLowerCase(),
            label: englishBookLabelForCode(String(book.code || book.label || "")),
            testament: book.testament === "nt" ? "nt" : "ot",
          }))
        : [];
      return Response.json({ books });
    } catch (error) {
      return englishBibleErrorResponse(error);
    }
  }
  return proxyLaravel(request, `/api/v1/versehub/${lang}/books`);
}

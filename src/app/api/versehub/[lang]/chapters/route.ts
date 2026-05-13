import { NextRequest } from "next/server";
import {
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
  const searchParams = request.nextUrl.searchParams;
  const book = searchParams.get('book');

  if (isEnglishBibleLang(lang) || (lang === "id" && wantsEnglishBibleFromQuery(request))) {
    try {
      const sourceLang = lang === "id" ? "id" : "en";
      const response = await callLaravelApi(
        `/api/v1/versehub/${sourceLang}/chapters?book=${encodeURIComponent(String(book || ""))}`
      );
      if (!response.ok) {
        return proxyLaravel(request, `/api/v1/versehub/${sourceLang}/chapters?book=${encodeURIComponent(book || "")}`);
      }
      const payload = await response.json();
      return Response.json(payload);
    } catch (error) {
      return englishBibleErrorResponse(error);
    }
  }
  
  return proxyLaravel(
    request, 
    `/api/v1/versehub/${lang}/chapters?book=${encodeURIComponent(book || '')}`
  );
}

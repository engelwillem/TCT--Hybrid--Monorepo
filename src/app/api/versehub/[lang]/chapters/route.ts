import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const searchParams = request.nextUrl.searchParams;
  const book = searchParams.get('book');
  
  return proxyLaravel(
    request, 
    `/api/v1/versehub/${lang}/chapters?book=${encodeURIComponent(book || '')}`
  );
}

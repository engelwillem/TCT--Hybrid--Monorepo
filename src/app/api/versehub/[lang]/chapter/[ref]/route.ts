import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; ref: string }> }
) {
  const { lang, ref } = await params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/chapter/${ref}`);
}

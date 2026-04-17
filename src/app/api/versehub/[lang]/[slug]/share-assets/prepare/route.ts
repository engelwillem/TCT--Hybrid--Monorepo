import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";
import { guardSharePrepareRequest } from "@/lib/share-prepare-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; slug: string }> }
) {
  const guard = guardSharePrepareRequest(request, "versehub");
  if (guard) return guard;

  const { lang, slug } = await params;
  return proxyLaravel(request, `/api/v1/versehub/${lang}/${slug}/share-assets/prepare`);
}

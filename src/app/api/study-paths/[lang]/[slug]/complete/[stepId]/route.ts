import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; slug: string; stepId: string }> },
) {
  const { lang, slug, stepId } = await params;
  return proxyLaravel(
    request,
    `/api/v1/study-paths/${encodeURIComponent(lang)}/${encodeURIComponent(slug)}/complete/${encodeURIComponent(stepId)}`,
  );
}

import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyLaravel(
    request,
    `/api/v1/channels/${encodeURIComponent(slug)}/membership`,
  );
}

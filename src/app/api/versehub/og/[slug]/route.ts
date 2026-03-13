import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  // Menghilangkan ekstensi .png jika ada untuk normalisasi ref Alkitab
  const normalizedRef = slug.toLowerCase().replace(/\.png$/i, "");
  return proxyLaravel(request, `/versehub/id/${normalizedRef}/og.png`);
}

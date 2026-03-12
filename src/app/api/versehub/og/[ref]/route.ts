import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ ref: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { ref } = await context.params;
  const normalizedRef = ref.toLowerCase().replace(/\.png$/i, "");
  return proxyLaravel(request, `/versehub/id/${normalizedRef}/og.png`);
}


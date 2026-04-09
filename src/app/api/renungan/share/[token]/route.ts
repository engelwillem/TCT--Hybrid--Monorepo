import type { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  return proxyLaravel(request, `/api/v1/renungan/share/${encodeURIComponent(token)}`);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  return proxyLaravel(request, `/api/v1/renungan/share/${encodeURIComponent(token)}`);
}


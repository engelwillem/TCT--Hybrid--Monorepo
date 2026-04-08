import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { postId } = await params;
  return proxyLaravel(request, `/api/v1/community/bookmarks/${encodeURIComponent(postId)}/category`);
}


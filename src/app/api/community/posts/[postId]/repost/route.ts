import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  return proxyLaravel(request, `/api/v1/community/posts/${postId}/repost`);
}

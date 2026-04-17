import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";
import { guardSharePrepareRequest } from "@/lib/share-prepare-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const guard = guardSharePrepareRequest(request, "community");
  if (guard) return guard;

  const { postId } = await params;
  return proxyLaravel(request, `/api/v1/community/posts/${postId}/share-assets/prepare`);
}

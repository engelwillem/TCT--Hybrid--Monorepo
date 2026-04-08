import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/community/posts");
}

export async function POST(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/community/posts");
}


export async function DELETE(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) {
    return new Response(JSON.stringify({ message: "postId is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  return proxyLaravel(request, `/api/v1/community/posts/${postId}`);
}

export async function PATCH(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) {
    return new Response(JSON.stringify({ message: "postId is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  return proxyLaravel(request, `/api/v1/community/posts/${postId}`);
}

import { NextRequest, NextResponse } from "next/server";
import { callLaravelApi } from "@/lib/laravel-api";

/**
 * Hardened Proxy: Forwards requests from Next.js to Laravel API.
 * Ensures bit-perfect binary data integrity for multipart uploads (avatars)
 * and supports transparent response forwarding (JSON/HTML/Binary).
 */
export async function proxyLaravel(request: NextRequest, targetPath: string): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    
    const hasBody = !["GET", "HEAD"].includes(request.method);
    
    let body: Uint8Array | undefined = undefined;
    if (hasBody) {
      try {
        // Read as arrayBuffer to preserve binary integrity of multipart boundaries
        const buffer = await request.arrayBuffer();
        body = new Uint8Array(buffer);
      } catch (e) {
        // Body is empty
      }
    }

    const response = await callLaravelApi(targetPath, {
      method: request.method,
      body,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    // Forward the response exactly as received (supports binary data and HTML error pages)
    const responseBuffer = await response.arrayBuffer();

    return new NextResponse(responseBuffer, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        ...(response.headers.has("X-Auth") ? { "X-Auth": response.headers.get("X-Auth")! } : {}),
      },
    });
  } catch (error) {
    console.error("Proxy Connectivity Error:", error);
    return NextResponse.json(
      {
        message: "Laravel API is currently unreachable.",
        detail: error instanceof Error ? error.message : "Unknown connectivity error",
      },
      { status: 503 },
    );
  }
}

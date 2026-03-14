import { NextRequest, NextResponse } from "next/server";
import { callLaravelApi } from "@/lib/laravel-api";

/**
 * Hardened Binary-Safe Proxy: Forwards requests from Next.js to Laravel API.
 * Uses arrayBuffer() and Uint8Array to ensure bit-perfect data integrity
 * for multipart/form-data (essential for stable avatar/image uploads).
 * Also handles non-JSON responses (like 500 HTML errors) gracefully.
 */
export async function proxyLaravel(request: NextRequest, targetPath: string): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    
    const hasBody = !["GET", "HEAD"].includes(request.method);
    
    let body: Uint8Array | undefined = undefined;
    if (hasBody) {
      try {
        const buffer = await request.arrayBuffer();
        body = new Uint8Array(buffer);
      } catch (e) {
        // Body is empty or unreadable
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

    // Forward the response exactly as received (binary safe for both directions)
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

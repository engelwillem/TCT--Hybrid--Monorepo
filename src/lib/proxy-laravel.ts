import { NextRequest, NextResponse } from "next/server";
import { callLaravelApi } from "@/lib/laravel-api";

/**
 * Proksi permintaan dari Next.js ke Laravel API.
 * Hardened: Menjamin integritas data biner (upload) dan transparansi response (JSON/HTML/Biner).
 */
export async function proxyLaravel(request: NextRequest, targetPath: string): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    
    const hasBody = !["GET", "HEAD"].includes(request.method);
    
    let body: Uint8Array | undefined = undefined;
    if (hasBody) {
      try {
        // CRITICAL: Use arrayBuffer to prevent corruption of binary/multipart boundaries
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

    // Handle any response type (JSON success, HTML error pages, or Binary data like images)
    const responseBuffer = await response.arrayBuffer();

    const nextResponse = new NextResponse(responseBuffer, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        ...(response.headers.has("X-Auth") ? { "X-Auth": response.headers.get("X-Auth")! } : {}),
      },
    });

    return nextResponse;
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

import { NextRequest, NextResponse } from "next/server";
import { callLaravelApi, isBaseUrlConfigured } from "@/lib/laravel-api";

/**
 * Hardened Binary-Safe Proxy: Forwards requests from Next.js to Laravel API.
 * Ensures data integrity for file uploads and handles
 * unreachable backend states gracefully without throwing 500 errors.
 */
export async function proxyLaravel(request: NextRequest, targetPath: string): Promise<NextResponse> {
  // 1. Guard against missing configuration
  if (!isBaseUrlConfigured()) {
    console.warn("Proxy Warning: LARAVEL_API_BASE_URL is not configured.");
    return NextResponse.json(
      { 
        message: "Backend configuration missing.",
        detail: "Set LARAVEL_API_BASE_URL in your environment variables." 
      },
      { status: 503 }
    );
  }

  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    
    // We only read the body for methods that typically have one
    const hasBody = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    
    let body: Uint8Array | undefined = undefined;
    if (hasBody) {
      try {
        const buffer = await request.arrayBuffer();
        body = new Uint8Array(buffer);
      } catch (e) {
        // Body might be empty or unreadable
      }
    }

    // 2. Forward request to Laravel
    const response = await callLaravelApi(targetPath, {
      method: request.method,
      body,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    // 3. Clone headers for the proxy response
    const responseHeaders = new Headers();
    const headersToForward = ["content-type", "x-auth", "cache-control", "set-cookie"];
    
    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) responseHeaders.set(header, value);
    });

    // Ensure we always have a content-type
    if (!responseHeaders.has("content-type")) {
      responseHeaders.set("content-type", "application/json");
    }

    // 4. Return the response stream directly (more efficient and robust)
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error(`Proxy ${isAbort ? "Timeout" : "Error"}:`, error);
    
    return NextResponse.json(
      {
        message: "Laravel API is currently unreachable or timed out.",
        detail: error instanceof Error ? error.message : "Unknown connectivity error",
      },
      { status: 503 }
    );
  }
}

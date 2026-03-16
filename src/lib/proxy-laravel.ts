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
    const cookie = request.headers.get("cookie");
    const xsrfToken = request.headers.get("x-xsrf-token") || request.headers.get("X-XSRF-TOKEN");
    const referer = request.headers.get("referer");
    const accept = request.headers.get("accept");
    
    console.log("PROXY_DEBUG_TOKEN:", JSON.stringify(authorization));
    
    console.log("PROXY_DEBUG - Method:", request.method, "TargetPath:", targetPath, "Authorization:", authorization ? "PRESENT" : "MISSING");
    
    // We only read the body for methods that typically have one
    const hasBody = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    
    let body: ArrayBuffer | undefined = undefined;
    if (hasBody) {
      try {
        body = await request.arrayBuffer();
      } catch (e) {
        // Body might be empty or unreadable
      }
    }

    // Append query strings from the original Next.js request if they exist
    const url = new URL(request.url);
    const queryString = url.search;
    let finalPath = targetPath;
    if (queryString) {
      finalPath = targetPath.includes("?") 
        ? `${targetPath}&${queryString.substring(1)}` 
        : `${targetPath}${queryString}`;
    }

    // 2. Forward request to Laravel
    const response = await callLaravelApi(finalPath, {
      method: request.method,
      body,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        ...(accept ? { Accept: accept } : { Accept: "application/json" }),
      },
    });

    // 3. Clone headers for the proxy response
    const responseHeaders = new Headers();
    const headersToForward = ["content-type", "x-auth", "cache-control"];
    
    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) responseHeaders.set(header, value);
    });

    // Handle multiple Set-Cookie headers properly using getSetCookie()
    if (typeof response.headers.getSetCookie === "function") {
      const cookies = response.headers.getSetCookie();
      cookies.forEach(c => responseHeaders.append("set-cookie", c));
    } else {
      const cookieValue = response.headers.get("set-cookie");
      if (cookieValue) responseHeaders.set("set-cookie", cookieValue);
    }

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

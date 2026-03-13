import { NextRequest, NextResponse } from "next/server";
import { callLaravelApi } from "@/lib/laravel-api";

/**
 * Proksi permintaan dari Next.js ke Laravel API.
 * Hardened version: Mendukung multipart/form-data, JSON, dan response non-JSON (HTML/Error).
 */
export async function proxyLaravel(request: NextRequest, targetPath: string): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    
    // Tentukan apakah request membutuhkan body berdasarkan metodenya
    const hasBody = !["GET", "HEAD"].includes(request.method);
    
    // Gunakan Uint8Array untuk menjaga integritas data binary (multipart/upload).
    let body: Uint8Array | undefined = undefined;
    if (hasBody) {
      try {
        const buffer = await request.arrayBuffer();
        body = new Uint8Array(buffer);
      } catch (e) {
        // Body mungkin kosong atau tidak terbaca
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

    // Mengambil response body sebagai text agar aman meskipun Laravel mengembalikan HTML error (500/404)
    // Ini mencegah crash "Unexpected token < in JSON" di sisi Next.js
    const payload = await response.text();

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      {
        message: "Unable to reach Laravel API.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}

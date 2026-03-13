import { NextRequest, NextResponse } from "next/server";
import { callLaravelApi } from "@/lib/laravel-api";

/**
 * Proksi permintaan dari Next.js ke Laravel API.
 * Menggunakan Uint8Array untuk mendukung data binary (seperti upload gambar)
 * tanpa merusak multipart boundaries atau encoding JSON.
 */
export async function proxyLaravel(request: NextRequest, targetPath: string): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    
    // Tentukan apakah request membutuhkan body berdasarkan metodenya
    const hasBody = !["GET", "HEAD"].includes(request.method);
    
    // Gunakan arrayBuffer untuk menjaga integritas data binary/multipart.
    // .text() dapat merusak binary boundaries karena mencoba menginterpretasi byte sebagai string.
    let body: Uint8Array | undefined = undefined;
    if (hasBody) {
      const buffer = await request.arrayBuffer();
      body = new Uint8Array(buffer);
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

    // Mengambil response body sebagai text (asumsi Laravel mengembalikan JSON atau HTML error)
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

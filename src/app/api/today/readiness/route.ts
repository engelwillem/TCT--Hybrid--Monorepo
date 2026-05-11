import { NextRequest, NextResponse } from "next/server";
import { loadTodaySessionContentWithDiagnostics } from "@/features/today-ritual/data/today-session.loader";

function shouldUseStrictMode(request: NextRequest): boolean {
  return (
    request.nextUrl.searchParams.get("strict") === "1" ||
    request.headers.get("x-today-strict-integration") === "true" ||
    process.env.TODAY_STRICT_INTEGRATION === "true"
  );
}

export async function GET(request: NextRequest) {
  const strict = shouldUseStrictMode(request);

  try {
    const loaded = await loadTodaySessionContentWithDiagnostics();
    const usesFallback = loaded.diagnostics.sourceStatus !== "external";

    if (strict && usesFallback) {
      return NextResponse.json(
        {
          ok: false,
          strict,
          sourceStatus: loaded.diagnostics.sourceStatus,
          hasOfflineFallback: loaded.diagnostics.hasOfflineFallback,
          message: "Today readiness failed because fallback content is active.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      strict,
      sourceStatus: loaded.diagnostics.sourceStatus,
      hasOfflineFallback: loaded.diagnostics.hasOfflineFallback,
      message: usesFallback
        ? "Today readiness is serving fallback content."
        : "Today readiness is serving external content.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        strict,
        message: error instanceof Error ? error.message : "Today readiness check failed.",
      },
      { status: 503 }
    );
  }
}

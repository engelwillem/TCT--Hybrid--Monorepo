import { NextRequest, NextResponse } from "next/server";
import {
  loadTodaySessionContentWithDiagnostics,
  warmTodaySessionCache,
} from "@/features/today-ritual/data/today-session.loader";
import { isRenunganExperienceAtRisk } from "@/features/today-ritual/data/today-session.experience";

function shouldUseStrictMode(request: NextRequest): boolean {
  return (
    request.nextUrl.searchParams.get("strict") === "1" ||
    request.headers.get("x-today-strict-integration") === "true" ||
    process.env.TODAY_STRICT_INTEGRATION === "true"
  );
}

function isWarmAuthorized(request: NextRequest): boolean {
  const configuredToken = process.env.TODAY_WARM_TOKEN?.trim();
  if (!configuredToken) {
    return process.env.NODE_ENV !== "production";
  }

  const providedToken = request.headers.get("x-today-warm-token")?.trim();
  return providedToken === configuredToken;
}

export async function GET(request: NextRequest) {
  const strict = shouldUseStrictMode(request);
  const warmRequested = request.nextUrl.searchParams.get("warm") === "1";
  const warmAuthorized = !warmRequested || isWarmAuthorized(request);
  const warm = warmRequested && warmAuthorized;
  const previewDate = request.nextUrl.searchParams.get("previewDate");

  if (warmRequested && !warmAuthorized) {
    return NextResponse.json(
      {
        ok: false,
        strict,
        warm: false,
        warmRequested: true,
        message: "Warm request is not authorized.",
      },
      { status: 403 }
    );
  }

  try {
    const warmResult = warm
      ? await warmTodaySessionCache({
          previewDate,
        })
      : null;

    const loaded = await loadTodaySessionContentWithDiagnostics({
      previewDate,
      strictIntegration: strict,
    });
    const usesFallback = loaded.diagnostics.sourceStatus === "fallback_only";
    const experienceAtRisk = isRenunganExperienceAtRisk({
      sourceStatus: loaded.diagnostics.sourceStatus,
      hasOfflineFallback: loaded.diagnostics.hasOfflineFallback,
      missingRequiredFieldsCount: loaded.diagnostics.missingRequiredFieldsCount,
    });

    if (strict && usesFallback) {
      return NextResponse.json(
        {
          ok: false,
          strict,
          sourceStatus: loaded.diagnostics.sourceStatus,
          experienceState: loaded.diagnostics.experienceState,
          experienceAtRisk,
          hasOfflineFallback: loaded.diagnostics.hasOfflineFallback,
          warm,
          warmResult,
          message: "Today readiness failed because fallback content is active.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      strict,
      warm,
      warmRequested,
      warmResult,
      sourceStatus: loaded.diagnostics.sourceStatus,
      experienceState: loaded.diagnostics.experienceState,
      experienceAtRisk,
      hasOfflineFallback: loaded.diagnostics.hasOfflineFallback,
      missingRequiredFieldsCount: loaded.diagnostics.missingRequiredFieldsCount,
      fallbackNotableCount: loaded.diagnostics.fallbackNotableCount,
      message: usesFallback
        ? "Today readiness is serving fallback content only."
        : loaded.diagnostics.sourceStatus === "cache_stale"
          ? "Today readiness is serving stale cache while refresh is pending."
          : "Today readiness is serving live/fresh session content.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        strict,
        warm,
        warmRequested,
        message: error instanceof Error ? error.message : "Today readiness check failed.",
      },
      { status: 503 }
    );
  }
}

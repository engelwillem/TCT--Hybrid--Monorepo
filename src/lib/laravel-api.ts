/**
 * Laravel API Connectivity Utility
 * 
 * Centralized logic for communicating with the Laravel backend.
 * Uses environment variables to determine the target origin.
 */

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const MISSING_BASE_PLACEHOLDER = "http://missing-laravel-api-base-url.local";
const DEFAULT_PRODUCTION_API_BASE_URL = "https://api.thechoosentalks.org";

function pickConfiguredBaseUrl(): string {
  const candidates = [
    process.env.LARAVEL_API_BASE_URL,
    process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (candidates.length > 0) {
    return trimTrailingSlash(candidates[0]);
  }

  // Tencent Edge runtime can miss non-public env injections.
  // For production, fallback to the known Laravel API origin.
  if (process.env.NODE_ENV === "production") {
    return DEFAULT_PRODUCTION_API_BASE_URL;
  }

  return MISSING_BASE_PLACEHOLDER;
}

/**
 * Safely retrieves the Laravel API base URL.
 * Does not throw during module initialization to prevent SSR crashes.
 */
export function getLaravelApiBaseUrl(): string {
  return pickConfiguredBaseUrl();
}

/**
 * Internal helper to check if the base URL is valid.
 */
export function isBaseUrlConfigured(): boolean {
  const base = pickConfiguredBaseUrl();
  return Boolean(base && !base.includes("missing-laravel-api-base-url"));
}

/**
 * Standardized fetch wrapper for Laravel API calls.
 */
export async function callLaravelApi(path: string, init?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getLaravelApiBaseUrl();
  const target = `${baseUrl}${normalizedPath}`;
  const targetPathname = (() => {
    try {
      return new URL(target).pathname;
    } catch {
      return normalizedPath;
    }
  })();

  // Use a shorter timeout for proxy calls to prevent hanging the Next.js server
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const fetchOptions = {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
  };
  console.info("[laravel-api] request", {
    method: fetchOptions.method || "GET",
    targetPath: targetPathname,
    hasBody: Boolean(fetchOptions.body),
  });

  try {
    const response = await fetch(target, fetchOptions as any);
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

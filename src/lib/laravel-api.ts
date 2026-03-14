/**
 * Laravel API Connectivity Utility
 * 
 * Centralized logic for communicating with the Laravel backend.
 * Uses environment variables to determine the target origin.
 */

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/**
 * Safely retrieves the Laravel API base URL.
 * Does not throw during module initialization to prevent SSR crashes.
 */
export function getLaravelApiBaseUrl(): string {
  const base = process.env.LARAVEL_API_BASE_URL || process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL;
  
  if (!base) {
    // We return a predictable placeholder if the env is missing
    // rather than throwing, allowing the proxy to handle the error gracefully.
    return "http://missing-laravel-api-base-url.local";
  }

  return trimTrailingSlash(base);
}

/**
 * Internal helper to check if the base URL is valid.
 */
export function isBaseUrlConfigured(): boolean {
  const base = process.env.LARAVEL_API_BASE_URL || process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL;
  return Boolean(base && base.length > 0 && !base.includes("missing-laravel-api-base-url"));
}

/**
 * Standardized fetch wrapper for Laravel API calls.
 */
export async function callLaravelApi(path: string, init?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getLaravelApiBaseUrl();
  const target = `${baseUrl}${normalizedPath}`;

  // Use a shorter timeout for proxy calls to prevent hanging the Next.js server
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(target, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(init?.headers ?? {}),
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

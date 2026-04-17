const API_BASE_FALLBACK = "https://api.thechoosentalks.org";
const WEB_BASE_FALLBACK = "https://www.thechoosentalks.org";
const ADMIN_BASE_FALLBACK = "https://admin.thechoosentalks.org";

export function resolveOrigin(raw: string | undefined | null, fallback: string): string {
  const value = String(raw || "").trim();
  if (!value) return fallback;
  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}

export function resolveConfiguredOrigin(
  candidates: Array<string | undefined | null>,
  fallback: string,
): string {
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (!value) continue;
    try {
      return new URL(value).origin;
    } catch {
      continue;
    }
  }
  return fallback;
}

export function resolveApiOrigin(): string {
  return resolveConfiguredOrigin(
    [process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL, process.env.NEXT_PUBLIC_API_BASE_URL],
    API_BASE_FALLBACK,
  );
}

export function resolveWebOrigin(): string {
  return resolveOrigin(process.env.NEXT_PUBLIC_APP_URL, WEB_BASE_FALLBACK);
}

export function resolveAdminOrigin(): string {
  return resolveOrigin(process.env.NEXT_PUBLIC_ADMIN_BASE_URL, ADMIN_BASE_FALLBACK);
}

const APP_ACCESS_TOKEN_KEY = "tct_app_access_token";

function isLikelySanctumToken(token: string): boolean {
  // Laravel Sanctum plain text token format: "{id}|{secret}"
  return /^\d+\|[A-Za-z0-9]+$/.test(token);
}

export function getAppAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const bypass = window.localStorage.getItem("e2e_bypass_token");
  if (bypass && bypass.trim().length > 0) return bypass;

  const raw = window.localStorage.getItem(APP_ACCESS_TOKEN_KEY);
  if (!raw) return null;

  const token = raw.trim();
  if (!token || token === "null" || token === "undefined") {
    window.localStorage.removeItem(APP_ACCESS_TOKEN_KEY);
    return null;
  }

  if (!isLikelySanctumToken(token)) {
    // Cleanup legacy/invalid token formats to prevent noisy unauthorized requests.
    window.localStorage.removeItem(APP_ACCESS_TOKEN_KEY);
    return null;
  }

  return token;
}

export function setAppAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  const clean = token.trim();
  if (!clean) return;
  window.localStorage.setItem(APP_ACCESS_TOKEN_KEY, clean);
}

export function clearAppAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_ACCESS_TOKEN_KEY);
}

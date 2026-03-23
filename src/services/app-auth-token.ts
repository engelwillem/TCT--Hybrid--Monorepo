const APP_ACCESS_TOKEN_KEY = "tct_app_access_token";
const APP_AUTH_SOURCE_KEY = "tct_app_auth_source";
const APP_AUTH_USER_KEY = "tct_app_auth_user";

export type AppAuthSource = "firebase" | "password" | "unknown";
export type AppAuthUser = {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
};

function isLikelySanctumToken(token: string): boolean {
  // Laravel Sanctum plain text token format: "{id}|{secret}"
  return /^\d+\|[A-Za-z0-9]+$/.test(token);
}

function isLocalDevRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

export function getAppAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const bypass = window.localStorage.getItem("e2e_bypass_token");
  if ((process.env.NODE_ENV === "test" || isLocalDevRuntime()) && bypass && bypass.trim().length > 0) {
    return bypass.trim();
  }

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

export function hasAppAccessToken(): boolean {
  return Boolean(getAppAccessToken());
}

export function getAppAuthSource(): AppAuthSource {
  if (typeof window === "undefined") return "unknown";
  const raw = window.localStorage.getItem(APP_AUTH_SOURCE_KEY);
  if (raw === "firebase" || raw === "password") return raw;
  return "unknown";
}

export function getAppAuthUser(): AppAuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(APP_AUTH_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AppAuthUser;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    window.localStorage.removeItem(APP_AUTH_USER_KEY);
    return null;
  }
}

export function setAppAuthUser(user: AppAuthUser): void {
  if (typeof window === "undefined") return;
  const normalized: AppAuthUser = {
    id: typeof user.id === "string" ? user.id : undefined,
    name: typeof user.name === "string" ? user.name : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
    avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : null,
  };
  window.localStorage.setItem(APP_AUTH_USER_KEY, JSON.stringify(normalized));
}

export function setAppAccessToken(token: string, source: AppAuthSource = "unknown"): void {
  if (typeof window === "undefined") return;
  const clean = token.trim();
  if (!clean) return;
  window.localStorage.setItem(APP_ACCESS_TOKEN_KEY, clean);
  window.localStorage.setItem(APP_AUTH_SOURCE_KEY, source);
}

export function clearAppAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(APP_AUTH_SOURCE_KEY);
  window.localStorage.removeItem(APP_AUTH_USER_KEY);
}

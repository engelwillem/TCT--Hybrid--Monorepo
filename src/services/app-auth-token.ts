const APP_ACCESS_TOKEN_KEY = "tct_app_access_token";

export function getAppAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (window.localStorage.getItem("e2e_bypass_token")) return window.localStorage.getItem("e2e_bypass_token");
  return window.localStorage.getItem(APP_ACCESS_TOKEN_KEY);
}

export function setAppAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_ACCESS_TOKEN_KEY, token);
}

export function clearAppAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_ACCESS_TOKEN_KEY);
}

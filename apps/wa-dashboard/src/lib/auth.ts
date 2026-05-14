export const AUTH_COOKIE_NAME = "wa_session_token";

export const API_BASE =
  process.env.NEXT_PUBLIC_WA_API_BASE || "/api/wa-proxy";

export function setAuthCookie(token: string) {
  const oneDay = 60 * 60 * 24;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${oneDay}; SameSite=Lax${secure}`;
}

export function getAuthCookie(): string | null {
  const pairs = document.cookie ? document.cookie.split("; ") : [];
  for (const pair of pairs) {
    const [name, ...rest] = pair.split("=");
    if (name === AUTH_COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export function clearAuthCookie() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

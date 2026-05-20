export function isAuthSurfacePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
}

export function isLandingPath(pathname: string): boolean {
  return pathname === "/";
}

export function isTodayRitualPath(pathname: string): boolean {
  return pathname === "/today" || pathname === "/renungan";
}

export function isVersehubPath(pathname: string): boolean {
  return pathname === "/versehub" || pathname.startsWith("/versehub/");
}

export function requiresAppSession(pathname: string): boolean {
  if (isLandingPath(pathname)) return false;
  if (isAuthSurfacePath(pathname)) return false;
  if (pathname === "/seneco-n8n-test-willem" || pathname.startsWith("/seneco-n8n-test-willem/")) return false;
  if (pathname.startsWith("/legal")) return false;
  if (pathname === "/library" || pathname === "/visitors" || pathname === "/gate-updates") return false;
  return true;
}

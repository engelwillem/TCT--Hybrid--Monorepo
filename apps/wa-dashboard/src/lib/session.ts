export function isAuthFailure(statusCode?: number, message?: string): boolean {
  if (statusCode === 401 || statusCode === 403) return true;
  const text = String(message || "").toLowerCase();
  return text.includes("unauthenticated") || text.includes("unauthorized");
}


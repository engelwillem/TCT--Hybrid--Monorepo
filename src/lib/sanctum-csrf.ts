"use client";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const target = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(target));

  if (!match) return null;

  const rawValue = match.slice(target.length);
  if (!rawValue) return null;

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export async function warmSanctumCsrf(): Promise<string | null> {
  try {
    const response = await fetch("/api/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      // Login/register in this app use token endpoints and can continue without Sanctum cookies.
      console.warn(`CSRF warmup skipped with status ${response.status}`);
      return null;
    }
  } catch (error) {
    // Local Laravel may be offline during frontend-only work; don't block auth requests here.
    console.warn("CSRF warmup skipped because the endpoint is unreachable.", error);
    return null;
  }

  return readCookie("XSRF-TOKEN");
}

export function buildSanctumJsonHeaders(xsrfToken?: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
  };
}

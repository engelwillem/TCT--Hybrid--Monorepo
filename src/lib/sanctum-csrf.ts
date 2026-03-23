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
  const response = await fetch("/api/sanctum/csrf-cookie", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CSRF warmup failed with status ${response.status}`);
  }

  return readCookie("XSRF-TOKEN");
}

export function buildSanctumJsonHeaders(xsrfToken?: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
  };
}

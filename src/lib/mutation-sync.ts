"use client";

export const DATA_MUTATION_EVENT = "tct:data-mutation";
const DATA_MUTATION_STORAGE_KEY = "tct:data-mutation:last";

export type DataMutationDetail = {
  method: string;
  path: string;
  at: number;
};

type DataMutationListener = (detail: DataMutationDetail) => void;

function toAbsoluteUrl(input: RequestInfo | URL): URL | null {
  if (typeof window === "undefined") return null;

  try {
    if (input instanceof URL) return input;
    if (typeof input === "string") return new URL(input, window.location.origin);
    if (input instanceof Request) return new URL(input.url, window.location.origin);
  } catch {
    return null;
  }

  return null;
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const IGNORED_MUTATION_PATHS = ["/api/auth/firebase/sync", "/api/analytics/funnel"];

export function resolveMutationCandidate(input: RequestInfo | URL, init?: RequestInit): DataMutationDetail | null {
  if (typeof window === "undefined") return null;

  const requestMethod = String(
    init?.method || (input instanceof Request ? input.method : "GET")
  ).toUpperCase();

  if (!MUTATION_METHODS.has(requestMethod)) return null;

  const parsedUrl = toAbsoluteUrl(input);
  if (!parsedUrl) return null;
  if (parsedUrl.origin !== window.location.origin) return null;

  const path = parsedUrl.pathname;
  if (!path.startsWith("/api/")) return null;
  if (IGNORED_MUTATION_PATHS.some((ignored) => path.startsWith(ignored))) return null;

  return {
    method: requestMethod,
    path,
    at: Date.now(),
  };
}

export function notifyDataMutation(detail: DataMutationDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent<DataMutationDetail>(DATA_MUTATION_EVENT, { detail }));

  try {
    window.localStorage.setItem(DATA_MUTATION_STORAGE_KEY, JSON.stringify(detail));
  } catch {
    // Storage can fail in private mode; custom event still works in-tab.
  }
}

export function subscribeDataMutation(listener: DataMutationListener): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<DataMutationDetail>;
    const detail = custom.detail;
    if (!detail || typeof detail.path !== "string") return;
    listener(detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== DATA_MUTATION_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as DataMutationDetail;
      if (!parsed || typeof parsed.path !== "string") return;
      listener(parsed);
    } catch {
      // ignore malformed payload
    }
  };

  window.addEventListener(DATA_MUTATION_EVENT, onCustomEvent as EventListener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(DATA_MUTATION_EVENT, onCustomEvent as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}

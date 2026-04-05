import { clearAppAccessToken, getAppAccessToken, hasAppAuthenticatedSession } from "@/services/app-auth-token";

type AppAuthHeaderOptions = {
  accept?: string;
  contentType?: string | null;
  includeBearerFallback?: boolean;
};

export function buildAppAuthHeaders(options: AppAuthHeaderOptions = {}): Headers {
  const headers = new Headers();
  const token = options.includeBearerFallback ? getAppAccessToken() : null;

  headers.set("Accept", options.accept ?? "application/json");

  if (options.contentType) {
    headers.set("Content-Type", options.contentType);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export function hasAppAuthToken(): boolean {
  return hasAppAuthenticatedSession();
}

type FetchWithAppAuthOptions = {
  includeBearerFallback?: boolean;
  clearLocalSessionOnUnauthorized?: boolean;
};

export async function fetchWithAppAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithAppAuthOptions = {}
): Promise<Response> {
  const includeBearerFallback = options.includeBearerFallback ?? true;
  const clearLocalSessionOnUnauthorized = options.clearLocalSessionOnUnauthorized ?? true;

  const makeRequest = async (withBearerFallback: boolean) => {
    const headers = new Headers(init.headers);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (withBearerFallback) {
      const token = getAppAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return fetch(input, {
      ...init,
      headers,
    });
  };

  let response = await makeRequest(false);
  if (response.status !== 401 || !includeBearerFallback) {
    if (response.status === 401 && clearLocalSessionOnUnauthorized) {
      clearAppAccessToken();
    }
    return response;
  }

  if (getAppAccessToken()) {
    response = await makeRequest(true);
  }

  if (response.status === 401 && clearLocalSessionOnUnauthorized) {
    clearAppAccessToken();
  }

  return response;
}

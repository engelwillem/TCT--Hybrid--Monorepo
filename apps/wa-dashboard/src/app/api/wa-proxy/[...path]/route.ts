import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.WA_API_BASE_SERVER ||
  process.env.NEXT_PUBLIC_WA_API_BASE ||
  "https://api.thechoosentalks.org/api/v1";
const UPSTREAM_TIMEOUT_MS = 20000;
const ALLOWED_PREFIXES = ["login", "profile", "wa", "auth"];
const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 12;

type LoginRateEntry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __waLoginRateLimitStore: Map<string, LoginRateEntry> | undefined;
}

function buildUpstreamUrl(pathSegments: string[], searchParams: URLSearchParams): string {
  const safeBase = UPSTREAM_BASE.endsWith("/") ? UPSTREAM_BASE.slice(0, -1) : UPSTREAM_BASE;
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const qs = searchParams.toString();
  return `${safeBase}/${path}${qs ? `?${qs}` : ""}`;
}

function isAllowedPath(pathSegments: string[]): boolean {
  if (pathSegments.length === 0) return false;
  return ALLOWED_PREFIXES.includes(pathSegments[0]);
}

function getRateStore(): Map<string, LoginRateEntry> {
  if (!globalThis.__waLoginRateLimitStore) {
    globalThis.__waLoginRateLimitStore = new Map<string, LoginRateEntry>();
  }
  return globalThis.__waLoginRateLimitStore;
}

async function hashEmail(value: string): Promise<string> {
  if (!value) return "no-email";
  const data = new TextEncoder().encode(value.toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

async function applyLoginRateLimit(ip: string, bodyText: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  let email = "";
  try {
    const parsed = JSON.parse(bodyText) as { email?: string };
    email = String(parsed?.email || "").trim().toLowerCase();
  } catch {
    email = "";
  }

  const emailHash = await hashEmail(email);
  const key = `${ip}|${emailHash}`;
  const now = Date.now();
  const store = getRateStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  existing.count += 1;
  store.set(key, existing);
  return { allowed: true };
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  if (!isAllowedPath(pathSegments)) {
    return NextResponse.json(
      {
        status: false,
        message: "Proxy path is not allowed.",
      },
      { status: 403 }
    );
  }

  const upstreamUrl = buildUpstreamUrl(pathSegments, request.nextUrl.searchParams);
  const headers = new Headers();
  const requestId = crypto.randomUUID();

  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (authorization) headers.set("authorization", authorization);
  headers.set("x-request-id", requestId);

  const method = request.method.toUpperCase();
  const isLoginEndpoint = method === "POST" && pathSegments.length === 1 && pathSegments[0] === "login";
  let body: string | undefined = undefined;
  if (!["GET", "HEAD"].includes(method)) {
    body = await request.text();
    if (isLoginEndpoint) {
      const rateResult = await applyLoginRateLimit(getClientIp(request), body);
      if (!rateResult.allowed) {
        return NextResponse.json(
          {
            status: false,
            message: "Too many login attempts. Please try again shortly.",
          },
          {
            status: 429,
            headers: {
              "retry-after": String(rateResult.retryAfterSec || 60),
              "x-request-id": requestId,
            },
          }
        );
      }
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (_err) {
    return NextResponse.json(
      {
        status: false,
        message: "Upstream API unavailable.",
      },
      {
        status: 502,
        headers: {
          "x-request-id": requestId,
          "x-upstream-status": "unreachable",
        },
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
      "x-request-id": requestId,
      "x-upstream-status": String(response.status),
    },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path || []);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path || []);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path || []);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path || []);
}

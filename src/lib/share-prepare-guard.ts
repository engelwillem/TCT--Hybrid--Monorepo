import { NextRequest, NextResponse } from "next/server";

const APP_SESSION_COOKIE = "tct_app_session";
const RATE_LIMIT_STORE_KEY = "__tctSharePrepareRateLimitStore";
const RATE_LIMIT_LIMIT = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

function isLikelySanctumToken(token: string): boolean {
  return /^\d+\|[A-Za-z0-9]+$/.test(token);
}

function readSessionTokenFromCookie(request: NextRequest): string | null {
  const raw = request.cookies.get(APP_SESSION_COOKIE)?.value?.trim();
  if (!raw || !isLikelySanctumToken(raw)) return null;
  return raw;
}

function readBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  const token = authorization.slice(7).trim();
  return isLikelySanctumToken(token) ? token : null;
}

function getRateLimitStore(): Map<string, RateLimitBucket> {
  const globalWithStore = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_KEY]?: Map<string, RateLimitBucket>;
  };
  if (!globalWithStore[RATE_LIMIT_STORE_KEY]) {
    globalWithStore[RATE_LIMIT_STORE_KEY] = new Map<string, RateLimitBucket>();
  }
  return globalWithStore[RATE_LIMIT_STORE_KEY];
}

function consumeRateLimit(key: string, now = Date.now()): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const store = getRateLimitStore();
  const existing = store.get(key);
  const resetAt = existing && existing.resetAt > now ? existing.resetAt : now + RATE_LIMIT_WINDOW_MS;
  const bucket: RateLimitBucket = existing && existing.resetAt > now
    ? existing
    : { count: 0, resetAt };

  if (bucket.count >= RATE_LIMIT_LIMIT) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  if (store.size > 5000) {
    for (const [bucketKey, value] of store.entries()) {
      if (value.resetAt <= now) {
        store.delete(bucketKey);
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_LIMIT - bucket.count),
    retryAfterSeconds: 0,
  };
}

function extractClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function guardSharePrepareRequest(
  request: NextRequest,
  scope: "community" | "renungan" | "versehub"
): NextResponse | null {
  const token = readBearerToken(request) ?? readSessionTokenFromCookie(request);
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized. Sign in first before preparing share assets." },
      { status: 401 }
    );
  }

  const actorKey = `token:${token.slice(0, 24)}:ip:${extractClientIp(request)}`;
  const rateLimitKey = `share-prepare:${scope}:${actorKey}`;
  const rateLimit = consumeRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { message: "Too many prepare requests. Please retry shortly." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_LIMIT));
    response.headers.set("X-RateLimit-Remaining", "0");
    return response;
  }

  return null;
}

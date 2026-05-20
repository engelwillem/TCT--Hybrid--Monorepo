import { NextResponse } from "next/server";

type Transport =
  | "registered-webhook"
  | "production-webhook"
  | "webhook-test"
  | "fallback-failed";

const REGISTERED_URL =
  process.env.N8N_SENECO_REGISTERED_WEBHOOK_URL ||
  "http://localhost:5678/webhook/oZJcDm7VMNRhOQJS/webhook/seneco-n8n-test-willem";
const PROD_URL =
  process.env.N8N_SENECO_PRODUCTION_WEBHOOK_URL ||
  "http://localhost:5678/webhook/seneco-n8n-test-willem";
const TEST_URL =
  process.env.N8N_SENECO_TEST_WEBHOOK_URL ||
  "http://localhost:5678/webhook-test/seneco-n8n-test-willem";
const TIMEOUT_MS = Number(process.env.N8N_SENECO_TIMEOUT_MS || "15000");

function withTicketId(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.ticketId === "string" && candidate.ticketId.trim()) {
    return payload;
  }
  return {
    ...candidate,
    ticketId: `WEB-${Date.now()}`,
  };
}

async function postToN8n(url: string, payload: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    return { ok: res.ok, status: res.status, body: json };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }
  payload = withTicketId(payload);

  try {
    const registered = await postToN8n(REGISTERED_URL, payload);
    if (registered.ok) {
      return NextResponse.json({
        ...(typeof registered.body === "object" && registered.body !== null
          ? registered.body
          : { data: registered.body }),
        transport: "registered-webhook" as Transport,
        n8nUrlUsed: REGISTERED_URL,
        httpStatus: registered.status,
      });
    }

    const prod = await postToN8n(PROD_URL, payload);
    if (prod.ok) {
      return NextResponse.json({
        ...(typeof prod.body === "object" && prod.body !== null ? prod.body : { data: prod.body }),
        transport: "production-webhook" as Transport,
        n8nUrlUsed: PROD_URL,
        httpStatus: prod.status,
      });
    }

    if (registered.status === 404 || prod.status === 404) {
      const test = await postToN8n(TEST_URL, payload);
      if (test.ok) {
        return NextResponse.json({
          ...(typeof test.body === "object" && test.body !== null ? test.body : { data: test.body }),
          transport: "webhook-test" as Transport,
          n8nUrlUsed: TEST_URL,
          httpStatus: test.status,
          fallbackReason: "registered-and-production-webhook-not-registered",
        });
      }
      return NextResponse.json(
        {
          status: "system_error",
          errorCode: "N8N_WEBHOOK_FALLBACK_FAILED",
          errorMessage: "Production webhook failed and webhook-test fallback also failed.",
          transport: "fallback-failed" as Transport,
          n8nUrlUsed: TEST_URL,
          httpStatus: test.status,
          upstream: {
            registered: registered.body,
            production: prod.body,
            test: test.body,
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        status: "system_error",
        errorCode: "N8N_UPSTREAM_ERROR",
        errorMessage: "n8n returned a non-success response.",
        transport: "fallback-failed" as Transport,
        n8nUrlUsed: PROD_URL,
        httpStatus: prod.status,
        upstream: {
          registered: registered.body,
          production: prod.body,
        },
      },
      { status: 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown transport error";
    return NextResponse.json(
      {
        status: "system_error",
        errorCode: "N8N_TRANSPORT_EXCEPTION",
        errorMessage: message,
        transport: "fallback-failed" as Transport,
        n8nUrlUsed: PROD_URL,
        httpStatus: 0,
      },
      { status: 500 },
    );
  }
}

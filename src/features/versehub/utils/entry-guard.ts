export const VERSEHUB_READER_ALLOWED_INTENTS = [
  "clarify",
  "deep-read",
  "chapter-context",
] as const;

export type VersehubReaderAllowedIntent = (typeof VERSEHUB_READER_ALLOWED_INTENTS)[number];

type QueryParams = Record<string, string | string[] | undefined>;

function readParam(params: QueryParams, key: string): string | null {
  const value = params[key];
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = String(raw || "").trim().toLowerCase();
  return normalized || null;
}

export function isAllowedVersehubReaderIntent(intent: string | null): intent is VersehubReaderAllowedIntent {
  if (!intent) return false;
  return (VERSEHUB_READER_ALLOWED_INTENTS as readonly string[]).includes(intent);
}

export function shouldRenderVersehubReader(params: QueryParams): boolean {
  const source = readParam(params, "source");
  const intent = readParam(params, "intent");
  if (source !== "renungan") return false;
  return isAllowedVersehubReaderIntent(intent);
}

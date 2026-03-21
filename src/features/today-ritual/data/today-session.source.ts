import { fetchJsonObjectWithTimeout } from './fetch-json';
import type { TodaySessionApiPayloadV1 } from './today-session.contract';

export type RawTodaySessionPayload = TodaySessionApiPayloadV1;
export type FetchTodaySessionRawOptions = {
  previewDate?: string | null;
};

function normalizePreviewDate(previewDate?: string | null): string | null {
  if (!previewDate) return null;
  const trimmed = previewDate.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function resolveTodaySessionEndpoint(): string | null {
  const explicitEndpoint = process.env.TODAY_SESSION_ENDPOINT?.trim();
  if (explicitEndpoint) {
    return explicitEndpoint;
  }

  const laravelBaseUrl = process.env.LARAVEL_API_BASE_URL?.trim();
  if (laravelBaseUrl) {
    return `${laravelBaseUrl.replace(/\/+$/, '')}/api/today/session`;
  }

  return null;
}

function appendPreviewDate(endpoint: string, previewDate: string): string {
  const [base, hash] = endpoint.split('#', 2);
  const separator = base.includes('?') ? '&' : '?';
  const withQuery = `${base}${separator}previewDate=${encodeURIComponent(previewDate)}`;

  return hash ? `${withQuery}#${hash}` : withQuery;
}

export async function fetchTodaySessionRaw(
  options: FetchTodaySessionRawOptions = {}
): Promise<RawTodaySessionPayload | null> {
  const endpoint = resolveTodaySessionEndpoint();
  const timeoutMs = Number(process.env.TODAY_SESSION_TIMEOUT_MS ?? 4500);
  const revalidateSeconds = Number(process.env.TODAY_SESSION_REVALIDATE_SECONDS ?? 300);

  if (!endpoint) {
    return null;
  }
  const previewDate = normalizePreviewDate(options.previewDate);
  const url = previewDate ? appendPreviewDate(endpoint, previewDate) : endpoint;

  const payload = await fetchJsonObjectWithTimeout(url, {
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 4500,
    revalidateSeconds: Number.isFinite(revalidateSeconds) ? revalidateSeconds : 300,
  });

  return payload as RawTodaySessionPayload;
}

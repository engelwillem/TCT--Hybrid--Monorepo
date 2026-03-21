type FetchJsonObjectOptions = {
  revalidateSeconds?: number;
  timeoutMs?: number;
};

export type FetchBoundaryErrorCode =
  | 'TIMEOUT'
  | 'NON_200_RESPONSE'
  | 'INVALID_JSON'
  | 'INVALID_PAYLOAD_SHAPE'
  | 'NETWORK_ERROR';

export class FetchBoundaryError extends Error {
  code: FetchBoundaryErrorCode;
  status?: number;

  constructor(code: FetchBoundaryErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'FetchBoundaryError';
    this.code = code;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function fetchJsonObjectWithTimeout(
  url: string,
  options: FetchJsonObjectOptions = {}
): Promise<Record<string, unknown>> {
  const timeoutMs = options.timeoutMs ?? 4500;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;

    try {
      response = await fetch(url, {
        signal: controller.signal,
        next: options.revalidateSeconds ? { revalidate: options.revalidateSeconds } : undefined,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new FetchBoundaryError('TIMEOUT', `Request timed out after ${timeoutMs}ms`);
      }
      throw new FetchBoundaryError('NETWORK_ERROR', 'Network request failed');
    }

    if (!response.ok) {
      throw new FetchBoundaryError(
        'NON_200_RESPONSE',
        `External source responded with ${response.status}`,
        response.status
      );
    }

    const rawText = await response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new FetchBoundaryError('INVALID_JSON', 'Response body is not valid JSON');
    }

    if (!isRecord(parsed)) {
      throw new FetchBoundaryError('INVALID_PAYLOAD_SHAPE', 'Payload must be a JSON object');
    }

    return parsed;
  } finally {
    clearTimeout(timeoutId);
  }
}

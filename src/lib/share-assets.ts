/**
 * share-assets.ts
 *
 * Client helpers for calling backend share-asset prepare endpoints.
 *
 * Rules:
 *  - These are called on USER INTENT (share click) — never from OG routes
 *  - Always return a usable result even on failure (graceful degradation)
 *  - Share URLs returned are versioned via ?v=<revision>
 */

export type ShareAssetResult = {
  status: 'ready' | 'pending' | 'failed';
  revision: string;
  assetId: number | null;
  shareTitle: string | null;
  shareDescription: string | null;
  shareEyebrow: string | null;
  finalOgImageUrl: string | null;
  fromCache: boolean;
  shareUrl: string;
};

export type ShareSurface = 'community' | 'renungan' | 'versehub';

type PrepareApiResponse = {
  data?: {
    status?: string;
    revision?: string;
    asset_id?: number | null;
    share_title?: string | null;
    share_description?: string | null;
    share_eyebrow?: string | null;
    final_og_image_url?: string | null;
    from_cache?: boolean;
    share_url?: string;
  };
};

const inFlightPreparePolls = new Map<string, Promise<ShareAssetResult | null>>();

function createAbortError(): Error {
  const error = new Error("Request aborted");
  error.name = "AbortError";
  return error;
}

function buildPollKey(surface: ShareSurface, subjectId: string, lang: string): string {
  return `${surface}:${lang}:${subjectId}`;
}

async function sleepWithAbort(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return;
  }

  if (signal.aborted) throw createAbortError();

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);

    const onAbort = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      reject(createAbortError());
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function awaitWithAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) throw createAbortError();

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const onAbort = () => {
        signal.removeEventListener("abort", onAbort);
        reject(createAbortError());
      };

      signal.addEventListener("abort", onAbort, { once: true });
      promise.finally(() => signal.removeEventListener("abort", onAbort));
    }),
  ]);
}

function mapResponse(data: PrepareApiResponse['data'], fallbackShareUrl: string): ShareAssetResult {
  const revision = String(data?.revision ?? '');
  const shareUrl =
    data?.share_url ??
    (revision ? `${fallbackShareUrl}${fallbackShareUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(revision)}` : fallbackShareUrl);

  return {
    status:           (data?.status as ShareAssetResult['status']) ?? 'ready',
    revision,
    assetId:          data?.asset_id ?? null,
    shareTitle:       data?.share_title ?? null,
    shareDescription: data?.share_description ?? null,
    shareEyebrow:     data?.share_eyebrow ?? null,
    finalOgImageUrl:  data?.final_og_image_url ?? null,
    fromCache:        Boolean(data?.from_cache),
    shareUrl,
  };
}

/**
 * Prepare a share asset for a community post.
 * Called when user clicks share — returns versioned share URL and OG image.
 */
export async function prepareCommunityShareAsset(postId: string, signal?: AbortSignal): Promise<ShareAssetResult | null> {
  const fallbackUrl = `/community/posts/${encodeURIComponent(postId)}/share`;

  try {
    const response = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/share-assets/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as PrepareApiResponse;
    if (!payload?.data) return null;

    return mapResponse(payload.data, fallbackUrl);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e;
    return null;
  }
}

/**
 * Prepare a share asset for a VerseHub verse.
 */
export async function prepareVersehubShareAsset(lang: string, slug: string, signal?: AbortSignal): Promise<ShareAssetResult | null> {
  const fallbackUrl = `/versehub/${lang}/share/${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(`/api/versehub/${lang}/${encodeURIComponent(slug)}/share-assets/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as PrepareApiResponse;
    if (!payload?.data) return null;

    return mapResponse(payload.data, fallbackUrl);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e;
    return null;
  }
}

/**
 * Prepare a share asset for a Renungan snapshot.
 */
export async function prepareRenunganShareAsset(token: string, signal?: AbortSignal): Promise<ShareAssetResult | null> {
  const fallbackUrl = `/renungan/share/${encodeURIComponent(token)}`;

  try {
    const response = await fetch(`/api/renungan/share/${encodeURIComponent(token)}/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as PrepareApiResponse;
    if (!payload?.data) return null;

    return mapResponse(payload.data, fallbackUrl);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e;
    return null;
  }
}

/**
 * Ensures a share asset is ready by polling the prepare endpoint.
 */
export async function ensureShareAssetReady(
  surface: ShareSurface,
  subjectId: string,
  config: {
    maxRetries?: number;
    delayMs?: number;
    maxDelayMs?: number;
    lang?: string;
    signal?: AbortSignal;
  } = {}
): Promise<ShareAssetResult | null> {
  const { maxRetries = 5, delayMs = 1500, maxDelayMs = 5000, lang = 'id', signal } = config;
  const pollKey = buildPollKey(surface, subjectId, lang);
  const existingPoll = inFlightPreparePolls.get(pollKey);
  if (existingPoll) {
    return await awaitWithAbort(existingPoll, signal);
  }

  const pollPromise = (async () => {
    let attempts = 0;
    let nextDelayMs = delayMs;

    while (attempts < maxRetries) {
      if (signal?.aborted) throw createAbortError();

      let result: ShareAssetResult | null = null;

      try {
        if (surface === 'community') {
          result = await prepareCommunityShareAsset(subjectId, signal);
        } else if (surface === 'renungan') {
          result = await prepareRenunganShareAsset(subjectId, signal);
        } else if (surface === 'versehub') {
          result = await prepareVersehubShareAsset(lang, subjectId, signal);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') throw e;
        result = null;
      }

      if (result && result.status === 'ready') {
        return result;
      }

      if (result && result.status === 'failed') {
        return result;
      }

      attempts += 1;
      if (attempts < maxRetries) {
        const jitterMs = Math.floor(Math.random() * 250);
        await sleepWithAbort(nextDelayMs + jitterMs, signal);
        nextDelayMs = Math.min(maxDelayMs, Math.round(nextDelayMs * 1.7));
      }
    }

    return null;
  })();

  inFlightPreparePolls.set(pollKey, pollPromise);
  try {
    return await awaitWithAbort(pollPromise, signal);
  } finally {
    if (inFlightPreparePolls.get(pollKey) === pollPromise) {
      inFlightPreparePolls.delete(pollKey);
    }
  }
}

import type { ComposerInsightBehaviorContext } from "../hooks/useComposerInsights";

const INSIGHT_CONTEXT_STORAGE_KEY = "tct:community:composer:insights:v1";
const INSIGHT_CONTEXT_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

type CounterKey = "abandon" | "draftRestore" | "submitSuccess";

type StoredCounter = {
  count: number;
  lastAt: number | null;
};

type StoredInsightContext = {
  version: 1;
  updatedAt: number;
  lastSubmitSuccessAt: number | null;
  counters: Record<CounterKey, StoredCounter>;
};

function freshCounter(): StoredCounter {
  return { count: 0, lastAt: null };
}

function createFreshContext(now = Date.now()): StoredInsightContext {
  return {
    version: 1,
    updatedAt: now,
    lastSubmitSuccessAt: null,
    counters: {
      abandon: freshCounter(),
      draftRestore: freshCounter(),
      submitSuccess: freshCounter(),
    },
  };
}

function sanitizeCounter(counter: StoredCounter | undefined, now: number): StoredCounter {
  if (!counter) return freshCounter();
  if (typeof counter.count !== "number" || !Number.isFinite(counter.count)) return freshCounter();
  if (counter.lastAt !== null && typeof counter.lastAt !== "number") return freshCounter();

  if (!counter.lastAt || now - counter.lastAt > INSIGHT_CONTEXT_WINDOW_MS) {
    return freshCounter();
  }

  return {
    count: Math.max(0, Math.floor(counter.count)),
    lastAt: counter.lastAt,
  };
}

function parseStoredInsightContext(raw: string | null, now: number): StoredInsightContext {
  if (!raw) return createFreshContext(now);

  try {
    const parsed = JSON.parse(raw) as Partial<StoredInsightContext> | null;
    if (!parsed || parsed.version !== 1) return createFreshContext(now);

    const stored: StoredInsightContext = {
      version: 1,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : now,
      lastSubmitSuccessAt:
        parsed.lastSubmitSuccessAt !== null && typeof parsed.lastSubmitSuccessAt !== "number"
          ? null
          : (parsed.lastSubmitSuccessAt ?? null),
      counters: {
        abandon: sanitizeCounter(parsed.counters?.abandon, now),
        draftRestore: sanitizeCounter(parsed.counters?.draftRestore, now),
        submitSuccess: sanitizeCounter(parsed.counters?.submitSuccess, now),
      },
    };

    if (stored.lastSubmitSuccessAt && now - stored.lastSubmitSuccessAt > INSIGHT_CONTEXT_WINDOW_MS) {
      stored.lastSubmitSuccessAt = null;
    }

    return stored;
  } catch {
    return createFreshContext(now);
  }
}

function toBehaviorContext(context: StoredInsightContext): ComposerInsightBehaviorContext {
  return {
    recentAbandonCount: context.counters.abandon.count,
    lastAbandonAt: context.counters.abandon.lastAt,
    recentDraftRestoreCount: context.counters.draftRestore.count,
    recentSubmitSuccessCount: context.counters.submitSuccess.count,
    lastSubmitSuccessAt: context.lastSubmitSuccessAt,
    updatedAt: context.updatedAt,
  };
}

function persist(context: StoredInsightContext) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INSIGHT_CONTEXT_STORAGE_KEY, JSON.stringify(context));
}

function readStored(now = Date.now()): StoredInsightContext {
  if (typeof window === "undefined") return createFreshContext(now);
  return parseStoredInsightContext(window.localStorage.getItem(INSIGHT_CONTEXT_STORAGE_KEY), now);
}

export function readComposerInsightContext(): ComposerInsightBehaviorContext {
  return toBehaviorContext(readStored(Date.now()));
}

export function incrementComposerInsightCounter(kind: CounterKey): ComposerInsightBehaviorContext {
  const now = Date.now();
  const current = readStored(now);
  const next = {
    ...current,
    updatedAt: now,
    counters: {
      ...current.counters,
      [kind]: {
        count: current.counters[kind].count + 1,
        lastAt: now,
      },
    },
  };

  if (kind === "submitSuccess") {
    next.lastSubmitSuccessAt = now;
  }

  persist(next);
  return toBehaviorContext(next);
}

import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type UseAuthPingOptions = {
    intervalMs?: number;
};

// Ensure we never create multiple intervals across layout re-mounts / HMR / fast navigation.
// This is module-scoped on purpose.
let sharedIntervalId: number | null = null;
let sharedAbortController: AbortController | null = null;
let sharedVisibilityListenerAttached = false;
let sharedRefCount = 0;

function onVisibilityChange() {
    // If user returns to the tab, run a ping immediately to refresh auth state.
    if (document.visibilityState === 'visible') {
        void doPing();
    } else {
        // If hidden, abort any in-flight request.
        abortInFlight();
    }
}

function abortInFlight() {
    if (sharedAbortController) {
        try {
            sharedAbortController.abort();
        } catch {
            // ignore
        }
        sharedAbortController = null;
    }
}

async function doPing() {
    // Only ping when tab is active/visible.
    if (document.visibilityState !== 'visible') return;

    // Prevent overlapping requests.
    abortInFlight();
    sharedAbortController = new AbortController();

    try {
        const res = await fetch(route('auth.ping'), {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            signal: sharedAbortController.signal,
        });

        if (!res.ok) return;

        // Backend returns 204 with X-Auth: 1|0.
        const xAuth = res.headers.get('X-Auth');
        if (xAuth === '0') {
            // If logged out elsewhere, do a hard redirect to avoid any Inertia state weirdness.
            abortInFlight();
            window.location.href = '/';
            return;
        }
    } catch (err) {
        // Ignore aborts and transient network errors.
        // (AbortError is expected when navigating quickly.)
    }
}

function ensureStarted(intervalMs: number) {
    if (sharedIntervalId !== null) return;

    // Run a ping soon after mount (but still respects visibility + abort rules).
    void doPing();

    sharedIntervalId = window.setInterval(() => {
        void doPing();
    }, intervalMs);

    if (!sharedVisibilityListenerAttached) {
        sharedVisibilityListenerAttached = true;
        document.addEventListener('visibilitychange', onVisibilityChange);
    }
}

function stopIfUnused() {
    if (sharedRefCount > 0) return;

    if (sharedIntervalId !== null) {
        window.clearInterval(sharedIntervalId);
        sharedIntervalId = null;
    }

    abortInFlight();
}

/**
 * useAuthPing
 *
 * - Called from exactly one global layout.
 * - Uses a module-scoped singleton interval so it never duplicates.
 * - Pings every `intervalMs` (default 60s).
 * - Only runs when the tab is visible.
 * - Uses AbortController to prevent overlapping requests.
 */
export function useAuthPing(options: UseAuthPingOptions = {}) {
    const { intervalMs = 60_000 } = options;
    const page = usePage();
    const isAuthed = Boolean(page.props.auth?.user);

    useEffect(() => {
        // Only run for authenticated sessions.
        // If user is not logged in, we don't need to ping.
        if (!isAuthed) return;

        sharedRefCount += 1;
        ensureStarted(intervalMs);

        return () => {
            sharedRefCount -= 1;
            stopIfUnused();
        };
        // Intentionally only depend on intervalMs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalMs, isAuthed]);
}

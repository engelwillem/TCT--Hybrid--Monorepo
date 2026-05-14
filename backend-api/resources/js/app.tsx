import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import AppErrorBoundary from '@/Components/system/AppErrorBoundary';

// Keep a reference to the page importers so we can prefetch critical page chunks.
// This improves perceived navigation speed (especially first time / -> /login -> /today, and /today -> /channels).
const pageImporters = import.meta.glob('./Pages/**/*.tsx');

function prefetchPageChunk(path: string) {
    const importer = pageImporters[`./Pages/${path}.tsx`];
    if (!importer) return;

    try {
        void importer();
    } catch {
        // ignore
    }
}

const appName =
    document
        ?.querySelector('meta[name="app-name"]')
        ?.getAttribute('content') ||
    import.meta.env.VITE_APP_NAME ||
    'TheChosenTalks';

// Ensure Ziggy always uses the current origin to avoid host-mismatch CSRF issues
// in local dev (e.g. mixing localhost and 127.0.0.1).
const ziggyRef = (window as unknown as { Ziggy?: Record<string, unknown> }).Ziggy;
if (ziggyRef && typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/+$/, '');
    ziggyRef.url = origin;
    ziggyRef.port = window.location.port || null;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            pageImporters,
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AppErrorBoundary>
                <App {...props} />
            </AppErrorBoundary>,
        );

        // Prefetch the most common page chunks during idle time so navigation feels instant.
        const warm = () => {
            // Landing / auth
            prefetchPageChunk('Auth/Welcome');
            prefetchPageChunk('Auth/Login');
            prefetchPageChunk('Auth/Register');

            // Main app
            prefetchPageChunk('Welcome');
            prefetchPageChunk('Channels/Index');
            // Keep prefetching this chunk for backward compatibility (route `/library` redirects to `/community`).
            prefetchPageChunk('Library');
            prefetchPageChunk('Community/Index');
            prefetchPageChunk('Profile');
            prefetchPageChunk('Settings/OpsVisibility');
            prefetchPageChunk('VerseHub/Reader');
        };

        const win = window as unknown as {
            requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
        };

        if (typeof win.requestIdleCallback === 'function') {
            win.requestIdleCallback(warm, { timeout: 1500 });
        } else {
            window.setTimeout(warm, 350);
        }
    },
    progress: {
        color: '#4B5563',
    },
    // Make link prefetch a bit more aggressive globally (still lightweight).
    defaults: {
        prefetch: {
            cacheFor: '1m',
            hoverDelay: 60,
        },
    },
});

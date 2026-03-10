@php
    /**
     * Minimal (temporary) bridge nav so /admintalk pages still expose the main app navigation.
     * We keep this as plain Blade/HTML so Filament (Livewire) doesn't depend on Inertia/React.
     *
     * Requirements:
     * - show icons (Lucide-like inline SVG)
     * - highlight active item based on current URL
     */

    $items = [
        [
            'id' => 'home',
            'label' => 'Home',
            'href' => '/today',
            'activePatterns' => ['today', 'today/*'],
        ],
        [
            'id' => 'channels',
            'label' => 'Channels',
            'href' => '/channels',
            'activePatterns' => ['channels', 'channels/*'],
        ],
        [
            'id' => 'community',
            'label' => 'Community',
            'href' => '/community',
            'activePatterns' => ['community', 'community/*'],
        ],
        [
            'id' => 'bible',
            'label' => 'Bible',
            'href' => '/versehub/id',
            'activePatterns' => ['versehub/id', 'versehub/id/*'],
        ],
        [
            'id' => 'settings',
            'label' => 'Settings',
            'href' => '/profile',
            'activePatterns' => ['profile', 'profile/*'],
        ],
    ];

    $isActive = fn(array $item): bool => collect($item['activePatterns'] ?? [])
        ->contains(fn(string $pattern) => request()->is($pattern));

    $renderIcon = function (string $id): string {
        // Inline Lucide-like SVGs (stroke-based) so Filament can render without needing React.
        return match ($id) {
            'home' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="m3 9 9-7 9 7" /><path d="M9 22V12h6v10" /><path d="M21 10v11a1 1 0 0 1-1 1h-3" /><path d="M3 10v11a1 1 0 0 0 1 1h3" /></svg>',
            'channels' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>',
            'community' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>',
            'bible' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M2 7v14" /><path d="M22 7v14" /><path d="M2 7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5" /><path d="M2 21a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5" /><path d="M6 11h8" /><path d="M6 15h8" /></svg>',
            'settings' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10.51 3H10.6A2 2 0 0 1 12 1a2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.07.2.1.41.1.62 0 .21-.03.42-.1.62A1.65 1.65 0 0 0 20.91 11H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0 19.4 15Z" /></svg>',
            default => '',
        };
    };
@endphp

<style>
    /* Scoped styles for Filament (do NOT rely on Tailwind utilities being present in Filament panel CSS). */
    .tct-mainapp-bottomnav-wrap {
        position: fixed;
        left: 0;
        right: 0;
        z-index: 9999;
        display: flex;
        justify-content: center;
        pointer-events: none;
        /* allow only nav to be clickable */
        bottom: calc(16px + env(safe-area-inset-bottom));
    }

    .tct-mainapp-bottomnav {
        pointer-events: auto;
        width: 100%;
        max-width: 380px;
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 28px;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        gap: 6px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
        backdrop-filter: blur(8px);
    }

    .tct-mainapp-navitem {
        text-decoration: none;
        color: rgba(30, 41, 59, 0.75);
        flex: 1;
        min-width: 64px;
        padding: 10px 10px 8px;
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: relative;
        transition: background 160ms ease, color 160ms ease;
        user-select: none;
    }

    .tct-mainapp-navitem:hover {
        background: rgba(15, 23, 42, 0.04);
        color: rgba(15, 23, 42, 0.95);
    }

    .tct-mainapp-navitem--active {
        color: rgba(15, 23, 42, 0.95);
    }

    .tct-mainapp-navitem-indicator {
        position: absolute;
        top: 0;
        width: 18px;
        height: 2px;
        border-radius: 999px;
        background: transparent;
        transition: background 160ms ease;
    }

    .tct-mainapp-navitem--active .tct-mainapp-navitem-indicator {
        background: rgba(15, 23, 42, 0.95);
    }

    .tct-mainapp-navitem svg {
        width: 20px;
        height: 20px;
    }

    .tct-mainapp-navlabel {
        font-size: 11px;
        line-height: 1;
        font-weight: 600;
        opacity: 0.9;
    }

    .tct-mainapp-navitem:not(.tct-mainapp-navitem--active) .tct-mainapp-navlabel {
        font-weight: 500;
        opacity: 0.75;
    }

    /* Hide on desktop to avoid clashing with Filament admin UX. */
    @media (min-width: 768px) {
        .tct-mainapp-bottomnav-wrap {
            display: none;
        }
    }
</style>

@if(!request()->routeIs('filament.admin.auth.*'))
<div class="tct-mainapp-bottomnav-wrap">
    <nav class="tct-mainapp-bottomnav" aria-label="Main App Navigation">
        @foreach ($items as $item)
        @php($active = $isActive($item))
        <a href="{{ $item['href'] }}" class="tct-mainapp-navitem {{ $active ? 'tct-mainapp-navitem--active' : '' }}"
            aria-current="{{ $active ? 'page' : 'false' }}">
            <span aria-hidden class="tct-mainapp-navitem-indicator"></span>

            {!! $renderIcon($item['id']) !!}

            <span class="tct-mainapp-navlabel">
                {{ $item['label'] }}
            </span>
        </a>
        @endforeach
    </nav>
</div>
@endif
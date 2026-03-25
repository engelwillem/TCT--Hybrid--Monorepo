@php
    $mainAppBaseUrl = rtrim((string) env('NEXT_PUBLIC_APP_URL', 'http://localhost:9002'), '/');

    $links = [
        [
            'label' => 'Renungan',
            'href' => $mainAppBaseUrl . '/renungan',
            'activePatterns' => ['renungan', 'renungan/*', 'today', 'today/*'],
            'icon' => '<path d="m3 9 9-7 9 7" /><path d="M9 22V12h6v10" />',
        ],
        [
            'label' => 'VerseHub',
            'href' => $mainAppBaseUrl . '/versehub/id',
            'activePatterns' => ['versehub/id', 'versehub/id/*'],
            'icon' => '<path d="M12 6v15" /><path d="M3 18V5a2 2 0 0 1 2-2h8" /><path d="M12 5h7a2 2 0 0 1 2 2v11" /><path d="M3 18a2 2 0 0 0 2 2h14" /><path d="M12 18a2 2 0 0 0-2-2H3" /><path d="M12 18a2 2 0 0 1 2-2h7" />',
        ],
        [
            'label' => 'Community',
            'href' => $mainAppBaseUrl . '/community',
            'activePatterns' => ['community', 'community/*'],
            'icon' => '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />',
        ],
        [
            'label' => 'Profile',
            'href' => $mainAppBaseUrl . '/profile',
            'activePatterns' => ['profile', 'profile/*'],
            'icon' => '<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" /><path d="M20 21a8 8 0 0 0-16 0" />',
        ],
    ];

    $isActive = fn(array $link): bool => collect($link['activePatterns'] ?? [])
        ->contains(fn(string $pattern) => request()->is($pattern));
@endphp

<style>
    /* Scoped styles for Filament sidebar links (avoid Tailwind dependency). */
    .tct-mainapp-sidebar-wrap {
        padding: 12px 16px 18px;
        position: sticky;
        bottom: 0px;
        z-index: 10;
        background: rgb(248, 250, 252);
        /* Matches default Filament sidebar bg */
    }

    .tct-mainapp-sidebar-card {
        border: 1px solid rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.7);
        border-radius: 14px;
        padding: 10px;
        font-size: 12px;
    }

    .tct-mainapp-sidebar-title {
        font-weight: 700;
        color: rgba(15, 23, 42, 0.85);
        margin-bottom: 8px;
    }

    .tct-mainapp-sidebar-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .tct-mainapp-sidebar-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 10px;
        border-radius: 10px;
        text-decoration: none;
        color: rgba(30, 41, 59, 0.82);
        transition: background 160ms ease, color 160ms ease;
    }

    .tct-mainapp-sidebar-link:hover {
        background: rgba(15, 23, 42, 0.04);
    }

    .tct-mainapp-sidebar-link--active {
        background: rgba(15, 23, 42, 0.05);
        color: rgba(15, 23, 42, 0.95);
        font-weight: 700;
    }

    .tct-mainapp-sidebar-left {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .tct-mainapp-sidebar-icon {
        width: 16px;
        height: 16px;
        color: rgba(100, 116, 139, 1);
        flex: 0 0 auto;
    }

    .tct-mainapp-sidebar-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tct-mainapp-sidebar-arrow {
        color: rgba(148, 163, 184, 1);
        flex: 0 0 auto;
    }
</style>

<div class="tct-mainapp-sidebar-wrap">
    <div class="tct-mainapp-sidebar-card">
        <div class="tct-mainapp-sidebar-title">Main App</div>
        <div class="tct-mainapp-sidebar-list">
            @foreach ($links as $link)
            @php($active = $isActive($link))
            <a href="{{ $link['href'] }}"
                class="tct-mainapp-sidebar-link {{ $active ? 'tct-mainapp-sidebar-link--active' : '' }}"
                aria-current="{{ $active ? 'page' : 'false' }}">
                <span class="tct-mainapp-sidebar-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="tct-mainapp-sidebar-icon" aria-hidden="true">
                        {!! $link['icon'] ?? '' !!}
                    </svg>
                    <span class="tct-mainapp-sidebar-label">{{ $link['label'] }}</span>
                </span>
                <span class="tct-mainapp-sidebar-arrow">→</span>
            </a>
            @endforeach
        </div>
    </div>
</div>

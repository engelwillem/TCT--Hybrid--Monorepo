@php
    $links = [
        [
            'label' => 'Back to Main App',
            'href' => '/today',
            'activePatterns' => ['today', 'today/*'],
            'icon' => '<path d="m3 9 9-7 9 7" /><path d="M9 22V12h6v10" />',
        ],
        [
            'label' => 'Profile / Settings',
            'href' => '/profile',
            'activePatterns' => ['profile', 'profile/*'],
            'icon' => '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10.51 3H10.6A2 2 0 0 1 12 1a2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.07.2.1.41.1.62 0 .21-.03.42-.1.62A1.65 1.65 0 0 0 20.91 11H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0 19.4 15Z" />',
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
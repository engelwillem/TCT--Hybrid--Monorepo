@php
    use Filament\Support\Enums\Width;

    $livewire ??= null;

    $renderHookScopes = $livewire?->getRenderHookScopes();
    $maxContentWidth ??= (filament()->getSimplePageMaxContentWidth() ?? Width::Large);

    if (is_string($maxContentWidth)) {
        $maxContentWidth = Width::tryFrom($maxContentWidth) ?? $maxContentWidth;
    }
@endphp

<x-filament-panels::layout.base :livewire="$livewire">
    @props([
        'after' => null,
        'heading' => null,
        'subheading' => null,
    ])

    <style>
        /* Premium AuthShell-like styling for Filament auth pages */
        .tct-auth-shell {
            position: relative;
            min-height: 100vh;
            color: #0f172a;
        }

        .tct-auth-bg {
            pointer-events: none;
            position: absolute;
            inset: 0;
            overflow: hidden;
        }

        .tct-auth-bg-base {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 10% 15%, rgba(56,189,248,0.18), transparent 38%), radial-gradient(circle at 90% 85%, rgba(59,130,246,0.14), transparent 36%), linear-gradient(180deg, #f8fcff 0%, #eef7ff 54%, #e8f3ff 100%);
        }

        .tct-auth-bg-dots {
            position: absolute;
            inset: 0;
            opacity: 0.38;
            background-image: radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0);
            background-size: 22px 22px;
            animation: tct-twinkle 8s ease-in-out infinite;
        }

        .tct-auth-orb {
            position: absolute;
            border-radius: 9999px;
            filter: blur(64px);
        }

        .tct-auth-orb--top {
            top: -112px;
            left: 50%;
            width: 520px;
            height: 520px;
            transform: translateX(-50%);
            background: rgba(56,189,248,0.22);
            animation: tct-float 14s ease-in-out infinite;
        }

        .tct-auth-orb--right {
            bottom: -176px;
            right: -180px;
            width: 560px;
            height: 560px;
            background: rgba(59,130,246,0.18);
            animation: tct-float2 18s ease-in-out infinite;
        }

        .tct-auth-orb--left {
            bottom: -160px;
            left: -180px;
            width: 520px;
            height: 520px;
            background: rgba(14,165,233,0.14);
            animation: tct-float3 20s ease-in-out infinite;
        }

        .tct-auth-container {
            position: relative;
            margin: 0 auto;
            width: 100%;
            max-width: 72rem;
            display: flex;
            min-height: 100vh;
            flex-direction: column;
            padding: 40px 16px;
        }

        .tct-auth-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            text-align: center;
        }

        .tct-auth-brand h1 {
            margin: 0;
            font-weight: 600;
            letter-spacing: -0.02em;
            font-size: clamp(2.25rem, 3.5vw, 3.25rem);
            line-height: 1.1;
        }

        .tct-auth-brand .tct-auth-brand-accent {
            background: linear-gradient(to right, #0ea5e9, #2563eb);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .tct-auth-brand p {
            margin: 0;
            font-size: 0.875rem;
            color: rgba(15,23,42,0.60);
        }

        .tct-auth-main {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
        }

        .tct-auth-footer {
            padding-bottom: 8px;
            text-align: center;
            font-size: 0.75rem;
            color: rgba(15,23,42,0.45);
        }

        .tct-auth-footer a {
            color: inherit;
            text-decoration: none;
        }

        .tct-auth-footer a:hover {
            color: rgba(15,23,42,0.70);
        }

        @keyframes tct-float {
            0%, 100% { transform: translate(-50%, 0px) scale(1); opacity: 0.9; }
            50% { transform: translate(-50%, 18px) scale(1.03); opacity: 1; }
        }

        @keyframes tct-float2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.7; }
            50% { transform: translate(-18px, -14px) scale(1.05); opacity: 0.95; }
        }

        @keyframes tct-float3 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.6; }
            50% { transform: translate(18px, -10px) scale(1.04); opacity: 0.9; }
        }

        @keyframes tct-twinkle {
            0%, 100% { opacity: 0.16; filter: blur(0px); }
            50% { opacity: 0.30; filter: blur(0.2px); }
        }
    </style>

    <div class="fi-simple-layout tct-auth-shell">
        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::SIMPLE_LAYOUT_START, scopes: $renderHookScopes) }}

        <div class="tct-auth-bg" aria-hidden>
            <div class="tct-auth-bg-base"></div>
            <div class="tct-auth-bg-dots"></div>
            <div class="tct-auth-orb tct-auth-orb--top"></div>
            <div class="tct-auth-orb tct-auth-orb--right"></div>
            <div class="tct-auth-orb tct-auth-orb--left"></div>
        </div>

        <div class="tct-auth-container">
            <header class="tct-auth-brand">
                <h1>
                    TheChoosen<span class="tct-auth-brand-accent">Talks</span>
                </h1>
                <p>Choose n Talks</p>
            </header>

        @if (($hasTopbar ?? true) && filament()->auth()->check())
            <div class="fi-simple-layout-header">
                @if (filament()->hasDatabaseNotifications())
                    @livewire(filament()->getDatabaseNotificationsLivewireComponent(), [
                        'lazy' => filament()->hasLazyLoadedDatabaseNotifications(),
                        'position' => \Filament\Enums\DatabaseNotificationsPosition::Topbar,
                    ])
                @endif

                @if (filament()->hasUserMenu())
                    @livewire(Filament\Livewire\SimpleUserMenu::class)
                @endif
            </div>
        @endif

            <div class="fi-simple-main-ctn tct-auth-main">
                <main
                @class([
                    'fi-simple-main',
                    ($maxContentWidth instanceof Width) ? "fi-width-{$maxContentWidth->value}" : $maxContentWidth,
                ])
            >
                {{ $slot }}
            </main>
            </div>

            <footer class="tct-auth-footer">
                <a href="https://www.instagram.com/willberth.channel/" target="_blank" rel="noreferrer">
                    © Copyright 2026 — WillBerth Channel
                </a>
            </footer>
        </div>

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::FOOTER, scopes: $renderHookScopes) }}

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::SIMPLE_LAYOUT_END, scopes: $renderHookScopes) }}
    </div>
</x-filament-panels::layout.base>


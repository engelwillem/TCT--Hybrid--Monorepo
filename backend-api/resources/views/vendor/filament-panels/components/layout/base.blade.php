@props([
    'livewire' => null,
])

@php
    $renderHookScopes = $livewire?->getRenderHookScopes();
@endphp

<!DOCTYPE html>
<html
    lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    dir="{{ __('filament-panels::layout.direction') ?? 'ltr' }}"
    @class([
        'fi',
        'dark' => filament()->hasDarkModeForced(),
    ])
>
    <head>
        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::HEAD_START, scopes: $renderHookScopes) }}

        <meta charset="utf-8" />
        <meta name="csrf-token" content="{{ csrf_token() }}" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        @if ($favicon = filament()->getFavicon())
            <link rel="icon" href="{{ $favicon }}" />
        @endif

        @php
            $title = trim(strip_tags($livewire?->getTitle() ?? ''));
            $brandName = trim(strip_tags(filament()->getBrandName()));
        @endphp

        <title>
            {{ filled($title) ? $title : null }}
            {{ filled($brandName) && filled($title) ? ' - ' : null }}
            {{ filled($brandName) ? $brandName : null }}
        </title>

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::STYLES_BEFORE, scopes: $renderHookScopes) }}

        <style>
            [x-cloak=''],
            [x-cloak='x-cloak'],
            [x-cloak='1'] {
                display: none !important;
            }

            [x-cloak='inline-flex'] {
                display: inline-flex !important;
            }

            @media (max-width: 1023px) {
                [x-cloak='-lg'] {
                    display: none !important;
                }
            }

            @media (min-width: 1024px) {
                [x-cloak='lg'] {
                    display: none !important;
                }
            }
        </style>

        @filamentStyles

        {{-- Premium auth overrides for Filament (login, etc.) --}}
        <style>
            /* Button styling: match AuthShell CTA */
            .tct-auth-shell .fi-btn.fi-color-primary {
                border-radius: 9999px !important;
                height: 3rem !important;
                width: 100% !important;
                padding-inline: 1.5rem !important;

                background-image: linear-gradient(to right, #0ea5e9, #2563eb) !important;
                background-color: transparent !important;
                color: #020617 !important;
                font-weight: 600 !important;

                box-shadow: 0 0 0 1px rgba(14,165,233,0.22), 0 16px 48px rgba(37,99,235,0.20) !important;
            }

            .tct-auth-shell .fi-btn.fi-color-primary:hover {
                box-shadow: 0 0 0 1px rgba(14,165,233,0.30), 0 22px 60px rgba(37,99,235,0.24) !important;
            }

            /* Inputs: light premium surface like main app */
            .tct-auth-shell .fi-input-wrp {
                border-radius: 1.5rem !important;
                border: 1px solid rgba(15, 23, 42, 0.10) !important;
                background: rgba(255,255,255,0.92) !important;
            }

            .tct-auth-shell .fi-input {
                color: #0f172a !important;
            }

            .tct-auth-shell .fi-fo-field-label,
            .tct-auth-shell .fi-fo-field-label-content {
                color: rgba(15, 23, 42, 0.85) !important;
                font-weight: 600 !important;
            }

            .tct-auth-shell .fi-fo-checkbox {
                color: rgba(15, 23, 42, 0.70) !important;
            }

            .tct-auth-shell .fi-fo-checkbox input[type="checkbox"] {
                border-color: rgba(15, 23, 42, 0.20) !important;
                background: rgba(255,255,255,0.90) !important;
            }

            /* Reduce Filament default gaps so it feels like AuthShell */
            .tct-auth-shell .fi-simple-page-content {
                padding-top: 0 !important;
            }

            /* Bottom link row: match public premium login */
            .tct-auth-shell .tct-auth-links-row {
                margin-top: 1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.875rem;
            }

            .tct-auth-shell .tct-auth-link {
                color: rgba(3, 105, 161, 0.95);
                text-decoration: none;
                text-underline-offset: 4px;
            }

            .tct-auth-shell .tct-auth-link:hover {
                color: rgba(2, 132, 199, 1);
                text-decoration: underline;
            }
        </style>

        {{ filament()->getTheme()->getHtml() }}
        {{ filament()->getFontPreloadHtml() }}
        {{ filament()->getMonoFontPreloadHtml() }}
        {{ filament()->getSerifFontPreloadHtml() }}
        {{ filament()->getFontHtml() }}
        {{ filament()->getMonoFontHtml() }}
        {{ filament()->getSerifFontHtml() }}

        <style>
            :root {
                --font-family: '{!! filament()->getFontFamily() !!}';
                --mono-font-family: '{!! filament()->getMonoFontFamily() !!}';
                --serif-font-family: '{!! filament()->getSerifFontFamily() !!}';
                --sidebar-width: {{ filament()->getSidebarWidth() }};
                --collapsed-sidebar-width: {{ filament()->getCollapsedSidebarWidth() }};
                --default-theme-mode: {{ filament()->getDefaultThemeMode()->value }};
            }
        </style>

        @stack('styles')

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::STYLES_AFTER, scopes: $renderHookScopes) }}

        @if (! filament()->hasDarkMode())
            <script>
                localStorage.setItem('theme', 'light')
            </script>
        @elseif (filament()->hasDarkModeForced())
            <script>
                localStorage.setItem('theme', 'dark')
            </script>
        @else
            <script>
                const loadDarkMode = () => {
                    window.theme = localStorage.getItem('theme') ?? @js(filament()->getDefaultThemeMode()->value)

                    if (
                        window.theme === 'dark' ||
                        (window.theme === 'system' &&
                            window.matchMedia('(prefers-color-scheme: dark)')
                                .matches)
                    ) {
                        document.documentElement.classList.add('dark')
                    }
                }

                loadDarkMode()

                document.addEventListener('livewire:navigated', loadDarkMode)
            </script>
        @endif

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::HEAD_END, scopes: $renderHookScopes) }}
    </head>

    <body
        {{
            $attributes
                ->merge($livewire?->getExtraBodyAttributes() ?? [], escape: false)
                ->class([
                    'fi-body',
                    'fi-panel-' . filament()->getId(),
                ])
        }}
    >
        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::BODY_START, scopes: $renderHookScopes) }}

        {{ $slot }}

        @livewire(Filament\Livewire\Notifications::class)

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::SCRIPTS_BEFORE, scopes: $renderHookScopes) }}

        @filamentScripts(withCore: true)

        @if (filament()->hasBroadcasting() && config('filament.broadcasting.echo'))
            <script data-navigate-once>
                window.Echo = new window.EchoFactory(@js(config('filament.broadcasting.echo')))

                window.dispatchEvent(new CustomEvent('EchoLoaded'))
            </script>
        @endif

        @if (filament()->hasDarkMode() && (! filament()->hasDarkModeForced()))
            <script>
                loadDarkMode()
            </script>
        @endif

        @stack('scripts')

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::SCRIPTS_AFTER, scopes: $renderHookScopes) }}

        {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::BODY_END, scopes: $renderHookScopes) }}
    </body>
</html>



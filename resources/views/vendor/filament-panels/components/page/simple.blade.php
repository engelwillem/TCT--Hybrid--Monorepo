@props([
    'heading' => null,
    'subheading' => null,
])

@php
    $heading ??= $this->getHeading();
    $subheading ??= $this->getSubHeading();

    // Filament pages sometimes return objects (e.g., Action) for subheading.
    // Our premium template must handle those safely.
    if (is_object($heading) && method_exists($heading, 'toHtml')) {
        $heading = $heading->toHtml();
    }

    if (is_object($subheading) && method_exists($subheading, 'toHtml')) {
        $subheading = $subheading->toHtml();
    }
@endphp

<div {{ $attributes->class(['fi-simple-page']) }}>
    {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::SIMPLE_PAGE_START, scopes: $this->getRenderHookScopes()) }}

    <style>
        .tct-auth-card {
            width: 100%;
            max-width: 440px;
            border-radius: 24px;
            border: 1px solid rgba(15,23,42,0.08);
            background: rgba(255,255,255,0.88);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.12), 0 24px 56px rgba(14, 165, 233, 0.14);
        }

        .tct-auth-card-body {
            padding: 24px;
        }

        @media (min-width: 640px) {
            .tct-auth-card-body { padding: 32px; }
        }

        .tct-auth-page-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.02em;
        }

        .tct-auth-page-subtitle {
            margin-top: 6px;
            margin-bottom: 0;
            font-size: 0.875rem;
            color: rgba(15,23,42,0.62);
        }

        .tct-auth-slot {
            margin-top: 20px;
        }
    </style>

    <div class="fi-simple-page-content">
        <div class="tct-auth-card">
            <div class="tct-auth-card-body">
                @if (filled($heading))
                    <h2 class="tct-auth-page-title">{!! $heading !!}</h2>
                @endif

                @if (filled($subheading))
                    <p class="tct-auth-page-subtitle">{!! $subheading !!}</p>
                @endif

                <div class="tct-auth-slot">
                    {{ $slot }}
                </div>
            </div>
        </div>
    </div>

    @if (! $this instanceof \Filament\Tables\Contracts\HasTable)
        <x-filament-actions::modals />
    @endif

    {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::SIMPLE_PAGE_END, scopes: $this->getRenderHookScopes()) }}
</div>


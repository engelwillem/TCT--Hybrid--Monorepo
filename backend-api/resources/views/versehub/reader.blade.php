<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="csrf-token" content="{{ csrf_token() }}" />

        <meta name="app-name" content="{{ config('app.name', 'TheChosenTalks') }}" />
        <link rel="icon" type="image/svg+xml" href="{{ \App\Support\AppSettings::get('site.favicon_url', '/favicon.svg') }}">
        <link rel="shortcut icon" href="{{ \App\Support\AppSettings::get('site.favicon_url', '/favicon.svg') }}">
        <link rel="apple-touch-icon" href="{{ \App\Support\AppSettings::get('site.favicon_url', '/favicon.svg') }}">
        <title>{{ $chapter_label ? $chapter_label.' - VerseHub' : 'VerseHub' }}</title>
        <link rel="canonical" href="{{ $canonical_url }}" />

        <!-- Fonts (match app) -->
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css'])
        <style>
            /* Ensure verse number link does NOT overlay the whole row */
            .vh-verse-link { position: static !important; }

            /* Ensure verse text button stays clickable on top */
            .vh-verse-text-btn { position: relative; z-index: 2; }
            
            :root {
                --background: 40 20% 98%;
                --surface: 0 0% 100%;
                --surface-muted: 40 18% 96.8%;
                --foreground: 0 0% 7%;
                --muted-foreground: 220 9% 46%;
                --surface-dark: 0 0% 7%;
                --brand: {{ e(config('ui.brand_hsl')) }};
                --brand-foreground: {{ e(config('ui.brand_foreground_hsl')) }};
            }

            /* Reader typography (ESV-like vibe, but keep app tokens) */
            .vh-reader {
                font-family: ui-serif, Georgia, 'Times New Roman', serif;
                font-size: 1.02rem;
                line-height: 1.95;
                letter-spacing: -0.005em;
                color: #1f2937;
                max-width: 44rem;
                margin-left: auto;
                margin-right: auto;
            }
            @media (min-width: 768px) {
                .vh-reader {
                    font-size: 1.11rem;
                    line-height: 2;
                }
            }

            .vh-reader sup {
                font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, sans-serif;
                font-size: 0.7em;
                top: -0.4em;
                color: #94a3b8;
            }

            .vh-no-scroll {
                overflow: hidden;
            }

            /* Verse interaction (keep clean by default; only show controls on click) */
            .vh-verse-line[data-vh-selected="1"] {
                background: #f1f5f9;
                box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
            }
            .vh-verse-line[data-vh-highlight="yellow"] {
                background: rgba(250, 204, 21, 0.18); /* tailwind yellow-400-ish */
            }
            .vh-verse-line[data-vh-highlight="green"] {
                background: rgba(34, 197, 94, 0.16);
            }
            .vh-verse-line[data-vh-highlight="blue"] {
                background: rgba(59, 130, 246, 0.14);
            }

            .vh-verse-line[data-vh-bookmarked="1"] .vh-open-actions,
            .vh-verse-line[data-vh-favorite="1"] .vh-open-actions {
                color: hsl(var(--foreground));
            }
            /* Verse text should behave like inline text but clickable for actions */
            .vh-verse-text-btn {
                appearance: none;
                background: transparent;
                border: 0;
                padding: 0;
                margin: 0;
                font: inherit;
                color: inherit;
                cursor: pointer;
                text-align: left;
            }
            .vh-verse-text-btn:focus-visible {
                outline: 2px solid rgba(59, 130, 246, 0.6);
                outline-offset: 4px;
                border-radius: 10px;
            }


            .vh-verse-line[data-vh-bookmarked="1"] .vh-open-actions::after,
            .vh-verse-line[data-vh-favorite="1"] .vh-open-actions::after,
            .vh-verse-line[data-vh-noted="1"] .vh-open-actions::after {
                content: '';
                position: absolute;
                right: -1px;
                top: -1px;
                width: 6px;
                height: 6px;
                border-radius: 9999px;
                background: hsl(var(--brand));
            }

            .vh-verse-line.vh-transient-focus {
                animation: vhFocusFade 1.5s ease-out forwards;
                box-shadow: inset 0 0 0 1px hsl(var(--brand) / 0.25);
            }

            @keyframes vhFocusFade {
                0% {
                    background: hsl(var(--brand) / 0.22);
                    transform: translateY(0);
                }
                45% {
                    background: hsl(var(--brand) / 0.16);
                }
                100% {
                    background: transparent;
                    transform: translateY(0);
                }
            }

            .vh-cta-solid {
                background: #111111;
                color: #ffffff;
            }
            .vh-cta-solid:hover {
                background: #000000;
            }

            .vh-soft-card {
                background: #ffffff;
                box-shadow: 0 3px 10px rgba(17, 17, 17, 0.035);
            }

            .vh-title-strong {
                color: #111111;
                font-weight: 700;
                letter-spacing: -0.01em;
            }

            .vh-reading-dark .vh-soft-card,
            .vh-reading-dark #vh-mobile-reader-card,
            .vh-reading-dark #vh-desktop-reader-card {
                background: #0f172a !important;
                color: #e2e8f0 !important;
            }
            .vh-reading-dark .vh-reader,
            .vh-reading-dark .vh-verse-text-btn,
            .vh-reading-dark .vh-title-strong {
                color: #e2e8f0 !important;
            }
            .vh-reading-dark .vh-verse-line:hover {
                background: rgba(148, 163, 184, 0.1) !important;
            }
            .vh-focus-mode #vh-right-sidebar {
                display: none !important;
            }
            .vh-reader[data-size="sm"] { font-size: 0.98rem; line-height: 1.85; }
            .vh-reader[data-size="md"] { font-size: 1.06rem; line-height: 1.95; }
            .vh-reader[data-size="lg"] { font-size: 1.2rem; line-height: 2.05; }

            @keyframes vhConfettiFall {
                0% {
                    transform: translate3d(0, 0, 0) rotate(0deg);
                    opacity: 0.95;
                }
                100% {
                    transform: translate3d(var(--vh-cx, 0px), var(--vh-cy, 64px), 0) rotate(var(--vh-cr, 120deg));
                    opacity: 0;
                }
            }
        </style>
    </head>

    <body class="min-h-screen bg-[#FAFAF8] text-foreground">
        <!-- MOBILE MINI TOPBAR -->
        @if(!$chapter_label)
        <div class="md:hidden flex items-center justify-between gap-3 px-4 pt-3">
            <a href="/today" class="inline-flex items-center gap-2 rounded-2xl bg-surface-muted px-3 py-2 text-sm font-semibold shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                <span class="inline-flex h-2 w-2 rounded-full bg-brand"></span>
                <span class="tct-brand-gradient">{{ config('ui.app_name') ?? config('ui.appName') ?? config('app.name', 'TheChosenTalks') }}</span>
            </a>
        </div>
        @endif

        <!-- MOBILE TOP BAR -->
        <div id="vh-mobile-header" class="sticky top-0 z-30 mx-auto w-full max-w-6xl px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#FAFAF8]/88 md:hidden">
            <div class="mx-auto w-full max-w-[420px]">
                <header class="flex items-center justify-between">
                    <button
                        type="button"
                        id="vh-back-btn"
                        data-fallback-href="/versehub/id"
                        class="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-soft ring-1 ring-black/5 dark:ring-white/10"
                        aria-label="Back"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>

                    <h1 class="text-lg font-semibold text-slate-900">
                        {{ $chapter_label ?? ($lang === 'id' ? 'Alkitab' : 'Bible') }}
                    </h1>

                    @if($chapter_label)
                        <button
                            type="button"
                            id="vh-pick-topbar"
                            data-vh-open-picker="1"
                            class="tct-pressable inline-flex h-12 min-w-12 items-center justify-center gap-1 rounded-full bg-surface px-4 text-xs font-semibold shadow-soft ring-1 ring-black/5 dark:ring-white/10"
                            aria-label="Silahkan Pilih Kitab dan Pasal"
                        >
                            <span>Kitab/Pasal</span>
                            <span aria-hidden>▾</span>
                        </button>
                    @else
                        <div class="h-12 w-12"></div>
                    @endif
                </header>
            </div>
        </div>

        <!-- MOBILE MAIN -->
        <div class="mx-auto max-w-[420px] px-4 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-8 md:hidden">
            <section id="vh-hero-section">
                <div id="vh-mobile-reader-card" class="vh-soft-card rounded-3xl p-5 ring-1 ring-black/5 dark:ring-white/10">
                    <form method="GET" action="{{ url('/versehub/'.$lang) }}" class="mb-4 space-y-2" data-vh-search-form="mobile">
                        <div class="relative">
                        <div class="flex items-center gap-2">
                            <input
                                id="vh-mobile-search"
                                name="q"
                                type="text"
                                value="{{ $search_query ?? '' }}"
                                placeholder=""
                                data-vh-placeholder="Contoh: mzm 119:105 atau 1ptr-3-1,3"
                                autocomplete="off"
                                data-vh-ref-search="1"
                                data-vh-ref-list="vh-mobile-suggest-list"
                                class="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none ring-0 placeholder:text-muted-foreground/80 focus:border-brand/40"
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                class="tct-pressable inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted ring-1 ring-black/5 dark:ring-white/10"
                            >
                                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
                                    <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div
                            id="vh-mobile-suggest-list"
                            class="absolute left-0 right-0 z-30 mt-2 hidden overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-soft"
                        ></div>
                        </div>
                    </form>
                    @if(!empty($search_error))
                        <p class="mb-3 text-xs font-medium text-rose-500">{{ $search_error }}</p>
                    @elseif(!empty($search_meta['verses']))
                        <p class="mb-3 text-xs text-muted-foreground">
                            Menampilkan ayat: {{ implode(', ', $search_meta['verses']) }}
                        </p>
                    @endif
                    @if(!empty($search_recommendations))
                        <div class="mb-3 flex flex-wrap gap-2">
                            @foreach($search_recommendations as $rec)
                                <a
                                    href="{{ $rec['href'] ?? '#' }}"
                                    class="inline-flex items-center rounded-full bg-surface-muted px-3 py-1.5 text-[11px] font-semibold ring-1 ring-black/5 dark:ring-white/10"
                                >
                                    {{ $rec['label'] ?? 'Buka rekomendasi' }}
                                </a>
                            @endforeach
                        </div>
                    @endif
                    @if(auth()->check() && !$chapter_label)
                        <div id="vh-journey-mobile" class="mb-4 rounded-3xl bg-surface p-3.5 shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                            <p id="vh-personal-context-mobile" class="text-center text-[12px] text-muted-foreground">
                                Halo {{ \Illuminate\Support\Str::before((string) (auth()->user()->name ?? 'Sahabat'), ' ') }} 👋
                            </p>
                            <p class="text-center text-[13px] font-semibold tracking-[0.01em] text-foreground">My Spiritual Journey</p>
                            <p class="mt-1 text-center text-[12px] text-muted-foreground">Saved verse, notes, all in one place.</p>
                            <div id="vh-journey-stats-mobile" class="mt-3 hidden w-full items-center justify-center gap-2 text-center text-[11px] font-medium text-muted-foreground sm:flex-nowrap">
                                <span class="rounded-full bg-surface-muted px-2.5 py-1 ring-1 ring-black/5 dark:ring-white/10">Bookmark (<span id="vh-journey-bookmarks-mobile">0</span>)</span>
                                <span class="rounded-full bg-surface-muted px-2.5 py-1 ring-1 ring-black/5 dark:ring-white/10">Notes (<span id="vh-journey-notes-mobile">0</span>)</span>
                                <span class="rounded-full bg-surface-muted px-2.5 py-1 ring-1 ring-black/5 dark:ring-white/10">Favorites (<span id="vh-journey-favorites-mobile">0</span>)</span>
                            </div>
                            <p id="vh-journey-empty-mobile" class="mt-3 text-center text-[12px] leading-relaxed text-muted-foreground">
                                Your Spiritual Progress haven't tracked yet.<br />
                                Bookmark, add notes, or favorite a verse to see them here.
                            </p>
                            <a
                                id="vh-journey-track-mobile"
                                href="/versehub/id/my-spiritual-journey"
                                class="mt-3 block rounded-2xl bg-[#111111] px-3 py-2 text-center text-[12px] font-semibold text-white hover:bg-black"
                            >
                                Lihat Perjalanan Rohani &rarr;
                            </a>
                            <a
                                id="vh-journey-start-mobile"
                                href="/versehub/id"
                                class="mt-2 block text-center text-[12px] font-semibold text-foreground hover:underline"
                            >
                                Start Exploring &rarr;
                            </a>
                        </div>
                    @endif
                    @if(!$chapter_label)
                        <div class="space-y-4">
                            <p class="text-center text-[15px] leading-[1.75] text-muted-foreground">
                                Pilih <span class="font-semibold text-foreground">kitab</span> dan <span class="font-semibold text-foreground">pasal</span>
                            </p>
                            <a
                                id="vh-primary-cta-mobile"
                                href="/today"
                                class="vh-cta-solid tct-pressable inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                            >
                                Baca Daily Verse Hari Ini
                            </a>
                            <button
                                type="button"
                                id="vh-pick-cta"
                                data-vh-open-picker="1"
                                class="tct-pressable inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-muted px-4 py-3 text-sm font-semibold ring-1 ring-black/5"
                            >
                                Pilih Kitab Manual
                                <span aria-hidden>▾</span>
                            </button>
                        </div>
                    @else
                        <h1 class="vh-title-strong text-lg">{{ $chapter_label }}</h1>
                        <div class="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>Progress:</span>
                            <div class="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                <div id="vh-read-progress-mobile" class="h-full w-0 rounded-full bg-slate-600 transition-all duration-200"></div>
                            </div>
                            <span id="vh-read-progress-label-mobile">Ayat 1 dari {{ count($verses ?? []) }}</span>
                        </div>
                        <p class="mt-2 text-xs text-muted-foreground">
                            Ketuk ayat untuk membuka alat baca.
                        </p>
                        <div class="mt-5 vh-reader">
                            @foreach($verses as $v)
                                <p
                                    class="vh-verse-line mt-3 flex items-start gap-2 rounded-xl px-2 py-1 transition hover:bg-muted/50"
                                    id="vh-v-{{ $v['verse'] }}"
                                    data-vh-verse-key="{{ $v['key'] ?? ($selected_book ?? 'BOOK').'-'.($selected_chapter ?? 0).'-'.$v['verse'] }}"
                                    data-vh-verse-label="{{ $chapter_label }}:{{ $v['verse'] }}"
                                    data-vh-verse-number="{{ $v['verse'] }}"
                                    data-vh-verse-text="{{ e($v['text']) }}"
                                    data-vh-href="{{ $v['href'] }}"
                                >
                                    {{-- NOMOR AYAT = LINK (OG/Share) --}}
                                <a
                                    href="{{ $v['href'] }}"
                                    class="vh-verse-link shrink-0 no-underline hover:underline"
                                    title="Open verse (share)"
                                >
                                    <sup class="text-muted-foreground">{{ $v['verse'] }}</sup>
                                </a>

                                {{-- TEKS AYAT = BUKA PICKER --}}
                                <button
                                    type="button"
                                    class="vh-verse-text-btn vh-verse-text text-left align-baseline min-w-0 flex-1"
                                >
                                    {!! e($v['text']) !!}
                                </button>

                                <div class="vh-inline-note mt-2 hidden rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-[12px] leading-relaxed text-foreground/90"></div>
                                </p>
                            @endforeach
                        </div>
                    @endif
                </div>
            </section>
        </div>

        <!-- DESKTOP TOP BAR -->
        <div class="hidden md:block">
            <div class="mx-auto max-w-7xl px-4 pt-5">
                <header class="sticky top-3 z-20 flex items-center justify-between rounded-3xl bg-[#FAFAF8]/92 px-5 py-4 ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
                    <div class="flex items-center gap-3">
                        <button
                            type="button"
                            id="vh-back-btn-desktop"
                            data-fallback-href="/versehub/id"
                            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-black/5"
                            aria-label="Back"
                        >
                            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <p class="text-base font-semibold text-slate-900">{{ $chapter_label ?? 'Alkitab' }}</p>
                    </div>
                    <div>
                        <button
                            type="button"
                            data-vh-open-picker="1"
                            class="tct-pressable inline-flex items-center gap-2 rounded-2xl bg-surface-muted px-3 py-2 text-xs font-semibold ring-1 ring-black/5 hover:bg-surface dark:ring-white/10"
                        >
                            Kitab/Pasal
                            <span aria-hidden>▾</span>
                        </button>
                    </div>
                </header>
            </div>
        </div>

        <!-- DESKTOP MAIN (2-column reader layout) -->
        <div class="mx-auto hidden max-w-7xl px-4 pb-6 pt-5 md:block">
            <div class="grid grid-cols-12 gap-6">
                <section class="{{ $chapter_label ? 'col-span-12 mx-auto w-full max-w-3xl' : 'col-span-8' }}">
                    <div id="vh-desktop-reader-card" class="vh-soft-card flex max-h-[calc(100vh-160px)] flex-col overflow-hidden rounded-3xl ring-1 ring-black/5 dark:ring-white/10">
                        <div class="border-b border-border/60 px-5 py-4">
                            <div class="flex items-center justify-between gap-3">
                                @if($chapter_label)
                                    <h2 class="text-lg font-semibold text-foreground">
                                        {{ $chapter_label }}
                                    </h2>
                                @endif
                                @if($chapter_label)
                                    <button
                                        type="button"
                                        data-vh-open-picker="1"
                                        class="tct-pressable inline-flex items-center gap-2 rounded-2xl bg-surface-muted px-3 py-2 text-xs font-semibold ring-1 ring-black/5 hover:bg-surface dark:ring-white/10"
                                    >
                                        Kitab/Pasal
                                        <span aria-hidden>▾</span>
                                    </button>
                                @endif
                            </div>
                            <form method="GET" action="{{ url('/versehub/'.$lang) }}" class="mt-3 space-y-2" data-vh-search-form="desktop">
                                <div class="relative">
                                <div class="flex items-center gap-2">
                                    <input
                                        id="vh-desktop-search"
                                        name="q"
                                        type="text"
                                        value="{{ $search_query ?? '' }}"
                                        placeholder=""
                                        data-vh-placeholder="Contoh: yoh 3:16-18 atau flm-1-15"
                                        autocomplete="off"
                                        data-vh-ref-search="1"
                                        data-vh-ref-list="vh-desktop-suggest-list"
                                        class="h-10 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none ring-0 placeholder:text-muted-foreground/80 focus:border-brand/40"
                                    />
                                    <button
                                        type="submit"
                                        aria-label="Search"
                                        class="tct-pressable inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted ring-1 ring-black/5 dark:ring-white/10"
                                    >
                                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
                                            <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                        </svg>
                                    </button>
                                </div>
                                <div
                                    id="vh-desktop-suggest-list"
                                    class="absolute left-0 right-0 z-30 mt-2 hidden overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-soft"
                                ></div>
                                </div>
                            </form>
                            @if(!empty($search_error))
                                <p class="mt-2 text-xs font-medium text-rose-500">{{ $search_error }}</p>
                            @elseif(!empty($search_meta['verses']))
                                <p class="mt-2 text-xs text-muted-foreground">
                                    Menampilkan ayat: {{ implode(', ', $search_meta['verses']) }}
                                </p>
                            @endif
                            @if(!empty($search_recommendations))
                                <div class="mt-2 flex flex-wrap gap-2">
                                    @foreach($search_recommendations as $rec)
                                        <a
                                            href="{{ $rec['href'] ?? '#' }}"
                                            class="inline-flex items-center rounded-full bg-surface-muted px-3 py-1.5 text-[11px] font-semibold ring-1 ring-black/5 dark:ring-white/10"
                                        >
                                            {{ $rec['label'] ?? 'Buka rekomendasi' }}
                                        </a>
                                    @endforeach
                                </div>
                            @endif
                        </div>

                        <div class="min-h-0 flex-1 overflow-auto px-5 py-4">
                            @if(!empty($cross_panels))
                                <p class="text-xs text-muted-foreground">
                                    Mode lintas pasal aktif (web). Menampilkan 2 panel bacaan otomatis.
                                </p>
                                <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                                    @foreach($cross_panels as $panel)
                                        <section class="rounded-2xl bg-surface-muted/60 p-3 ring-1 ring-black/5 dark:ring-white/10">
                                            <div class="mb-2 flex items-center justify-between gap-2">
                                                <h3 class="text-sm font-semibold">{{ $panel['title'] ?? 'Panel' }}</h3>
                                                @if(!empty($panel['range_text']))
                                                    <span class="rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-muted-foreground">{{ $panel['range_text'] }}</span>
                                                @endif
                                            </div>
                                            <div class="vh-reader max-h-[calc(100vh-290px)] overflow-auto pr-1">
                                                @foreach(($panel['verses'] ?? []) as $v)
                                                    <p
                                                        class="vh-verse-line mt-3 flex items-start gap-2 rounded-xl px-2 py-1 transition hover:bg-muted/50"
                                                        id="vh-v-{{ $v['verse'] }}"
                                                        data-vh-verse-key="{{ $v['key'] ?? ($selected_book ?? 'BOOK').'-'.($selected_chapter ?? 0).'-'.$v['verse'] }}"
                                                        data-vh-verse-label="{{ $panel['title'] ?? 'Ayat' }}:{{ $v['verse'] }}"
                                                        data-vh-verse-number="{{ $v['verse'] }}"
                                                        data-vh-verse-text="{{ e($v['text']) }}"
                                                        data-vh-href="{{ $v['href'] }}"
                                                    >
                                                    <span class="min-w-0 flex-1">
                                                    <a href="{{ $v['href'] }}" class="vh-verse-link shrink-0 no-underline hover:underline" title="Open verse (share)">
                                                    <sup class="text-muted-foreground">{{ $v['verse'] }}</sup>
                                                    </a>

                                                    <button type="button" class="vh-verse-text-btn vh-verse-text text-left align-baseline min-w-0 flex-1">
                                                    {!! e($v['text']) !!}
                                                    </button>

                                                    <div class="vh-inline-note ..."></div>
                                                    </span>
                                                    </p>
                                                @endforeach
                                            </div>
                                        </section>
                                    @endforeach
                                </div>
                            @elseif(!$chapter_label)
                                <div class="space-y-4">
                                    <p class="text-center text-sm text-muted-foreground">
                                        Pilih <span class="font-semibold text-foreground">kitab</span> dan <span class="font-semibold text-foreground">pasal</span>
                                    </p>
                                    <div class="flex justify-center">
                                        <a
                                            id="vh-primary-cta-desktop"
                                            href="/today"
                                            class="vh-cta-solid tct-pressable inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                                        >
                                            Baca Daily Verse Hari Ini
                                        </a>
                                    </div>
                                    <div class="flex justify-center">
                                        <button
                                            type="button"
                                            data-vh-open-picker="1"
                                            class="tct-pressable inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-muted px-5 py-3 text-sm font-semibold ring-1 ring-black/5"
                                        >
                                            Pilih Kitab Manual
                                            <span aria-hidden>▾</span>
                                        </button>
                                    </div>
                                </div>
                            @else
                                <div class="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <span>Progress:</span>
                                    <div class="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                        <div id="vh-read-progress-desktop" class="h-full w-0 rounded-full bg-slate-600 transition-all duration-200"></div>
                                    </div>
                                    <span id="vh-read-progress-label-desktop">Ayat 1 dari {{ count($verses ?? []) }}</span>
                                </div>
                                <p class="text-xs text-muted-foreground">
                                    Klik ayat untuk membuka alat baca.
                                </p>
                                <div class="mt-5 vh-reader">
                                    @foreach($verses as $v)
                                        <p
                                            class="vh-verse-line mt-3 flex items-start gap-2 rounded-xl px-2 py-1 transition hover:bg-muted/50"
                                            id="vh-v-{{ $v['verse'] }}"
                                            data-vh-verse-key="{{ $v['key'] ?? ($selected_book ?? 'BOOK').'-'.($selected_chapter ?? 0).'-'.$v['verse'] }}"
                                            data-vh-verse-label="{{ $chapter_label }}:{{ $v['verse'] }}"
                                            data-vh-verse-number="{{ $v['verse'] }}"
                                            data-vh-verse-text="{{ e($v['text']) }}"
                                            data-vh-href="{{ $v['href'] }}"
                                        >
                                            <span class="min-w-0 flex-1">
                                                <a
                                                    href="{{ $v['href'] }}"
                                                    class="vh-verse-link no-underline hover:underline"
                                                    title="Open verse (share)"
                                                >
                                                    <sup class="text-muted-foreground">{{ $v['verse'] }}</sup>
                                                </a>
                                                <button type="button" class="vh-verse-text-btn vh-verse-text text-left align-baseline">{!! e($v['text']) !!}</button>
                                                <div class="vh-inline-note mt-2 hidden rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-[12px] leading-relaxed text-foreground/90"></div>
                                            </span>
</p>
                                    @endforeach
                                </div>
                            @endif
                        </div>
                    </div>
                </section>

                <aside id="vh-right-sidebar" class="col-span-4 {{ $chapter_label ? 'hidden' : '' }}">
                    <div class="flex {{ $chapter_label ? 'max-h-[calc(100vh-160px)] flex-col gap-4 overflow-auto pr-1 pb-2' : 'flex-col gap-4' }}">
                        @php
                            $vhIsAuthed = auth()->check();
                            $vhUserName = $vhIsAuthed ? (auth()->user()->name ?? 'User') : 'Guest';
                            $vhUserEmail = $vhIsAuthed ? (auth()->user()->email ?? '') : '';
                            $vhFirstChar = function_exists('mb_substr') ? mb_substr($vhUserName, 0, 1) : substr($vhUserName, 0, 1);
                            $vhInitials = strtoupper($vhFirstChar ?: 'U');

                            $vhActive = 'bible';
                        @endphp

                        <!-- DesktopSidebarNav (match /today sidebar) -->
                        <div class="vh-soft-card rounded-3xl p-6">
                            <div>
                                <p class="text-base font-bold tracking-tight text-foreground">
                                    Choose n Talks
                                </p>
                            </div>

                            <nav class="mt-2 space-y-1">
                                <a
                                    href="/today"
                                    class="group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 {{ $vhActive === 'home' ? 'bg-surface/70 text-foreground ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground' }}"
                                >
                                    <svg class="h-5 w-5 shrink-0 {{ $vhActive === 'home' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground' }}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <span class="flex-1">Home</span>
                                </a>

                                <a
                                    href="/channels"
                                    class="group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 {{ $vhActive === 'channels' ? 'bg-surface/70 text-foreground ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground' }}"
                                >
                                    <svg class="h-5 w-5 shrink-0 {{ $vhActive === 'channels' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground' }}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3v18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M3 12h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    <span class="flex-1">Channels</span>
                                </a>

                                <a
                                    href="/community"
                                    class="group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 {{ $vhActive === 'library' ? 'bg-surface/70 text-foreground ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground' }}"
                                >
                                    <svg class="h-5 w-5 shrink-0 {{ $vhActive === 'library' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground' }}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M16 3.128a4 4 0 0 1 0 7.744" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    <span class="flex-1">Community</span>
                                </a>

                                <a
                                    href="/versehub/id"
                                    class="group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 {{ $vhActive === 'bible' ? 'bg-surface/70 text-foreground ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground' }}"
                                >
                                    <svg class="h-5 w-5 shrink-0 {{ $vhActive === 'bible' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground' }}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 7v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M16 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M16 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M6 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M6 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <span class="flex-1">Bible</span>
                                </a>

                                <a
                                    href="{{ ($vhIsAuthed ? '/profile' : '/') }}"
                                    class="group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 {{ $vhActive === 'settings' ? 'bg-surface/70 text-foreground ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground' }}"
                                >
                                    <svg class="h-5 w-5 shrink-0 {{ $vhActive === 'settings' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground' }}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    <span class="flex-1">Settings</span>
                                </a>
                            </nav>

                            <div class="mt-6 flex items-center gap-3 rounded-2xl bg-surface-muted p-3">
                                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold">
                                    {{ $vhInitials }}
                                </div>
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-semibold">
                                        {{ $vhUserName }}
                                    </p>
                                    @if($vhUserEmail)
                                        <p class="truncate text-xs text-muted-foreground">
                                            {{ $vhUserEmail }}
                                        </p>
                                    @endif
                                </div>
                            </div>
                        </div>

                        @if(auth()->check() && !$chapter_label)
                            <div id="vh-journey-desktop" class="vh-soft-card rounded-3xl p-5 ring-1 ring-black/5 dark:ring-white/10">
                                <p id="vh-personal-context-desktop" class="text-center text-[12px] text-muted-foreground">
                                    Halo {{ \Illuminate\Support\Str::before((string) (auth()->user()->name ?? 'Sahabat'), ' ') }} 👋
                                </p>
                                <p class="text-center text-[14px] font-semibold tracking-[0.01em] text-foreground">My Spiritual Journey</p>
                                <p class="mt-1 text-center text-[12px] text-muted-foreground">Saved verse, notes, all in one place.</p>
                                <div id="vh-journey-stats-desktop" class="mt-3 hidden w-full items-center justify-center gap-2 text-center text-[11px] font-medium text-muted-foreground">
                                    <span class="rounded-full bg-surface-muted px-2.5 py-1 ring-1 ring-black/5 dark:ring-white/10">Bookmark (<span id="vh-journey-bookmarks-desktop">0</span>)</span>
                                    <span class="rounded-full bg-surface-muted px-2.5 py-1 ring-1 ring-black/5 dark:ring-white/10">Notes (<span id="vh-journey-notes-desktop">0</span>)</span>
                                    <span class="rounded-full bg-surface-muted px-2.5 py-1 ring-1 ring-black/5 dark:ring-white/10">Favorites (<span id="vh-journey-favorites-desktop">0</span>)</span>
                                </div>
                                <p id="vh-journey-empty-desktop" class="mt-3 text-center text-[12px] leading-relaxed text-muted-foreground">
                                    Your Spiritual Progress haven't tracked yet.<br />
                                    Bookmark, add notes, or favorite a verse to see them here.
                                </p>
                                <a
                                    id="vh-journey-track-desktop"
                                    href="/versehub/id/my-spiritual-journey"
                                    class="mt-3 block rounded-2xl bg-[#111111] px-3 py-2 text-center text-[12px] font-semibold text-white hover:bg-black"
                                >
                                    Lihat Perjalanan Rohani &rarr;
                                </a>
                                <a
                                    id="vh-journey-start-desktop"
                                    href="/versehub/id"
                                    class="mt-2 block text-center text-[12px] font-semibold text-foreground hover:underline"
                                >
                                    Start Exploring &rarr;
                                </a>
                            </div>
                        @endif

                        @if(!empty($home_verse))
                            <a
                                href="{{ $home_verse['href'] }}"
                                class="vh-soft-card group block rounded-3xl p-5 ring-1 ring-black/5 transition hover:bg-surface-muted dark:ring-white/10"
                            >
                                <p class="tct-kicker">VerseHub</p>
                                <div class="mt-4">
                                    @include('versehub.partials.verse-quote', ['text' => $home_verse['text']])
                                </div>
                                <div class="mt-4 text-[13px] font-medium tracking-wider text-muted-foreground group-hover:text-foreground">
                                    {{ $home_verse['reference'] }}
                                </div>
                            </a>
                        @endif
                    </div>
                </aside>
            </div>
        </div>

        @if($chapter_label)
        <!-- MOBILE FLOATING QUICK ACTIONS (reading mode only) -->
        <div class="fixed right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 md:hidden">
            <div class="flex items-center gap-1.5 rounded-2xl bg-surface/95 p-1.5 backdrop-blur shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                @if($prev_url)
                    <a
                        href="{{ $prev_url }}"
                        aria-label="Previous chapter"
                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground ring-1 ring-black/5 transition hover:bg-surface dark:ring-white/10"
                    >
                        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                @else
                    <button
                        type="button"
                        disabled
                        aria-label="Previous chapter disabled"
                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground opacity-50 ring-1 ring-black/5 dark:ring-white/10"
                    >
                        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                @endif

                <a
                    href="#vh-mobile-header"
                    aria-label="Kembali ke header"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground ring-1 ring-black/5 transition hover:bg-surface dark:ring-white/10"
                >
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 18V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M8.5 10.5L12 7l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5 19h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </a>

                @if($next_url)
                    <a
                        href="{{ $next_url }}"
                        aria-label="Next chapter"
                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground ring-1 ring-black/5 transition hover:bg-surface dark:ring-white/10"
                    >
                        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                @else
                    <button
                        type="button"
                        disabled
                        aria-label="Next chapter disabled"
                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground opacity-50 ring-1 ring-black/5 dark:ring-white/10"
                    >
                        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                @endif
            </div>
        </div>
        @endif

        <!-- VERSE ACTION MENU (ESV-style, but clean + calm) -->
        <div id="vh-verse-menu" class="fixed inset-0 z-[60] hidden" role="dialog" aria-modal="true">
            <button id="vh-verse-menu-backdrop" type="button" class="absolute inset-0 bg-black/20"></button>

            <!-- Desktop right drawer -->
            <div
                id="vh-verse-menu-card"
                class="fixed right-0 top-0 hidden h-full w-[min(92vw,360px)] bg-surface p-4 shadow-card ring-1 ring-black/5 dark:ring-white/10 sm:block"
            >
                <div class="mb-4 flex items-start justify-between gap-2">
                    <div>
                        <div class="text-sm font-semibold" id="vh-verse-menu-title">Ayat</div>
                        <p id="vh-verse-menu-preview" class="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground"></p>
                    </div>
                    <button id="vh-verse-menu-close-desktop" type="button" class="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted">Close</button>
                </div>
                <div class="space-y-1 text-sm">
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="favorite">Simpan</button>
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="highlight">Sorot</button>
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="note">Tambah Catatan</button>
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="bookmark">Bookmark</button>
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="copy">Salin</button>
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="share">Bagikan</button>
                    <button class="vh-action w-full rounded-xl px-3 py-2 text-left hover:bg-surface-muted" data-action="cross">Cross Reference</button>

                    <div class="my-1 h-px bg-border/60"></div>
                    <div class="px-3 py-2 text-xs font-semibold text-muted-foreground">Warna sorotan</div>
                    <div class="grid grid-cols-3 gap-2 px-3 pb-2">
                        <button class="vh-color h-8 rounded-xl ring-1 ring-black/5 dark:ring-white/10" data-color="yellow" style="background: rgba(250, 204, 21, 0.28)"></button>
                        <button class="vh-color h-8 rounded-xl ring-1 ring-black/5 dark:ring-white/10" data-color="green" style="background: rgba(34, 197, 94, 0.22)"></button>
                        <button class="vh-color h-8 rounded-xl ring-1 ring-black/5 dark:ring-white/10" data-color="blue" style="background: rgba(59, 130, 246, 0.20)"></button>
                    </div>
                </div>
            </div>

            <!-- Mobile bottom sheet -->
            <div class="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface shadow-card sm:hidden">
                <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div class="h-1.5 w-10 rounded-full bg-border/70" aria-hidden></div>
                    <p class="text-[13px] font-semibold" id="vh-verse-menu-title-mobile">Ayat</p>
                    <button id="vh-verse-menu-close" type="button" class="text-[13px] font-semibold text-muted-foreground">Close</button>
                </div>
                <div class="px-3 py-2">
                    <p id="vh-verse-menu-preview-mobile" class="mb-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-surface-muted px-3 py-2 text-xs text-muted-foreground"></p>
                    <div class="grid grid-cols-2 gap-2">
                        <button class="vh-action rounded-2xl bg-surface-muted px-3 py-3 text-left text-sm font-semibold" data-action="highlight">Highlight</button>
                        <button class="vh-action rounded-2xl bg-surface-muted px-3 py-3 text-left text-sm font-semibold" data-action="bookmark">Bookmark</button>
                        <button class="vh-action rounded-2xl bg-surface-muted px-3 py-3 text-left text-sm font-semibold" data-action="note">Note</button>
                        <button class="vh-action rounded-2xl bg-surface-muted px-3 py-3 text-left text-sm font-semibold" data-action="copy">Copy</button>
                        <button class="vh-action rounded-2xl bg-surface-muted px-3 py-3 text-left text-sm font-semibold" data-action="cross">Cross Ref</button>
                        <button class="vh-action rounded-2xl bg-surface-muted px-3 py-3 text-left text-sm font-semibold" data-action="share">Share</button>
                    </div>
                    <div class="mt-3 rounded-2xl bg-surface-muted p-3">
                        <p class="text-xs font-semibold text-muted-foreground">Highlight color</p>
                        <div class="mt-2 grid grid-cols-3 gap-2">
                            <button class="vh-color h-10 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" data-color="yellow" style="background: rgba(250, 204, 21, 0.28)"></button>
                            <button class="vh-color h-10 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" data-color="green" style="background: rgba(34, 197, 94, 0.22)"></button>
                            <button class="vh-color h-10 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" data-color="blue" style="background: rgba(59, 130, 246, 0.20)"></button>
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="vh-action w-full rounded-2xl bg-surface-muted px-4 py-3 text-left text-sm font-semibold" data-action="favorite">Favorites</button>
                    </div>
                    <div style="height: calc(16px + env(safe-area-inset-bottom));"></div>
                </div>
            </div>
        </div>

        <!-- MOBILE BOTTOM NAV (aligned with main app) -->
        <div
            class="fixed inset-x-0 z-40 flex justify-center md:hidden"
            style="bottom: calc(24px + env(safe-area-inset-bottom));"
        >
            <nav class="mx-auto flex w-full max-w-[360px] items-center justify-between gap-1 rounded-3xl bg-white px-3 py-2 shadow-soft ring-1 ring-black/5">
                <a
                    href="/today"
                    aria-label="Home"
                    class="relative inline-flex w-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <span class="pointer-events-none absolute top-0 h-0.5 w-5 rounded-full bg-transparent"></span>
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Home</span>
                </a>
                <a
                    href="/channels"
                    aria-label="Channels"
                    class="relative inline-flex w-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <span class="pointer-events-none absolute top-0 h-0.5 w-5 rounded-full bg-transparent"></span>
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3v18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M3 12h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                    <span>Channels</span>
                </a>
                <a
                    href="/community"
                    aria-label="Community"
                    class="relative inline-flex w-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <span class="pointer-events-none absolute top-0 h-0.5 w-5 rounded-full bg-transparent"></span>
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M16 3.128a4 4 0 0 1 0 7.744" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                    <span>Community</span>
                </a>
                <a
                    href="/versehub/id"
                    aria-label="Bible"
                    class="relative inline-flex w-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-semibold text-[#111111] transition"
                    aria-current="page"
                >
                    <span class="pointer-events-none absolute top-0 h-0.5 w-5 rounded-full bg-[#111111]"></span>
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M16 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M16 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M6 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M6 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Bible</span>
                </a>
                <a
                    href="{{ auth()->check() ? '/profile' : '/' }}"
                    aria-label="Settings"
                    class="relative inline-flex w-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <span class="pointer-events-none absolute top-0 h-0.5 w-5 rounded-full bg-transparent"></span>
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                    <span>Settings</span>
                </a>
            </nav>
        </div>

        <!-- PICKER MODAL (OT/NT tabs -> books -> chapters) -->
        <div id="vh-picker" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true">
            <button id="vh-picker-backdrop" type="button" class="absolute inset-0 bg-black/40"></button>

            <div class="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-surface shadow-card [-webkit-overflow-scrolling:touch]">
                <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div class="h-1.5 w-10 rounded-full bg-border/70" aria-hidden></div>
                    <p class="text-[13px] font-semibold">Pilih Kitab</p>
                    <button id="vh-picker-close" type="button" class="text-[13px] font-semibold text-muted-foreground">Close</button>
                </div>

                <div class="px-4 py-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
                    <div class="grid grid-cols-2 gap-2 rounded-2xl bg-surface-muted p-1">
                        <button id="vh-tab-ot" type="button" class="rounded-2xl px-3 py-2 text-xs font-semibold">Old Testament</button>
                        <button id="vh-tab-nt" type="button" class="rounded-2xl px-3 py-2 text-xs font-semibold text-muted-foreground">New Testament</button>
                    </div>

                    <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div class="rounded-3xl bg-surface p-3 ring-1 ring-black/5 dark:ring-white/10">
                            <p class="text-xs font-semibold text-muted-foreground">Books</p>
                            <div id="vh-book-list" class="mt-2 max-h-[36vh] overflow-y-auto overscroll-contain touch-pan-y pr-1 [-webkit-overflow-scrolling:touch] md:max-h-[58vh]"></div>
                        </div>
                        <div class="rounded-3xl bg-surface p-3 ring-1 ring-black/5 dark:ring-white/10">
                            <p class="text-xs font-semibold text-muted-foreground">Chapters</p>
                            <div id="vh-chapter-panel" class="mt-2 max-h-none overflow-visible pr-1 md:max-h-[58vh] md:overflow-y-auto md:overscroll-contain md:touch-pan-y md:[-webkit-overflow-scrolling:touch]">
                                <div id="vh-chapter-ranges"></div>
                                <div id="vh-chapter-grid" class="grid grid-cols-6 content-start gap-2 pb-2 sm:grid-cols-8 md:grid-cols-10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="vh-toast" class="fixed inset-x-0 top-4 z-[80] mx-auto hidden w-[min(92vw,360px)] rounded-2xl bg-surface px-4 py-3 text-sm font-medium shadow-soft ring-1 ring-black/5 dark:ring-white/10">
            <div class="flex items-center justify-between gap-3">
                <p id="vh-toast-message" class="text-[13px] font-medium text-foreground"></p>
                <a
                    id="vh-toast-link"
                    href="/versehub/id/my-spiritual-journey"
                    class="hidden shrink-0 text-[12px] font-semibold text-brand hover:underline"
                >
                    View now &rarr;
                </a>
            </div>
        </div>
        <aside id="vh-note-drawer" class="fixed bottom-6 right-6 z-[75] hidden w-[360px] rounded-3xl bg-surface p-4 shadow-card ring-1 ring-black/10 dark:ring-white/15">
            <div class="mb-2 flex items-center justify-between gap-3">
                <p class="text-sm font-semibold">Quick Note</p>
                <button id="vh-note-close" type="button" class="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted">Close</button>
            </div>
            <p id="vh-note-ref" class="text-xs font-medium text-muted-foreground">Ayat</p>
            <textarea
                id="vh-note-input"
                rows="6"
                placeholder="Tulis refleksi singkat untuk ayat ini..."
                class="mt-3 w-full resize-none rounded-2xl bg-surface-muted px-3 py-2 text-[14px] outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand dark:ring-white/10"
            ></textarea>
            <div class="mt-3 flex items-center justify-end gap-2">
                <button id="vh-note-clear" type="button" class="rounded-2xl bg-surface-muted px-3 py-2 text-xs font-semibold text-muted-foreground">Clear</button>
                <button id="vh-note-save" type="button" class="vh-cta-solid rounded-2xl px-4 py-2 text-xs font-semibold">Save Note</button>
            </div>
        </aside>

        <script>
            (function () {
                const books = @json($books);
                const selectedBook = @json($selected_book);
                const chaptersInitial = @json($chapters);
                const verseLang = @json($lang ?? 'id');
                const isAuthed = @json(auth()->check());
                const authedUserId = @json(auth()->id());
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const backBtn = document.getElementById('vh-back-btn');
                const backBtnDesktop = document.getElementById('vh-back-btn-desktop');
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const confettiOnceKey = `vh_confetti_first_save:${String(authedUserId || 'guest')}:${String(verseLang || 'id')}`;
                const requireMember = () => {
                    if (isAuthed) return true;
                    window.location.assign('/');
                    return false;
                };

                const picker = document.getElementById('vh-picker');
                const openButtons = document.querySelectorAll('[data-vh-open-picker="1"]');

                if (backBtn) {
                    backBtn.addEventListener('click', () => {
                        const fallback = backBtn.getAttribute('data-fallback-href') || '/versehub/id';
                        if (window.history.length > 1) {
                            window.history.back();
                            return;
                        }
                        window.location.assign(fallback);
                    });
                }
                if (backBtnDesktop) {
                    backBtnDesktop.addEventListener('click', () => {
                        const fallback = backBtnDesktop.getAttribute('data-fallback-href') || '/versehub/id';
                        if (window.history.length > 1) {
                            window.history.back();
                            return;
                        }
                        window.location.assign(fallback);
                    });
                }

                // -----------------------------
                // Verse actions (ESV-style menu)
                // -----------------------------
                const ACTION_KEY = 'versehub_actions_v1';

                function readAllActions() {
                    try {
                        const raw = localStorage.getItem(ACTION_KEY);
                        return raw ? JSON.parse(raw) : {};
                    } catch {
                        return {};
                    }
                }

                function writeAllActions(all) {
                    localStorage.setItem(ACTION_KEY, JSON.stringify(all));
                }

                function getState(verseKey) {
                    const all = readAllActions();
                    return all[verseKey] || {
                        bookmarked: false,
                        favorite: false,
                        highlighted: false,
                        highlightColor: 'yellow',
                        note: '',
                    };
                }

                function setState(verseKey, next) {
                    const all = readAllActions();
                    all[verseKey] = next;
                    writeAllActions(all);
                }

                function parseVerseKey(verseKey) {
                    const m = String(verseKey || '').match(/^([a-z0-9]+)-(\d+)-(\d+)$/i);
                    if (!m) return null;
                    return {
                        book: String(m[1]).toLowerCase(),
                        chapter: Number(m[2]),
                        verse: Number(m[3]),
                    };
                }

                async function fetchJsonSafe(url, options = {}) {
                    try {
                        const res = await fetch(url, options);
                        if (!res.ok) return null;
                        const contentType = String(res.headers.get('content-type') || '').toLowerCase();
                        if (!contentType.includes('application/json')) return null;
                        return await res.json();
                    } catch {
                        return null;
                    }
                }
                window.__vhFetchJsonSafe = fetchJsonSafe;

                async function persistStateServer(verseKey, state) {
                    if (!isAuthed) return;
                    const parsed = parseVerseKey(verseKey);
                    if (!parsed || !csrfToken) return;
                    try {
                        await fetch(`/versehub/${encodeURIComponent(String(verseLang))}/reader-actions`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                                Accept: 'application/json',
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                book: parsed.book,
                                chapter: parsed.chapter,
                                verse: parsed.verse,
                                favorite: Boolean(state.favorite),
                                bookmarked: Boolean(state.bookmarked),
                                highlighted: Boolean(state.highlighted),
                                highlightColor: String(state.highlightColor || 'yellow'),
                                note: String(state.note || ''),
                            }),
                        });
                    } catch {
                        // keep local state as fallback
                    }
                }

                function applyStateToLine(line, state) {
                    // highlight background
                    line.removeAttribute('data-vh-highlight');
                    if (state.highlighted) {
                        line.setAttribute('data-vh-highlight', state.highlightColor || 'yellow');
                    }
                    if (state.bookmarked) {
                        line.setAttribute('data-vh-bookmarked', '1');
                    } else {
                        line.removeAttribute('data-vh-bookmarked');
                    }
                    if (state.favorite) {
                        line.setAttribute('data-vh-favorite', '1');
                    } else {
                        line.removeAttribute('data-vh-favorite');
                    }
                    const note = typeof state.note === 'string' ? state.note.trim() : '';
                    if (note !== '') {
                        line.setAttribute('data-vh-noted', '1');
                    } else {
                        line.removeAttribute('data-vh-noted');
                    }

                    const noteBox = line.querySelector('.vh-inline-note');
                    if (noteBox instanceof HTMLElement) {
                        if (note !== '') {
                            noteBox.textContent = note;
                            noteBox.classList.remove('hidden');
                        } else {
                            noteBox.textContent = '';
                            noteBox.classList.add('hidden');
                        }
                    }
                }

                function selectLine(line) {
                    document.querySelectorAll('.vh-verse-line[data-vh-selected="1"]').forEach((el) => {
                        el.removeAttribute('data-vh-selected');
                    });
                    line.setAttribute('data-vh-selected', '1');
                }

                function clearSelection() {
                    document.querySelectorAll('.vh-verse-line[data-vh-selected="1"]').forEach((el) => {
                        el.removeAttribute('data-vh-selected');
                    });
                }

                // Init: apply stored highlights
                document.querySelectorAll('.vh-verse-line').forEach((line) => {
                    const key = line.getAttribute('data-vh-verse-key');
                    if (!key) return;
                    const state = getState(key);
                    applyStateToLine(line, state);
                });

                function focusVerseFromHash() {
                    const raw = String(window.location.hash || '');
                    const m = raw.match(/^#v(\d+)$/i);
                    if (!m) return;
                    const verseNo = Number(m[1]);
                    if (!Number.isFinite(verseNo) || verseNo < 1) return;
                    const line = document.getElementById(`vh-v-${verseNo}`);
                    if (!line) return;
                    line.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    line.classList.remove('vh-transient-focus');
                    // restart animation when hash points to the same verse repeatedly
                    void line.offsetWidth;
                    line.classList.add('vh-transient-focus');
                    window.setTimeout(() => {
                        line.classList.remove('vh-transient-focus');
                    }, 1600);
                }

                async function hydrateFromServer() {
                    if (!isAuthed) return;
                    const combos = new Set();
                    document.querySelectorAll('.vh-verse-line').forEach((line) => {
                        const key = line.getAttribute('data-vh-verse-key');
                        const parsed = parseVerseKey(key || '');
                        if (!parsed) return;
                        combos.add(`${parsed.book}|${parsed.chapter}`);
                    });
                    if (!combos.size) return;

                    await Promise.all(Array.from(combos).map(async (combo) => {
                        const [book, chapterText] = String(combo).split('|');
                        const chapter = Number(chapterText);
                        if (!book || !Number.isFinite(chapter) || chapter < 1) return;
                        try {
                            const json = await fetchJsonSafe(
                                `/versehub/${encodeURIComponent(String(verseLang))}/reader-actions?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(String(chapter))}`,
                                { headers: { Accept: 'application/json' }, credentials: 'same-origin' }
                            );
                            if (!json) return;
                            const actions = json?.actions && typeof json.actions === 'object' ? json.actions : {};

                            Object.entries(actions).forEach(([key, val]) => {
                                if (!val || typeof val !== 'object') return;
                                const next = {
                                    bookmarked: Boolean(val.bookmarked),
                                    favorite: Boolean(val.favorite),
                                    highlighted: Boolean(val.highlighted),
                                    highlightColor: String(val.highlightColor || 'yellow'),
                                    note: String(val.note || ''),
                                };
                                setState(key, next);
                                const line = document.querySelector(`.vh-verse-line[data-vh-verse-key="${key}"]`);
                                if (line) applyStateToLine(line, next);
                            });
                        } catch {
                            // no-op
                        }
                    }));
                }

                hydrateFromServer();
                focusVerseFromHash();
                let latestJourneyTotal = 0;
                let journeySummaryReady = false;

                async function hydrateSavedSummary() {
                    if (!isAuthed) return;
                    const primaryCtaMobile = document.getElementById('vh-primary-cta-mobile');
                    const primaryCtaDesktop = document.getElementById('vh-primary-cta-desktop');
                    const cards = [
                        {
                            context: document.getElementById('vh-personal-context-mobile'),
                            stats: document.getElementById('vh-journey-stats-mobile'),
                            empty: document.getElementById('vh-journey-empty-mobile'),
                            track: document.getElementById('vh-journey-track-mobile'),
                            start: document.getElementById('vh-journey-start-mobile'),
                            favorites: document.getElementById('vh-journey-favorites-mobile'),
                            bookmarks: document.getElementById('vh-journey-bookmarks-mobile'),
                            notes: document.getElementById('vh-journey-notes-mobile'),
                        },
                        {
                            context: document.getElementById('vh-personal-context-desktop'),
                            stats: document.getElementById('vh-journey-stats-desktop'),
                            empty: document.getElementById('vh-journey-empty-desktop'),
                            track: document.getElementById('vh-journey-track-desktop'),
                            start: document.getElementById('vh-journey-start-desktop'),
                            favorites: document.getElementById('vh-journey-favorites-desktop'),
                            bookmarks: document.getElementById('vh-journey-bookmarks-desktop'),
                            notes: document.getElementById('vh-journey-notes-desktop'),
                        },
                    ];
                    if (!cards.some((it) => it.stats || it.empty || it.track || it.start)) return;
                    try {
                        const json = await fetchJsonSafe(`/versehub/${encodeURIComponent(String(verseLang))}/reader-actions/summary?limit=120&sort=recent`, {
                            headers: { Accept: 'application/json' },
                            credentials: 'same-origin',
                        });
                        if (!json) throw new Error('bad response');
                        const counts = json?.counts && typeof json.counts === 'object' ? json.counts : {};
                        const totalFavorites = Number(counts?.favorites || 0);
                        const totalBookmarks = Number(counts?.bookmarks || 0);
                        const totalNotes = Number(counts?.notes || 0);
                        const totalSaved = totalFavorites + totalBookmarks + totalNotes;
                        latestJourneyTotal = totalSaved;
                        journeySummaryReady = true;
                        const allRows = [
                            ...(Array.isArray(json?.favorites) ? json.favorites : []),
                            ...(Array.isArray(json?.bookmarks) ? json.bookmarks : []),
                            ...(Array.isArray(json?.notes) ? json.notes : []),
                        ];
                        const latest = [...allRows].sort((a, b) => Number(b?.updated_at_ts || 0) - Number(a?.updated_at_ts || 0))[0] || null;
                        const lastReadLabel = latest
                            ? `${String(latest.book || '').toUpperCase()} ${Number(latest.chapter || 0)}`
                            : '';
                        const continueHref = latest ? `/versehub/id/${encodeURIComponent(String(latest.book || '').toLowerCase())}-${encodeURIComponent(String(latest.chapter || '1'))}` : '/today';

                        cards.forEach((card) => {
                            if (card.favorites) card.favorites.textContent = String(totalFavorites);
                            if (card.bookmarks) card.bookmarks.textContent = String(totalBookmarks);
                            if (card.notes) card.notes.textContent = String(totalNotes);

                            const hasData = totalSaved > 0;
                            if (card.stats) card.stats.classList.toggle('hidden', !hasData);
                            if (card.empty) card.empty.classList.toggle('hidden', hasData);
                            if (card.start) card.start.classList.toggle('hidden', hasData);
                            if (card.track) card.track.textContent = hasData ? 'Lihat Perjalanan Rohani →' : 'Mulai Menjelajah →';
                            if (card.track) card.track.setAttribute('href', hasData ? '/versehub/id/my-spiritual-journey' : '/versehub/id');
                            if (card.context) {
                                card.context.textContent = hasData && lastReadLabel
                                    ? `Halo {{ \Illuminate\Support\Str::before((string) (auth()->user()->name ?? 'Sahabat'), ' ') }} 👋 Terakhir Anda membaca ${lastReadLabel}.`
                                    : `Halo {{ \Illuminate\Support\Str::before((string) (auth()->user()->name ?? 'Sahabat'), ' ') }} 👋`;
                            }
                        });

                        [primaryCtaMobile, primaryCtaDesktop].forEach((cta) => {
                            if (!cta) return;
                            if (totalSaved > 0 && latest && String(latest.book || '') !== '' && Number(latest.chapter || 0) > 0) {
                                cta.textContent = `Lanjutkan ${lastReadLabel}`;
                                cta.setAttribute('href', continueHref);
                            } else {
                                cta.textContent = 'Baca Daily Verse Hari Ini';
                                cta.setAttribute('href', '/today');
                            }
                        });
                    } catch {
                        journeySummaryReady = true;
                        cards.forEach((card) => {
                            if (card.stats) card.stats.classList.add('hidden');
                            if (card.empty) card.empty.classList.remove('hidden');
                            if (card.start) card.start.classList.remove('hidden');
                            if (card.track) card.track.textContent = 'Mulai Menjelajah →';
                            if (card.track) card.track.setAttribute('href', '/versehub/id');
                            if (card.context) {
                                card.context.textContent = `Halo {{ \Illuminate\Support\Str::before((string) (auth()->user()->name ?? 'Sahabat'), ' ') }} 👋`;
                            }
                        });
                        [primaryCtaMobile, primaryCtaDesktop].forEach((cta) => {
                            if (!cta) return;
                            cta.textContent = 'Baca Daily Verse Hari Ini';
                            cta.setAttribute('href', '/today');
                        });
                    }
                }

                hydrateSavedSummary();

                const chapterLabel = @json($chapter_label);
                const readingModeButtons = Array.from(document.querySelectorAll('.vh-reading-mode'));
                const textSizeInput = document.getElementById('vh-text-size');
                const readerBlocks = Array.from(document.querySelectorAll('.vh-reader'));
                const progressBars = [
                    document.getElementById('vh-read-progress-mobile'),
                    document.getElementById('vh-read-progress-desktop'),
                ].filter(Boolean);
                const progressLabels = [
                    document.getElementById('vh-read-progress-label-mobile'),
                    document.getElementById('vh-read-progress-label-desktop'),
                ].filter(Boolean);
                const readingModeKey = `vh_reading_mode:${String(authedUserId || 'guest')}:${String(verseLang || 'id')}`;
                const textSizeKey = `vh_text_size:${String(authedUserId || 'guest')}:${String(verseLang || 'id')}`;
                const chapterCompletionKey = `vh_chapter_completed:${String(authedUserId || 'guest')}:${String(verseLang || 'id')}:${String(chapterLabel || '')}`;
                const chapterStreakKey = `vh_chapter_streak:${String(authedUserId || 'guest')}:${String(verseLang || 'id')}`;
                let progressTicking = false;
                let completionHandled = false;

                function setReadingMode(mode, shouldPersist = true) {
                    const nextMode = ['normal', 'focus', 'dark'].includes(String(mode || '')) ? String(mode) : 'normal';
                    document.body.classList.toggle('vh-focus-mode', nextMode === 'focus');
                    document.body.classList.toggle('vh-reading-dark', nextMode === 'dark');
                    readingModeButtons.forEach((btn) => {
                        if (!(btn instanceof HTMLElement)) return;
                        const isActive = btn.getAttribute('data-mode') === nextMode;
                        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                        btn.style.background = isActive ? '#111111' : '';
                        btn.style.color = isActive ? '#ffffff' : '';
                    });
                    if (!shouldPersist) return;
                    try {
                        localStorage.setItem(readingModeKey, nextMode);
                    } catch {
                        // no-op
                    }
                }

                function setTextSizeIndex(sizeIndex, shouldPersist = true) {
                    const next = Number.isFinite(Number(sizeIndex)) ? Number(sizeIndex) : 1;
                    const clamped = Math.max(0, Math.min(2, next));
                    const size = clamped === 0 ? 'sm' : (clamped === 2 ? 'lg' : 'md');
                    readerBlocks.forEach((el) => {
                        if (el instanceof HTMLElement) el.setAttribute('data-size', size);
                    });
                    if (textSizeInput) textSizeInput.value = String(clamped);
                    if (!shouldPersist) return;
                    try {
                        localStorage.setItem(textSizeKey, String(clamped));
                    } catch {
                        // no-op
                    }
                }

                function toIsoDay(ts) {
                    const d = ts instanceof Date ? ts : new Date(ts);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                }

                function dayDiff(fromIso, toIso) {
                    const from = new Date(`${fromIso}T00:00:00`);
                    const to = new Date(`${toIso}T00:00:00`);
                    return Math.round((to.getTime() - from.getTime()) / 86400000);
                }

                function markChapterCompletionIfNeeded(totalVerses, currentVerse) {
                    if (!chapterLabel || completionHandled || totalVerses < 1 || currentVerse < totalVerses) return;
                    const today = toIsoDay(new Date());
                    const keyToday = `${chapterCompletionKey}:${today}`;
                    try {
                        if (localStorage.getItem(keyToday) === '1') {
                            completionHandled = true;
                            return;
                        }
                        localStorage.setItem(keyToday, '1');
                    } catch {
                        // no-op
                    }

                    completionHandled = true;
                    showToast(`🎉 Anda menyelesaikan ${String(chapterLabel)} hari ini.`, { duration: 2800 });

                    try {
                        const raw = localStorage.getItem(chapterStreakKey);
                        const current = raw ? JSON.parse(raw) : {};
                        const prevDay = String(current?.last_day || '');
                        const prevCount = Number(current?.count || 0);
                        let nextCount = 1;
                        if (prevDay) {
                            const diff = dayDiff(prevDay, today);
                            if (diff === 0) nextCount = Math.max(1, prevCount);
                            if (diff === 1) nextCount = Math.max(1, prevCount + 1);
                        }
                        const nextState = { last_day: today, count: nextCount };
                        localStorage.setItem(chapterStreakKey, JSON.stringify(nextState));
                        if (nextCount === 3) {
                            window.setTimeout(() => {
                                showToast('🔥 3 hari berturut-turut!', { duration: 2600 });
                            }, 850);
                        }
                    } catch {
                        // no-op
                    }
                }

                function getVisibleVerseLines() {
                    return Array.from(document.querySelectorAll('.vh-verse-line[data-vh-verse-number]')).filter((line) => {
                        if (!(line instanceof HTMLElement)) return false;
                        if (line.offsetParent === null) return false;
                        const rect = line.getBoundingClientRect();
                        return rect.bottom > 72 && rect.top < window.innerHeight;
                    });
                }

                function refreshReadingProgress() {
                    progressTicking = false;
                    if (!progressBars.length && !progressLabels.length) return;
                    const lines = getVisibleVerseLines();
                    if (!lines.length) return;

                    let totalVerses = 0;
                    lines.forEach((line) => {
                        const num = Number(line.getAttribute('data-vh-verse-number') || 0);
                        if (Number.isFinite(num) && num > totalVerses) totalVerses = num;
                    });
                    if (totalVerses < 1) return;

                    const centerY = window.innerHeight * 0.36;
                    let activeVerse = 1;
                    let bestDistance = Number.POSITIVE_INFINITY;
                    lines.forEach((line) => {
                        const rect = line.getBoundingClientRect();
                        const num = Number(line.getAttribute('data-vh-verse-number') || 0);
                        if (!Number.isFinite(num) || num < 1) return;
                        const dist = Math.abs((rect.top + rect.bottom) / 2 - centerY);
                        if (dist < bestDistance) {
                            bestDistance = dist;
                            activeVerse = num;
                        }
                    });

                    const ratio = Math.max(0, Math.min(1, activeVerse / totalVerses));
                    const label = `Ayat ${activeVerse} dari ${totalVerses}`;
                    progressBars.forEach((bar) => {
                        if (bar instanceof HTMLElement) bar.style.width = `${Math.round(ratio * 100)}%`;
                    });
                    progressLabels.forEach((el) => {
                        if (el instanceof HTMLElement) el.textContent = label;
                    });

                    markChapterCompletionIfNeeded(totalVerses, activeVerse);
                }

                function queueReadingProgressRefresh() {
                    if (progressTicking) return;
                    progressTicking = true;
                    window.requestAnimationFrame(refreshReadingProgress);
                }

                readingModeButtons.forEach((btn) => {
                    btn.addEventListener('click', () => {
                        setReadingMode(btn.getAttribute('data-mode') || 'normal');
                    });
                });
                if (textSizeInput) {
                    textSizeInput.addEventListener('input', () => {
                        setTextSizeIndex(textSizeInput.value, true);
                    });
                }

                if (readingModeButtons.length > 0) {
                    try {
                        setReadingMode(localStorage.getItem(readingModeKey) || 'normal', false);
                    } catch {
                        setReadingMode('normal', false);
                    }
                } else {
                    setReadingMode('normal', false);
                }
                if (textSizeInput) {
                    try {
                        setTextSizeIndex(localStorage.getItem(textSizeKey) || '1', false);
                    } catch {
                        setTextSizeIndex(1, false);
                    }
                } else {
                    setTextSizeIndex(1, false);
                }

                queueReadingProgressRefresh();
                document.addEventListener('scroll', queueReadingProgressRefresh, { passive: true, capture: true });
                window.addEventListener('resize', queueReadingProgressRefresh);

                // Menu elements
                const menu = document.getElementById('vh-verse-menu');
                const menuCard = document.getElementById('vh-verse-menu-card');
                const menuBackdrop = document.getElementById('vh-verse-menu-backdrop');
                const menuTitle = document.getElementById('vh-verse-menu-title');
                const menuPreview = document.getElementById('vh-verse-menu-preview');
                const menuTitleMobile = document.getElementById('vh-verse-menu-title-mobile');
                const menuPreviewMobile = document.getElementById('vh-verse-menu-preview-mobile');
                const menuCloseMobile = document.getElementById('vh-verse-menu-close');
                const menuCloseDesktop = document.getElementById('vh-verse-menu-close-desktop');
                const toast = document.getElementById('vh-toast');
                const toastMessage = document.getElementById('vh-toast-message');
                const toastLink = document.getElementById('vh-toast-link');
                const noteDrawer = document.getElementById('vh-note-drawer');
                const noteRef = document.getElementById('vh-note-ref');
                const noteInput = document.getElementById('vh-note-input');
                const noteSave = document.getElementById('vh-note-save');
                const noteClear = document.getElementById('vh-note-clear');
                const noteClose = document.getElementById('vh-note-close');

                let activeLine = null;
                let activeKey = null;
                let toastTimer = null;
                let drawerKey = null;
                let refreshSummaryTimer = null;

                function maybeRunFirstSaveConfetti(didAdd, sourceEl = null) {
                    if (!didAdd || !isAuthed || prefersReducedMotion) return;
                    if (!journeySummaryReady || latestJourneyTotal > 0) return;
                    try {
                        if (localStorage.getItem(confettiOnceKey) === '1') return;
                    } catch {
                        return;
                    }

                    const host = document.createElement('div');
                    host.className = 'pointer-events-none fixed inset-0 z-[85]';
                    const cloud = document.createElement('div');
                    cloud.className = 'absolute h-16 w-44';

                    const rect = sourceEl && typeof sourceEl.getBoundingClientRect === 'function'
                        ? sourceEl.getBoundingClientRect()
                        : null;
                    const fallbackX = window.innerWidth / 2;
                    const fallbackY = Math.min(window.innerHeight * 0.28, 220);
                    const anchorX = rect ? rect.left + rect.width / 2 : fallbackX;
                    const anchorY = rect ? rect.top + rect.height / 2 : fallbackY;
                    cloud.style.left = `${Math.max(16, Math.min(window.innerWidth - 16, anchorX))}px`;
                    cloud.style.top = `${Math.max(16, Math.min(window.innerHeight - 16, anchorY))}px`;
                    cloud.style.transform = 'translate(-50%, -50%)';
                    host.appendChild(cloud);

                    const colors = ['#22c55e', '#38bdf8', '#a78bfa', '#f97316', '#eab308', '#14b8a6'];
                    for (let i = 0; i < 14; i += 1) {
                        const dot = document.createElement('span');
                        const size = 4 + Math.round(Math.random() * 4);
                        const x = Math.round((Math.random() - 0.5) * 80);
                        const y = 42 + Math.round(Math.random() * 30);
                        const rot = Math.round((Math.random() - 0.5) * 420);
                        const delay = Math.round(Math.random() * 90);
                        dot.style.position = 'absolute';
                        dot.style.left = '50%';
                        dot.style.top = '8px';
                        dot.style.width = `${size}px`;
                        dot.style.height = `${size}px`;
                        dot.style.marginLeft = `${Math.round((Math.random() - 0.5) * 18)}px`;
                        dot.style.borderRadius = '999px';
                        dot.style.background = colors[i % colors.length];
                        dot.style.setProperty('--vh-cx', `${x}px`);
                        dot.style.setProperty('--vh-cy', `${y}px`);
                        dot.style.setProperty('--vh-cr', `${rot}deg`);
                        dot.style.animation = `vhConfettiFall 700ms ease-out ${delay}ms forwards`;
                        cloud.appendChild(dot);
                    }

                    document.body.appendChild(host);
                    window.setTimeout(() => {
                        host.remove();
                    }, 1200);

                    try {
                        localStorage.setItem(confettiOnceKey, '1');
                    } catch {
                        // no-op
                    }
                }

                function showToast(message, options = {}) {
                    if (!toast || !message) return;
                    const linkHref = typeof options.ctaHref === 'string' ? options.ctaHref.trim() : '';
                    const linkLabel = typeof options.ctaLabel === 'string' ? options.ctaLabel.trim() : '';
                    const duration = Number(options.duration || 1700);
                    if (toastMessage) {
                        toastMessage.textContent = message;
                    } else {
                        toast.textContent = message;
                    }
                    if (toastLink) {
                        if (linkHref) {
                            toastLink.setAttribute('href', linkHref);
                            toastLink.textContent = linkLabel || 'View now →';
                            toastLink.classList.remove('hidden');
                        } else {
                            toastLink.classList.add('hidden');
                        }
                    }
                    toast.classList.remove('hidden');
                    if (toastTimer) clearTimeout(toastTimer);
                    toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
                }

                function refreshSavedSummarySoon() {
                    if (refreshSummaryTimer) clearTimeout(refreshSummaryTimer);
                    refreshSummaryTimer = setTimeout(() => {
                        hydrateSavedSummary();
                    }, 120);
                }

                function isDesktopView() {
                    return window.matchMedia('(min-width: 768px)').matches;
                }

                function openNoteDrawerForActive() {
                    if (!noteDrawer || !noteInput || !noteRef || !activeKey || !activeLine) return;
                    const label = activeLine.getAttribute('data-vh-verse-label') || 'Ayat';
                    const current = getState(activeKey);
                    drawerKey = activeKey;
                    noteRef.textContent = label;
                    noteInput.value = String(current.note || '');
                    noteDrawer.classList.remove('hidden');
                    setTimeout(() => noteInput.focus(), 20);
                }

                function closeNoteDrawer() {
                    drawerKey = null;
                    noteDrawer?.classList.add('hidden');
                }

                function openMenuForLine(line, clientX, clientY) {
                    activeLine = line;
                    activeKey = line.getAttribute('data-vh-verse-key');
                    if (!activeKey) return;

                    const label = line.getAttribute('data-vh-verse-label') || 'Ayat';
                    const preview = String(line.getAttribute('data-vh-verse-text') || '').trim();
                    if (menuTitle) menuTitle.textContent = label;
                    if (menuPreview) menuPreview.textContent = preview;
                    if (menuTitleMobile) menuTitleMobile.textContent = label;
                    if (menuPreviewMobile) menuPreviewMobile.textContent = preview;

                    selectLine(line);
                    syncActionLabels();
                    menu.classList.remove('hidden');

                    // Desktop drawer
                    if (menuCard && window.innerWidth >= 640) {
                        menuCard.classList.remove('hidden');
                    }
                }

                function closeMenu() {
                    menu.classList.add('hidden');
                    if (menuCard) menuCard.classList.add('hidden');
                    activeLine = null;
                    activeKey = null;
                    clearSelection();
                }

                noteClose?.addEventListener('click', closeNoteDrawer);
                noteClear?.addEventListener('click', () => {
                    if (!noteInput) return;
                    noteInput.value = '';
                });
                noteSave?.addEventListener('click', async () => {
                    if (!drawerKey || !noteInput) return;
                    const line = document.querySelector(`.vh-verse-line[data-vh-verse-key="${drawerKey}"]`);
                    if (!line) return;
                    activeLine = line;
                    activeKey = drawerKey;
                    const current = getState(drawerKey);
                    const normalized = noteInput.value.trim();
                    updateState({ note: normalized });
                    showToast(
                        normalized ? '📝 Reflection saved. Keep building your journey.' : 'Catatan dihapus',
                        normalized
                            ? { ctaHref: '/versehub/id/my-spiritual-journey', ctaLabel: 'View now →', duration: 2500 }
                            : { duration: 1700 }
                    );
                    maybeRunFirstSaveConfetti(Boolean(normalized) && String(current?.note || '').trim() === '', noteSave);
                    closeNoteDrawer();
                });

                if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);
                if (menuCloseMobile) menuCloseMobile.addEventListener('click', closeMenu);
                if (menuCloseDesktop) menuCloseDesktop.addEventListener('click', closeMenu);
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') closeMenu();
                });

                // Prevent verse share link from opening menu
                document.querySelectorAll('.vh-verse-link').forEach((a) => {
                    a.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                });

                // Verse text interaction:
                // - Desktop: tap/click opens action menu immediately.
                // - Mobile: long-press (2.5s) opens action menu to avoid scroll conflict.
                const VH_LONG_PRESS_MS = 2500;
                const VH_MOVE_CANCEL_PX = 22;
                let vhLongPressTimer = null;
                let vhPressPointerId = null;
                let vhPressStartX = 0;
                let vhPressStartY = 0;
                let vhPressLine = null;
                let vhPressBtn = null;
                let vhSuppressNextClick = false;

                function isMobileLongPressMode() {
                    return window.matchMedia('(max-width: 767.98px), (pointer: coarse)').matches;
                }

                function clearLongPressState() {
                    if (vhLongPressTimer) {
                        clearTimeout(vhLongPressTimer);
                    }
                    vhLongPressTimer = null;
                    vhPressPointerId = null;
                    vhPressStartX = 0;
                    vhPressStartY = 0;
                    vhPressLine = null;
                    vhPressBtn = null;
                }

                function openMenuAtLine(line, x, y) {
                    if (!line) return;
                    if (typeof window.openMenuForLine === 'function') {
                        window.openMenuForLine(line, x, y);
                        return;
                    }
                    try {
                        openMenuForLine(line, x, y);
                    } catch (err) {
                        console.log('Picker handler ran, but openMenuForLine not reachable.', err);
                    }
                }

                function cancelLongPressOnMove(e) {
                    if (!vhLongPressTimer) return;
                    if (vhPressPointerId !== null && e.pointerId !== vhPressPointerId) return;
                    if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
                    const dx = Math.abs(e.clientX - vhPressStartX);
                    const dy = Math.abs(e.clientY - vhPressStartY);
                    if (dx > VH_MOVE_CANCEL_PX || dy > VH_MOVE_CANCEL_PX) {
                        clearLongPressState();
                    }
                }

                document.addEventListener(
                    'pointerdown',
                    function (e) {
                        const target = e.target;
                        if (!(target instanceof Element)) return;
                        const btn = target.closest('.vh-verse-text-btn');
                        if (!btn) return;
                        const line = btn.closest('.vh-verse-line');
                        if (!line) return;

                        if (isMobileLongPressMode()) {
                            return;
                        }

                        // Desktop immediate open
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                        const x = typeof e.clientX === 'number' ? e.clientX : line.getBoundingClientRect().left + 120;
                        const y = typeof e.clientY === 'number' ? e.clientY : line.getBoundingClientRect().top + 16;
                        openMenuAtLine(line, x, y);
                    },
                    true
                );

                document.addEventListener('pointermove', cancelLongPressOnMove, true);
                document.addEventListener(
                    'pointerup',
                    function (e) {
                        if (vhPressPointerId !== null && e.pointerId !== vhPressPointerId) return;
                        clearLongPressState();
                    },
                    true
                );
                document.addEventListener(
                    'pointercancel',
                    function (e) {
                        if (vhPressPointerId !== null && e.pointerId !== vhPressPointerId) return;
                        clearLongPressState();
                    },
                    true
                );
                window.addEventListener(
                    'scroll',
                    function () {
                        clearLongPressState();
                    },
                    { passive: true }
                );

                // Prevent fallback click behavior on verse text button.
                document.addEventListener(
                    'click',
                    function (e) {
                        const target = e.target;
                        if (!(target instanceof Element)) return;
                        const btn = target.closest('.vh-verse-text-btn');
                        if (!btn) return;
                        const line = btn.closest('.vh-verse-line');
                        if (!line) return;

                        if (isMobileLongPressMode()) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                            const r = btn.getBoundingClientRect();
                            const x = r.left + Math.min(r.width, 160);
                            const y = r.top + 16;
                            openMenuAtLine(line, x, y);
                            return;
                        }

                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

                        if (vhSuppressNextClick) {
                            vhSuppressNextClick = false;
                        }
                    },
                    true
                );

                // Prevent native long-press context menu on verse text (mobile),
                // otherwise browser can cancel our timer before picker opens.
                document.addEventListener(
                    'contextmenu',
                    function (e) {
                        const target = e.target;
                        if (!(target instanceof Element)) return;
                        if (!target.closest('.vh-verse-text-btn')) return;
                        e.preventDefault();
                    },
                    true
                );

                // Handle actions
                function updateState(patch) {
                    if (!activeKey || !activeLine) return;
                    const current = getState(activeKey);
                    const next = { ...current, ...patch };
                    setState(activeKey, next);
                    applyStateToLine(activeLine, next);
                    syncActionLabels();
                    persistStateServer(activeKey, next);
                    refreshSavedSummarySoon();
                    return next;
                }

                function setActionLabel(action, text) {
                    document.querySelectorAll(`.vh-action[data-action="${action}"]`).forEach((btn) => {
                        btn.textContent = text;
                    });
                }

                function syncActionLabels() {
                    if (!activeKey) return;
                    const current = getState(activeKey);
                    setActionLabel('favorite', current.favorite ? 'Hapus Simpanan' : 'Simpan');
                    setActionLabel('bookmark', current.bookmarked ? 'Hapus Bookmark' : 'Bookmark');
                    setActionLabel('note', (current.note || '').trim() !== '' ? 'Edit Catatan' : 'Tambah Catatan');
                    setActionLabel('highlight', current.highlighted ? 'Hapus Sorotan' : 'Sorot');
                }

                function copyActive() {
                    if (!activeLine) return;
                    const label = activeLine.getAttribute('data-vh-verse-label') || '';
                    const text = activeLine.getAttribute('data-vh-verse-text') || '';
                    const toCopy = `${label}\n${text}`;
                    navigator.clipboard?.writeText(toCopy);
                }

                // Actions buttons (both desktop + mobile share the same classes)
                document.querySelectorAll('.vh-action').forEach((btn) => {
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const action = btn.getAttribute('data-action');
                        const current = activeKey ? getState(activeKey) : null;
                        if (!action || !current) return;
                        if (['favorite', 'bookmark', 'note', 'highlight', 'share'].includes(action) && !requireMember()) {
                            return;
                        }

                        if (action === 'favorite') {
                            const next = updateState({ favorite: !current.favorite });
                            showToast(
                                next?.favorite ? '✔️ Saved to My Spiritual Journey' : 'Favorite dihapus',
                                next?.favorite
                                    ? { ctaHref: '/versehub/id/my-spiritual-journey', ctaLabel: 'View now →', duration: 2500 }
                                    : { duration: 1700 }
                            );
                            maybeRunFirstSaveConfetti(Boolean(next?.favorite), btn);
                        }

                        if (action === 'bookmark') {
                            const next = updateState({ bookmarked: !current.bookmarked });
                            showToast(
                                next?.bookmarked ? '✔ Verse added to your Spiritual Journey' : 'Bookmark dihapus',
                                next?.bookmarked
                                    ? { ctaHref: '/versehub/id/my-spiritual-journey', ctaLabel: 'View now →', duration: 2500 }
                                    : { duration: 1700 }
                            );
                            maybeRunFirstSaveConfetti(Boolean(next?.bookmarked), btn);
                        }

                        if (action === 'highlight') {
                            const next = updateState({ highlighted: !current.highlighted });
                            showToast(next?.highlighted ? 'Highlight aktif' : 'Highlight dihapus');
                        }

                        if (action === 'note') {
                            if (isDesktopView()) {
                                openNoteDrawerForActive();
                                closeMenu();
                            } else {
                                const nextNote = prompt('Tulis catatan untuk ayat ini:', current.note || '');
                                if (nextNote !== null) {
                                    const normalized = nextNote.trim();
                                    updateState({ note: normalized });
                                    showToast(
                                        normalized ? '📝 Reflection saved. Keep building your journey.' : 'Catatan dihapus',
                                        normalized
                                            ? { ctaHref: '/versehub/id/my-spiritual-journey', ctaLabel: 'View now →', duration: 2500 }
                                            : { duration: 1700 }
                                    );
                                    maybeRunFirstSaveConfetti(Boolean(normalized) && String(current?.note || '').trim() === '', btn);
                                }
                            }
                        }

                        if (action === 'copy') {
                            copyActive();
                            showToast('Teks ayat disalin');
                            closeMenu();
                        }

                        if (action === 'share') {
                            // Share the verse URL if possible
                            const verseLink =
                                activeLine?.querySelector('a.vh-verse-link')?.getAttribute('href') ||
                                activeLine?.getAttribute('data-vh-href') ||
                                window.location.href;
                            const label =
                                activeLine?.getAttribute('data-vh-verse-label') || '';
                            const text = 
                                activeLine?.getAttribute('data-vh-verse-text') || '';
                            const payload = 
                                { title: label, text: `${label}\n${text}`, url: verseLink || window.location.href };

                            if (navigator.share) {
                                navigator.share(payload).catch(() => {});
                            } else {
                                // fallback: copy link
                                navigator.clipboard?.writeText(payload.url);
                                showToast('Link ayat disalin');
                            }
                            closeMenu();
                        }

                        if (action === 'cross') {
                            const parsed = parseVerseKey(activeKey || '');
                            const query = parsed
                                ? `${String(parsed.book || '').toUpperCase()} ${parsed.chapter}:${parsed.verse}`
                                : (activeLine?.getAttribute('data-vh-verse-label') || '');
                            const target = query
                                ? `/versehub/id?q=${encodeURIComponent(query)}`
                                : '/versehub/id';
                            closeMenu();
                            window.location.assign(target);
                        }
                    });
                });

                // Highlight color
                document.querySelectorAll('.vh-color').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const color = btn.getAttribute('data-color') || 'yellow';
                        updateState({ highlighted: true, highlightColor: color });
                        showToast('Warna highlight diperbarui');
                    });
                });
                // Picker logic moved to definitive binder below.
            })();
        </script>
        <script>
            (() => {
                const fetchJsonSafe = window.__vhFetchJsonSafe || (async (url, options = {}) => {
                    try {
                        const res = await fetch(url, options);
                        if (!res.ok) return null;
                        const contentType = String(res.headers.get('content-type') || '').toLowerCase();
                        if (!contentType.includes('application/json')) return null;
                        return await res.json();
                    } catch {
                        return null;
                    }
                });
                const inputs = Array.from(document.querySelectorAll('input[data-vh-ref-search="1"]'));
                if (!inputs.length) return;

                const debounce = (fn, wait = 180) => {
                    let t = null;
                    return (...args) => {
                        if (t) clearTimeout(t);
                        t = setTimeout(() => fn(...args), wait);
                    };
                };

                const closeAll = () => {
                    document.querySelectorAll('[id^="vh-"][id$="-suggest-list"]').forEach((el) => {
                        el.classList.add('hidden');
                        el.innerHTML = '';
                    });
                };

                document.addEventListener('click', (e) => {
                    if (!(e.target instanceof HTMLElement)) return;
                    if (e.target.closest('[data-vh-search-form]')) return;
                    closeAll();
                });

                const renderItems = (container, items, input) => {
                    container.innerHTML = '';
                    if (!Array.isArray(items) || !items.length) {
                        container.classList.add('hidden');
                        return;
                    }

                    items.forEach((item) => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = 'block w-full border-b border-border/40 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-muted';
                        button.textContent = item.label || item.value || '';
                        button.addEventListener('click', () => {
                            if (item.href) {
                                window.location.assign(item.href);
                                return;
                            }
                            input.value = item.value || '';
                            const form = input.closest('form');
                            if (form) form.submit();
                        });
                        container.appendChild(button);
                    });

                    container.classList.remove('hidden');
                };

                const fetchSuggest = debounce(async (input) => {
                    const q = (input.value || '').trim();
                    const listId = input.getAttribute('data-vh-ref-list');
                    if (!listId) return;
                    const container = document.getElementById(listId);
                    if (!container) return;
                    if (q.length < 1) {
                        container.classList.add('hidden');
                        container.innerHTML = '';
                        return;
                    }

                    try {
                        const data = await fetchJsonSafe(`/versehub/id/suggest?q=${encodeURIComponent(q)}`, {
                            headers: { Accept: 'application/json' },
                        });
                        if (!data) throw new Error('bad response');
                        const items = Array.isArray(data?.rich_items) ? data.rich_items : [];
                        renderItems(container, items, input);
                    } catch {
                        container.classList.add('hidden');
                        container.innerHTML = '';
                    }
                }, 180);

                inputs.forEach((input) => {
                    const helperPlaceholder = input.getAttribute('data-vh-placeholder') || '';
                    input.setAttribute('placeholder', '');
                    input.addEventListener('input', () => fetchSuggest(input));
                    input.addEventListener('focus', () => {
                        input.setAttribute('placeholder', helperPlaceholder);
                        fetchSuggest(input);
                    });
                    input.addEventListener('blur', () => {
                        if ((input.value || '').trim() === '') {
                            input.setAttribute('placeholder', '');
                        }
                    });
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') closeAll();
                    });
                });
            })();
        </script>
        <script>
            (() => {
                const fetchJsonSafe = window.__vhFetchJsonSafe || (async (url, options = {}) => {
                    try {
                        const res = await fetch(url, options);
                        if (!res.ok) return null;
                        const contentType = String(res.headers.get('content-type') || '').toLowerCase();
                        if (!contentType.includes('application/json')) return null;
                        return await res.json();
                    } catch {
                        return null;
                    }
                });
                // Definitive picker binder: capture-phase + self-contained render flow.
                if (window.__vhPickerDefinitiveBound) return;
                window.__vhPickerDefinitiveBound = true;

                const books = @json($books);
                const selectedBook = @json($selected_book);
                const chaptersInitial = @json($chapters);

                const picker = document.getElementById('vh-picker');
                const closeBtn = document.getElementById('vh-picker-close');
                const backdrop = document.getElementById('vh-picker-backdrop');
                const tabOt = document.getElementById('vh-tab-ot');
                const tabNt = document.getElementById('vh-tab-nt');
                const bookList = document.getElementById('vh-book-list');
                const chapterRanges = document.getElementById('vh-chapter-ranges');
                const chapterGrid = document.getElementById('vh-chapter-grid');

                if (!picker || !closeBtn || !backdrop || !tabOt || !tabNt || !bookList || !chapterRanges || !chapterGrid) return;

                let activeBook = selectedBook || null;
                let chapters = Array.isArray(chaptersInitial) ? chaptersInitial : [];
                let chapterRangeStart = 1;
                const selectedMeta = Array.isArray(books) ? books.find((b) => b && b.code === activeBook) : null;
                let activeTab = selectedMeta && selectedMeta.testament === 'nt' ? 'nt' : 'ot';

                const setTabUi = () => {
                    tabOt.className = activeTab === 'ot'
                        ? 'rounded-2xl bg-surface px-3 py-2 text-xs font-semibold shadow-soft'
                        : 'rounded-2xl px-3 py-2 text-xs font-semibold text-muted-foreground';
                    tabNt.className = activeTab === 'nt'
                        ? 'rounded-2xl bg-surface px-3 py-2 text-xs font-semibold shadow-soft'
                        : 'rounded-2xl px-3 py-2 text-xs font-semibold text-muted-foreground';
                };

                const renderBooks = () => {
                    bookList.innerHTML = '';
                    const list = (Array.isArray(books) ? books : []).filter((b) => b && b.testament === activeTab);
                    list.forEach((b) => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        const isActive = activeBook === b.code;
                        btn.className = isActive
                            ? 'block w-full rounded-2xl bg-surface-muted px-3 py-2 text-left text-sm font-semibold'
                            : 'block w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-surface-muted';
                        btn.textContent = b.label;
                        btn.addEventListener('click', () => {
                            activeBook = b.code;
                            chapterRangeStart = 1;
                            renderBooks();
                            fetchChapters(activeBook);
                        });
                        bookList.appendChild(btn);
                    });
                };

                const renderChapters = () => {
                    chapterRanges.innerHTML = '';
                    chapterGrid.innerHTML = '';

                    if (!activeBook || !Array.isArray(chapters) || chapters.length === 0) {
                        const p = document.createElement('p');
                        p.className = 'col-span-full text-xs text-muted-foreground';
                        p.textContent = activeBook ? 'No chapters' : 'Pilih kitab dulu';
                        chapterGrid.appendChild(p);
                        return;
                    }

                    const maxCh = Math.max.apply(null, chapters);
                    const pageSize = 50;
                    let visible = chapters;

                    if (Number.isFinite(maxCh) && maxCh > 60) {
                        const ranges = [];
                        for (let start = 1; start <= maxCh; start += pageSize) {
                            ranges.push({ start: start, end: Math.min(maxCh, start + pageSize - 1) });
                        }
                        if (!ranges.some((r) => r.start === chapterRangeStart)) {
                            chapterRangeStart = ranges[0] ? ranges[0].start : 1;
                        }
                        const activeRange = ranges.find((r) => r.start === chapterRangeStart) || ranges[0];
                        visible = chapters.filter((ch) => ch >= activeRange.start && ch <= activeRange.end);

                        const wrap = document.createElement('div');
                        wrap.className = '-mx-1 mb-2 flex flex-wrap gap-2 rounded-2xl bg-surface/90 px-1 py-1';
                        ranges.forEach((r) => {
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            const isActive = r.start === chapterRangeStart;
                            btn.className = isActive
                                ? 'tct-pressable rounded-2xl bg-surface px-3 py-2 text-xs font-semibold shadow-soft'
                                : 'tct-pressable rounded-2xl bg-surface-muted px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground';
                            btn.textContent = `${r.start}-${r.end}`;
                            btn.addEventListener('click', () => {
                                chapterRangeStart = r.start;
                                renderChapters();
                            });
                            wrap.appendChild(btn);
                        });
                        chapterRanges.appendChild(wrap);
                    }

                    visible.forEach((ch) => {
                        const target = `/versehub/id/${encodeURIComponent(String(activeBook))}-${encodeURIComponent(String(ch))}`;
                        const a = document.createElement('a');
                        a.href = target;
                        a.className = 'tct-pressable flex items-center justify-center rounded-xl bg-surface-muted px-2 py-1.5 text-[11px] font-semibold ring-1 ring-black/5 dark:ring-white/10';
                        a.textContent = String(ch);
                        a.addEventListener('click', (e) => {
                            e.preventDefault();
                            closePicker();
                            window.location.assign(target);
                        });
                        chapterGrid.appendChild(a);
                    });
                };

                const fetchChapters = async (bookCode) => {
                    if (!bookCode) {
                        chapters = [];
                        chapterRangeStart = 1;
                        renderChapters();
                        return;
                    }
                    try {
                        const data = await fetchJsonSafe(`/versehub/id/chapters?book=${encodeURIComponent(String(bookCode))}`, {
                            headers: { Accept: 'application/json' },
                        });
                        if (!data) throw new Error('bad response');
                        chapters = Array.isArray(data && data.chapters) ? data.chapters : [];
                    } catch {
                        chapters = [];
                    }
                    renderChapters();
                };

                const setTab = (tab) => {
                    activeTab = tab;
                    setTabUi();
                    renderBooks();
                };

                const openPicker = () => {
                    picker.classList.remove('hidden');
                    document.documentElement.classList.add('vh-no-scroll');
                    setTabUi();
                    renderBooks();
                    renderChapters();
                };

                const closePicker = () => {
                    picker.classList.add('hidden');
                    document.documentElement.classList.remove('vh-no-scroll');
                };

                window.__vhOpenPicker = openPicker;
                window.__vhClosePicker = closePicker;

                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    closePicker();
                });
                backdrop.addEventListener('click', (e) => {
                    e.preventDefault();
                    closePicker();
                });
                tabOt.addEventListener('click', () => setTab('ot'));
                tabNt.addEventListener('click', () => setTab('nt'));
                document.querySelectorAll('[data-vh-open-picker="1"]').forEach((openerBtn) => {
                    openerBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openPicker();
                    });
                });

                document.addEventListener('click', (e) => {
                    const rawTarget = e.target;
                    const target = rawTarget instanceof Element
                        ? rawTarget
                        : (rawTarget && rawTarget.parentElement ? rawTarget.parentElement : null);
                    if (!(target instanceof Element)) return;

                    const opener = target.closest('[data-vh-open-picker="1"]');
                    if (!opener) return;

                    // Capture click before legacy listeners to avoid dead/close race.
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof e.stopImmediatePropagation === 'function') {
                        e.stopImmediatePropagation();
                    }
                    openPicker();
                }, true);

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') closePicker();
                });

                setTab(activeTab);
                renderChapters();
            })();
        </script>
    </body>
</html>

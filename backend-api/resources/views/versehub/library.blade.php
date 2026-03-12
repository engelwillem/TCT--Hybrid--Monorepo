<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="app-name" content="{{ config('app.name', 'TheChosenTalks') }}" />
        <link rel="icon" type="image/svg+xml" href="{{ \App\Support\AppSettings::get('site.favicon_url', '/favicon.svg') }}">
        <link rel="shortcut icon" href="{{ \App\Support\AppSettings::get('site.favicon_url', '/favicon.svg') }}">
        <link rel="apple-touch-icon" href="{{ \App\Support\AppSettings::get('site.favicon_url', '/favicon.svg') }}">
        <title>{{ $title ?? 'VerseHub Library' }}</title>
        <link rel="canonical" href="{{ $canonical_url }}" />

        <!-- Fonts (match app) -->
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css'])
        <style>
            :root {
                --brand: {{ e(config('ui.brand_hsl')) }};
                --brand-foreground: {{ e(config('ui.brand_foreground_hsl')) }};
            }
        </style>
    </head>
    <body class="min-h-screen bg-background text-foreground">
        <div aria-hidden class="pointer-events-none fixed inset-0">
            <div class="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"></div>
            <div class="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-400/5 blur-3xl"></div>
        </div>

        <main class="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
            <header class="space-y-3">
                <div class="flex items-center justify-between">
                    <div class="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs text-muted-foreground shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                        <span class="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden></span>
                        VerseHub
                    </div>
                    <div class="flex items-center gap-2">
                        <a href="/library" class="text-xs font-medium text-muted-foreground hover:text-foreground">Back to Library</a>
                    </div>
                </div>

                <h1 class="tct-brand-gradient text-balance text-3xl font-semibold tracking-tight">
                    {{ $lang === 'id' ? 'Alkitab' : 'Bible' }}
                </h1>
                <p class="text-sm text-muted-foreground">
                    browse & search ayat Alkitab.
                </p>
            </header>

            <div class="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
            <section class="rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-black/5 dark:ring-white/10 backdrop-blur lg:col-start-2">
                <form method="get" action="{{ url('/versehub/'.$lang) }}" class="flex items-center gap-3">
                    <div class="relative w-full">
                        <input
                            id="vh-q"
                            type="text"
                            name="q"
                            value="{{ $q }}"
                            placeholder="Quick open: kej 1:1 (autocomplete)"
                            autocomplete="off"
                            class="w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand dark:ring-white/10"
                        />

                        <div
                            id="vh-suggest"
                            class="absolute left-0 right-0 top-full z-10 mt-2 hidden overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5 shadow-soft dark:ring-white/10"
                        ></div>
                    </div>
                    <button
                        type="submit"
                        class="tct-pressable rounded-2xl bg-surface-dark px-4 py-3 text-sm font-semibold text-brand"
                    >
                        Search
                    </button>
                </form>

                <div class="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Language:</span>
                    <a
                        href="/versehub/id"
                        class="rounded-full px-3 py-1 ring-1 ring-black/5 dark:ring-white/10 {{ $lang === 'id' ? 'bg-surface-muted text-foreground' : 'text-muted-foreground hover:text-foreground' }}"
                    >ID</a>
                    <a
                        href="/versehub/en"
                        class="rounded-full px-3 py-1 ring-1 ring-black/5 dark:ring-white/10 {{ $lang === 'en' ? 'bg-surface-muted text-foreground' : 'text-muted-foreground hover:text-foreground' }}"
                    >EN</a>
                </div>
            </section>

            @if(!empty($quick) && empty($quick_verse) && $lang === 'id')
                <section class="rounded-3xl bg-amber-400/10 p-5 text-xs text-amber-100 ring-1 ring-amber-400/20 lg:col-start-2">
                    Verse not found in local AYT DB for <span class="font-semibold">{{ $quick['book'] }} {{ $quick['chapter'] }}:{{ $quick['verse'] }}</span>.
                    <span class="opacity-70">(Tip: import full dataset with <code>php artisan versehub:import-ayt --truncate</code>)</span>
                </section>
            @endif

            @if(!empty($quick_verse) && $lang === 'id')
                <section class="rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-black/5 dark:ring-white/10 lg:col-start-2">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <p class="text-sm font-semibold">{{ $quick_verse['reference'] }}</p>
                            <p class="mt-1 text-xs text-muted-foreground">{{ $quick_verse['provider'] }} • {{ $quick_verse['translation_name'] }}</p>
                        </div>
                        <a
                            class="tct-pressable rounded-2xl bg-surface-dark px-4 py-3 text-xs font-semibold text-brand"
                            href="{{ url('/versehub/'.$lang.'/'.$quick['book'].'-'.$quick['chapter'].'-'.$quick['verse']) }}"
                        >
                            Open
                        </a>
                    </div>
                    <p class="mt-4 text-sm leading-7">{{ $quick_verse['text'] }}</p>
                </section>
            @endif

            <!-- Full-text search section (separate from quick-open/browse) -->
            <section class="rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-black/5 dark:ring-white/10 lg:col-start-2">
                <div class="flex items-center justify-between">
                    <h2 class="text-sm font-semibold">Search verses</h2>
                    @if($lang !== 'id')
                        <span class="text-xs text-muted-foreground">(ID only for now)</span>
                    @endif
                </div>

                <form method="get" action="{{ url('/versehub/'.$lang) }}" class="mt-3 flex items-center gap-3">
                    <input
                        type="text"
                        name="s"
                        value="{{ $s ?? '' }}"
                        placeholder="Cari kata… (contoh: Allah)"
                        class="w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand dark:ring-white/10"
                    />
                    <button
                        type="submit"
                        class="tct-pressable rounded-2xl bg-surface-dark px-4 py-3 text-sm font-semibold text-brand"
                    >
                        Search
                    </button>
                </form>

                @if(!empty($s) && empty($search_results) && $lang === 'id')
                    <p class="mt-4 text-xs text-muted-foreground">
                        No results for <span class="font-semibold text-foreground">{{ $s }}</span>.
                    </p>
                @endif

                @if(!empty($search_results))
                    <div class="mt-4 space-y-2">
                        @php
                            $kw = trim((string) ($s ?? ''));
                        @endphp
                        @foreach($search_results as $r)
                            @php
                                $text = (string) ($r['text'] ?? '');
                                // Simple highlight (case-insensitive) - safe HTML.
                                $safe = e($text);
                                if ($kw !== '') {
                                    $safe = preg_replace('/(' . preg_quote($kw, '/') . ')/i', '<mark class="rounded bg-brand/25 px-1">$1</mark>', $safe) ?? $safe;
                                }
                            @endphp
                            <a
                                href="{{ url('/versehub/'.$lang.'/'.$r['book_code'].'-'.$r['chapter'].'-'.$r['verse']) }}"
                                class="tct-pressable block rounded-3xl bg-surface-muted p-5 ring-1 ring-black/5 hover:bg-surface dark:ring-white/10"
                            >
                                <p class="text-xs font-semibold text-muted-foreground">
                                    {{ $r['reference'] ?: strtoupper($r['book_code']).' '.$r['chapter'].':'.$r['verse'] }}
                                </p>
                                <p class="mt-2 text-sm leading-7">{!! $safe !!}</p>
                            </a>
                        @endforeach
                    </div>
                @endif
            </section>

            @php
                $mode = $mode ?? 'books';
            @endphp

            @if($mode === 'books')
                <section class="space-y-3 lg:col-start-1 lg:row-start-1">
                    <h2 class="text-sm font-semibold">Books</h2>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        @foreach($books as $b)
                            <a
                                href="{{ url('/versehub/'.$lang).'?book='.$b['code'] }}"
                                class="tct-pressable rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-black/5 hover:bg-surface-muted dark:ring-white/10"
                            >
                                <p class="text-sm font-semibold">{{ $b['label'] }}</p>
                                <p class="mt-1 text-xs text-muted-foreground">
                                    Browse chapters
                                    @if(array_key_exists('count', $b) && $b['count'])
                                        <span class="opacity-50">• {{ number_format($b['count']) }} verses</span>
                                    @endif
                                </p>
                            </a>
                        @endforeach
                    </div>
                </section>
            @endif

            @if($mode === 'chapters')
                <section class="space-y-3 lg:col-start-1 lg:row-start-1">
                    <div class="flex items-center justify-between">
                        <div class="text-sm font-semibold">
                            <a class="text-muted-foreground hover:text-foreground" href="{{ url('/versehub/'.$lang) }}">Books</a>
                            <span class="opacity-40"> / </span>
                            <span>{{ $selected_book_label }}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        @foreach($chapters as $ch)
                            <a
                                href="{{ url('/versehub/'.$lang).'?book='.$selected_book.'&chapter='.$ch }}"
                                class="tct-pressable flex items-center justify-center rounded-2xl bg-surface px-3 py-3 text-sm font-semibold shadow-soft ring-1 ring-black/5 hover:bg-surface-muted dark:ring-white/10"
                            >
                                {{ $ch }}
                            </a>
                        @endforeach
                    </div>
                </section>
            @endif

            @if($mode === 'verses')
                <section class="space-y-3 lg:col-start-1 lg:row-start-1">
                    <div class="flex items-center justify-between">
                        <div class="text-sm font-semibold">
                            <a class="text-muted-foreground hover:text-foreground" href="{{ url('/versehub/'.$lang) }}">Books</a>
                            <span class="opacity-40"> / </span>
                            <a class="text-muted-foreground hover:text-foreground" href="{{ url('/versehub/'.$lang).'?book='.$selected_book }}">{{ $selected_book_label }}</a>
                            <span class="opacity-40"> / </span>
                            <span>Chapter {{ $selected_chapter }}</span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        @foreach($verses as $v)
                            <a
                                href="{{ url('/versehub/'.$lang.'/'.$selected_book.'-'.$selected_chapter.'-'.$v['verse']) }}"
                                class="tct-pressable block rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-black/5 hover:bg-surface-muted dark:ring-white/10"
                            >
                                <div class="flex items-baseline gap-3">
                                    <span class="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-surface-muted px-2 text-xs font-semibold">
                                        {{ $v['verse'] }}
                                    </span>
                                    <span class="text-sm text-muted-foreground">{{ $v['excerpt'] }}</span>
                                </div>
                            </a>
                        @endforeach
                    </div>
                </section>
            @endif

            </div>

            <footer class="mt-10 text-center text-xs text-muted-foreground">
                • thechoosentalks.org •
            </footer>
        </main>

        <script>
            (function () {
                // Autocomplete (kitab -> pasal -> ayat)
                const input = document.getElementById('vh-q');
                const box = document.getElementById('vh-suggest');
                if (!input || !box) return;

                let timer = null;
                let lastController = null;

                const hide = () => {
                    box.classList.add('hidden');
                    box.innerHTML = '';
                };

                const render = (items) => {
                    if (!items || items.length === 0) {
                        hide();
                        return;
                    }

                    box.innerHTML = '';
                    items.forEach((t) => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'block w-full px-4 py-3 text-left text-sm hover:bg-surface-muted';
                        btn.textContent = t;
                        btn.addEventListener('click', () => {
                            // Navigate directly based on suggestion granularity.
                            const raw = String(t);
                            const normalized = raw.replace(/\s+/g, ' ').trim();

                            // book only
                            if (/^[a-z0-9]+$/.test(normalized)) {
                                window.location.assign(`/versehub/{{ $lang }}?book=${encodeURIComponent(normalized)}`);
                                return;
                            }

                            // book chapter
                            const mCh = normalized.match(/^(?<book>[a-z0-9]+)\s+(?<ch>\d+)$/);
                            if (mCh && mCh.groups) {
                                window.location.assign(`/versehub/{{ $lang }}?book=${encodeURIComponent(mCh.groups.book)}&chapter=${encodeURIComponent(mCh.groups.ch)}`);
                                return;
                            }

                            // book chapter:verse
                            const mV = normalized.match(/^(?<book>[a-z0-9]+)\s+(?<ch>\d+):(?<v>\d+)$/);
                            if (mV && mV.groups) {
                                window.location.assign(`/versehub/{{ $lang }}/${encodeURIComponent(mV.groups.book)}-${encodeURIComponent(mV.groups.ch)}-${encodeURIComponent(mV.groups.v)}`);
                                return;
                            }

                            // fallback: set input and submit
                            input.value = raw;
                            hide();
                            input.form?.submit();
                        });
                        box.appendChild(btn);
                    });
                    box.classList.remove('hidden');
                };

                const fetchSuggest = async () => {
                    const q = String(input.value || '').trim();
                    if (q.length === 0) {
                        hide();
                        return;
                    }

                    try {
                        if (lastController) lastController.abort();
                        const controller = new AbortController();
                        lastController = controller;

                        const res = await fetch(`/versehub/{{ $lang }}/suggest?q=${encodeURIComponent(q)}`,
                            { signal: controller.signal, headers: { 'Accept': 'application/json' } }
                        );
                        if (!res.ok) {
                            hide();
                            return;
                        }
                        const data = await res.json();
                        render(Array.isArray(data.items) ? data.items : []);
                    } catch {
                        // ignore
                    }
                };

                input.addEventListener('input', () => {
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(fetchSuggest, 160);
                });

                input.addEventListener('blur', () => {
                    // Delay so click can register.
                    setTimeout(hide, 120);
                });

                input.addEventListener('focus', () => {
                    if (String(input.value || '').trim().length > 0) {
                        fetchSuggest();
                    }
                });
            })();
        </script>
    </body>
</html>

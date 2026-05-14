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

        <title>{{ $reference }} - VerseHub</title>
        <link rel="canonical" href="{{ $canonical_url }}" />

        <!-- Fonts (match app) -->
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Tailwind build -->
        @vite(['resources/css/app.css'])

        <!-- Runtime UI tokens (same as app) -->
        <style>
            :root {
                --brand: {{ e(config('ui.brand_hsl')) }};
                --brand-foreground: {{ e(config('ui.brand_foreground_hsl')) }};
            }

            /* Hide scroll when modal open */
            .vh-no-scroll {
                overflow: hidden;
            }
        </style>

        {{-- Open Graph (WhatsApp/Facebook) --}}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="{{ $reference }}" />
        <meta property="og:description" content="{{ \Illuminate\Support\Str::limit(preg_replace('/\s+/', ' ', $text), 220) }}" />
        <meta property="og:url" content="{{ $canonical_url }}" />
        <meta property="og:image" content="{{ $og_image_url }}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {{-- Twitter --}}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="{{ $reference }}" />
        <meta name="twitter:description" content="{{ \Illuminate\Support\Str::limit(preg_replace('/\s+/', ' ', $text), 220) }}" />
        <meta name="twitter:image" content="{{ $og_image_url }}" />
    </head>

    <body class="min-h-screen bg-background text-foreground font-sans antialiased text-[15px] leading-[1.6] md:text-[16px]">
        {{-- Ambient background glow --}}
        <div aria-hidden class="pointer-events-none fixed inset-0">
            <div class="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"></div>
            <div class="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-400/5 blur-3xl"></div>
        </div>

        <main class="relative mx-auto max-w-3xl px-4 py-6 md:py-10">
            <div class="space-y-8">
                <header class="space-y-3">
                    <div class="flex items-center justify-between">
                        <button
                            id="vh-chip-back"
                            type="button"
                            data-fallback-href="/versehub/id"
                            class="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs text-muted-foreground shadow-soft ring-1 ring-black/5 transition hover:text-foreground dark:ring-white/10"
                        >
                            <span class="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden></span>
                            VerseHub
                        </button>
                        <div class="flex items-center gap-2">
                            <a href="/versehub/id" class="text-xs font-medium text-muted-foreground hover:text-foreground">Kembali ke Alkitab</a>

                            @php
                                // Try to convert current ref between ID<->EN for quick switch.
                                $refRaw = (string) ($ref ?? '');
                                $book = \Illuminate\Support\Str::before($refRaw, '-');
                                $rest = \Illuminate\Support\Str::after($refRaw, '-');
                                $mapToEn = [
                                    'kej' => 'gen',
                                    'kel' => 'exo',
                                    'mzm' => 'ps',
                                    'mat' => 'mat',
                                    'mrk' => 'mrk',
                                    'luk' => 'luk',
                                    'yoh' => 'jhn',
                                    'kis' => 'act',
                                    'rom' => 'rom',
                                    '1kor' => '1cor',
                                    '2kor' => '2cor',
                                    'ef' => 'eph',
                                    'flp' => 'phil',
                                    'kol' => 'col',
                                    'flm' => 'phlm',
                                ];
                                $mapToId = array_flip($mapToEn);
                                $refEn = ($mapToEn[$book] ?? $book).'-'.$rest;
                                $refId = ($mapToId[$book] ?? $book).'-'.$rest;
                                $langNow = (string) ($lang ?? 'id');
                            @endphp

                            @if($langNow === 'id')
                                <a href="/versehub/en/{{ $refEn }}" class="text-xs font-semibold text-brand">EN</a>
                            @else
                                <a href="/versehub/id/{{ $refId }}" class="text-xs font-semibold text-brand">ID</a>
                            @endif
                        </div>
                    </div>

                    <h1 class="tct-brand-gradient text-balance text-3xl font-semibold tracking-tight">
                        {{ $reference }}
                    </h1>
                </header>

                <section class="rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-black/5 dark:ring-white/10 backdrop-blur">
                    <div class="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
                        <img
                            src="{{ $og_image_url }}"
                            alt="OG image"
                            class="aspect-[1200/630] w-full cursor-zoom-in object-cover"
                            loading="lazy"
                            id="vh-og"
                        />
                    </div>
                </section>

                <section class="rounded-3xl bg-surface shadow-card ring-1 ring-black/5 dark:ring-white/10 backdrop-blur">
                    <div class="p-7">
                        @include('versehub.partials.verse-quote', ['text' => $text])

                        <div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span class="font-medium">{{ $provider ?? 'versehub' }}</span>
                            @if($translation_name)
                                <span class="opacity-40">•</span>
                                <span class="font-normal">{{ $translation_name }}</span>
                            @endif
                        </div>

                        {{-- Action bar: same behavior as DayShow (like/comment/share/bookmark), but styled for VerseHub. --}}
                        <div class="mt-6">
                            <div class="h-px bg-border/60" aria-hidden></div>
                            <div class="mt-4 flex items-center justify-between">
                                <div class="text-[12px] font-medium text-muted-foreground">
                                    {{-- Intentionally no "Reactions" text here --}}
                                </div>

                                <div class="flex items-center gap-2">
                                    <button
                                        id="vh-like"
                                        type="button"
                                        class="tct-pressable inline-flex h-10 items-center gap-2 rounded-full px-3 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                        aria-label="Like"
                                        aria-pressed="false"
                                    >
                                        <svg id="vh-like-icon" class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span id="vh-like-count" class="text-[12px] font-medium tabular-nums text-muted-foreground">124</span>
                                    </button>

                                    <button
                                        id="vh-comment"
                                        type="button"
                                        class="tct-pressable flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                        aria-label="Comment"
                                    >
                                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11v.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>

                                    <button
                                        id="vh-share"
                                        type="button"
                                        class="tct-pressable flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                        aria-label="Share"
                                    >
                                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M22 2 11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>

                                    <button
                                        id="vh-bookmark"
                                        type="button"
                                        class="tct-pressable inline-flex h-10 items-center gap-2 rounded-full px-3 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                        aria-label="Bookmark"
                                        aria-pressed="false"
                                    >
                                        <svg id="vh-bookmark-icon" class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span id="vh-bookmark-count" class="text-[12px] font-medium tabular-nums text-muted-foreground">37</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Comments bottom sheet -->
                <div id="vh-comment-modal" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true">
                    <button
                        id="vh-comment-backdrop"
                        type="button"
                        class="absolute inset-0 bg-black/50"
                        aria-label="Close"
                    ></button>
                    <div class="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-3xl bg-surface shadow-card">
                        <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
                            <div class="h-1.5 w-10 rounded-full bg-border/70" aria-hidden></div>
                            <p class="text-[13px] font-semibold">Comments</p>
                            <button
                                id="vh-comment-close"
                                type="button"
                                class="text-[13px] font-semibold text-muted-foreground"
                            >
                                Close
                            </button>
                        </div>

                        <div class="max-h-[52vh] overflow-auto px-4 py-3">
                            <div id="vh-comment-list" class="space-y-3"></div>
                        </div>

                        <div class="border-t border-border/60 px-4 py-3" style="padding-bottom: calc(12px + env(safe-area-inset-bottom));">
                            <div class="flex items-end gap-2">
                                <textarea
                                    id="vh-comment-text"
                                    rows="2"
                                    placeholder="Write a comment…"
                                    class="w-full resize-none rounded-2xl bg-surface-muted px-3 py-2 text-[14px] outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand dark:ring-white/10"
                                ></textarea>
                                <button
                                    id="vh-comment-send"
                                    type="button"
                                    class="tct-pressable flex h-10 w-10 items-center justify-center rounded-full bg-surface-dark text-brand"
                                    aria-label="Send"
                                >
                                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                        <path d="M22 2 11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- OG preview modal -->
                <div id="vh-og-modal" class="fixed inset-0 z-50 hidden">
                    <div class="absolute inset-0 bg-black/70 backdrop-blur" aria-hidden></div>
                    <div class="absolute inset-0 flex items-center justify-center p-6">
                        <button
                            type="button"
                            id="vh-og-close"
                            class="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-foreground ring-1 ring-black/5 backdrop-blur hover:bg-surface"
                            aria-label="Close preview"
                        >
                            <span class="text-lg leading-none">✕</span>
                        </button>
                        <img
                            id="vh-og-full"
                            src="{{ $og_image_url }}"
                            alt="OG full"
                            class="max-h-[90vh] w-full max-w-5xl rounded-2xl object-contain ring-1 ring-white/10"
                            loading="lazy"
                        />
                    </div>
                </div>

                <footer class="text-center text-xs text-muted-foreground">
                    • thechoosentalks.org •
                </footer>
            </div>
        </main>

        <script>
            (function () {
                const canonicalUrl = @json($canonical_url);
                const title = @json($reference);
                const verseLang = @json($lang);
                const verseRef = @json($ref);
                const isAuthed = @json(auth()->check());
                const requireMember = () => {
                    if (isAuthed) return true;
                    window.location.assign('/');
                    return false;
                };

                const likeBtn = document.getElementById('vh-like');
                const likeIcon = document.getElementById('vh-like-icon');
                const likeCount = document.getElementById('vh-like-count');
                const bookmarkBtn = document.getElementById('vh-bookmark');
                const bookmarkIcon = document.getElementById('vh-bookmark-icon');
                const bookmarkCount = document.getElementById('vh-bookmark-count');
                const shareBtn = document.getElementById('vh-share');
                const commentBtn = document.getElementById('vh-comment');
                const chipBackBtn = document.getElementById('vh-chip-back');

                const commentModal = document.getElementById('vh-comment-modal');
                const commentBackdrop = document.getElementById('vh-comment-backdrop');
                const commentClose = document.getElementById('vh-comment-close');
                const commentListEl = document.getElementById('vh-comment-list');
                const commentTextEl = document.getElementById('vh-comment-text');
                const commentSendEl = document.getElementById('vh-comment-send');

                const ogThumb = document.getElementById('vh-og');
                const ogModal = document.getElementById('vh-og-modal');
                const ogClose = document.getElementById('vh-og-close');
                const ogFull = document.getElementById('vh-og-full');

                chipBackBtn?.addEventListener('click', () => {
                    const fallback = chipBackBtn.getAttribute('data-fallback-href') || '/versehub/id';
                    if (window.history.length > 1) {
                        window.history.back();
                        return;
                    }
                    window.location.assign(fallback);
                });

                // Local-only optimistic reactions (feels real, can be synced later)
                const reactionKey = `tct:versehub:reactions:${canonicalUrl}`;

                const loadReactions = () => {
                    try {
                        const raw = window.localStorage.getItem(reactionKey);
                        const parsed = raw ? JSON.parse(raw) : null;
                        return parsed && typeof parsed === 'object' ? parsed : null;
                    } catch {
                        return null;
                    }
                };

                const saveReactions = (next) => {
                    try {
                        window.localStorage.setItem(
                            reactionKey,
                            JSON.stringify({ ...next, updated_at: new Date().toISOString() }),
                        );
                    } catch {
                        // ignore
                    }
                };

                const initialLikeBase = Number((likeCount?.textContent || '124').replace(/[^0-9]/g, '') || '124');
                const initialBookmarkBase = Number((bookmarkCount?.textContent || '37').replace(/[^0-9]/g, '') || '37');

                const stored = loadReactions();
                let liked = Boolean(stored?.liked);
                let bookmarked = Boolean(stored?.bookmarked);
                let likeBase = Number(stored?.like_base ?? initialLikeBase);
                let bookmarkBase = Number(stored?.bookmark_base ?? initialBookmarkBase);

                const renderCounts = () => {
                    if (likeCount) likeCount.textContent = liked ? `You + ${likeBase}` : String(likeBase);
                    if (bookmarkCount) bookmarkCount.textContent = bookmarked ? `You + ${bookmarkBase}` : String(bookmarkBase);
                };

                // Initial render from stored state (if any)
                renderCounts();
                likeBtn?.classList.toggle('text-brand', liked);
                likeBtn?.setAttribute('aria-pressed', liked ? 'true' : 'false');
                if (likeIcon) likeIcon.setAttribute('fill', liked ? 'currentColor' : 'none');

                bookmarkBtn?.classList.toggle('text-brand', bookmarked);
                bookmarkBtn?.setAttribute('aria-pressed', bookmarked ? 'true' : 'false');
                if (bookmarkIcon) bookmarkIcon.setAttribute('fill', bookmarked ? 'currentColor' : 'none');

                // Persist bases even if user hasn't interacted yet
                saveReactions({ liked, bookmarked, like_base: likeBase, bookmark_base: bookmarkBase });

                likeBtn?.addEventListener('click', () => {
                    if (!requireMember()) return;
                    liked = !liked;
                    renderCounts();
                    likeBtn.classList.toggle('text-brand', liked);
                    likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
                    if (likeIcon) likeIcon.setAttribute('fill', liked ? 'currentColor' : 'none');
                    saveReactions({ liked, bookmarked, like_base: likeBase, bookmark_base: bookmarkBase });
                });

                bookmarkBtn?.addEventListener('click', () => {
                    if (!requireMember()) return;
                    bookmarked = !bookmarked;
                    bookmarkBtn.classList.toggle('text-brand', bookmarked);
                    bookmarkBtn.setAttribute('aria-pressed', bookmarked ? 'true' : 'false');
                    if (bookmarkIcon) bookmarkIcon.setAttribute('fill', bookmarked ? 'currentColor' : 'none');
                    renderCounts();
                    saveReactions({ liked, bookmarked, like_base: likeBase, bookmark_base: bookmarkBase });
                });

                // Comments (server-backed): every member can comment and reply.
                let comments = [];
                let replyTo = null;
                const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const commentsUrl = `/versehub/${encodeURIComponent(String(verseLang))}/${encodeURIComponent(String(verseRef))}/comments`;

                const renderComments = () => {
                    if (!commentListEl) return;
                    commentListEl.innerHTML = '';
                    const nodeMap = new Map();
                    const roots = [];
                    comments.forEach((c) => {
                        nodeMap.set(String(c.id), { comment: c, children: [] });
                    });
                    comments.forEach((c) => {
                        const node = nodeMap.get(String(c.id));
                        const parentId = c.reply_to_id == null ? null : String(c.reply_to_id);
                        if (!parentId) {
                            roots.push(node);
                            return;
                        }
                        const parent = nodeMap.get(parentId);
                        if (!parent) {
                            roots.push(node);
                            return;
                        }
                        parent.children.push(node);
                    });

                    const renderNode = (node, depth = 0) => {
                        const c = node.comment;
                        const row = document.createElement('div');
                        row.className = `flex gap-3 ${depth > 0 ? 'ml-3 border-l border-border/70 pl-3' : ''}`;

                        const avatar = document.createElement('div');
                        avatar.className = 'flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-muted text-[12px] font-semibold';
                        avatar.textContent = (c.author || '?').slice(0, 1).toUpperCase();

                        const body = document.createElement('div');
                        body.className = 'min-w-0 flex-1';

                        const head = document.createElement('div');
                        head.className = 'flex items-baseline gap-2';

                        const name = document.createElement('p');
                        name.className = 'text-[13px] font-semibold';
                        name.textContent = c.author;

                        const time = document.createElement('p');
                        time.className = 'text-[12px] text-muted-foreground';
                        time.textContent = c.created_at || '';

                        const text = document.createElement('p');
                        text.className = 'mt-1 text-[14px] leading-6';
                        text.textContent = c.body;

                        if (c.reply_to_author && depth > 0) {
                            const replyMeta = document.createElement('p');
                            replyMeta.className = 'mt-1 text-[12px] text-muted-foreground';
                            replyMeta.textContent = `Reply to ${c.reply_to_author}`;
                            body.appendChild(replyMeta);
                        }

                        const replyBtn = document.createElement('button');
                        replyBtn.type = 'button';
                        replyBtn.className = 'mt-1 text-[12px] font-medium text-brand';
                        replyBtn.textContent = 'Reply';
                        replyBtn.addEventListener('click', () => {
                            replyTo = { id: c.id, author: c.author };
                            if (commentTextEl && 'placeholder' in commentTextEl) {
                                commentTextEl.placeholder = `Reply to ${c.author}...`;
                            }
                            if (commentTextEl && 'focus' in commentTextEl) commentTextEl.focus();
                        });

                        head.appendChild(name);
                        head.appendChild(time);
                        body.appendChild(head);
                        body.appendChild(text);
                        body.appendChild(replyBtn);

                        if (node.children.length) {
                            const childWrap = document.createElement('div');
                            childWrap.className = 'mt-2 space-y-2';
                            node.children.forEach((child) => {
                                childWrap.appendChild(renderNode(child, depth + 1));
                            });
                            body.appendChild(childWrap);
                        }

                        row.appendChild(avatar);
                        row.appendChild(body);
                        return row;
                    };

                    roots.forEach((root) => commentListEl.appendChild(renderNode(root)));
                };

                const loadComments = async () => {
                    try {
                        const res = await fetch(commentsUrl, {
                            method: 'GET',
                            headers: { Accept: 'application/json' },
                            credentials: 'same-origin',
                        });
                        if (!res.ok) {
                            comments = [];
                            renderComments();
                            return;
                        }
                        const json = await res.json();
                        comments = Array.isArray(json?.comments) ? json.comments : [];
                        renderComments();
                    } catch {
                        comments = [];
                        renderComments();
                    }
                };

                const openComments = () => {
                    if (!requireMember()) return;
                    if (!commentModal) return;
                    loadComments();
                    commentModal.classList.remove('hidden');
                    document.documentElement.classList.add('vh-no-scroll');
                };

                const closeComments = () => {
                    if (!commentModal) return;
                    commentModal.classList.add('hidden');
                    document.documentElement.classList.remove('vh-no-scroll');
                    replyTo = null;
                    if (commentTextEl && 'placeholder' in commentTextEl) {
                        commentTextEl.placeholder = 'Write a comment…';
                    }
                };

                commentBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    openComments();
                });

                // Support direct deep-link from Community card action bar.
                if (window.location.hash === '#comments') {
                    openComments();
                }

                commentBackdrop?.addEventListener('click', closeComments);
                commentClose?.addEventListener('click', closeComments);

                commentSendEl?.addEventListener('click', async () => {
                    if (!requireMember()) return;
                    const raw = commentTextEl && 'value' in commentTextEl ? String(commentTextEl.value || '') : '';
                    const text = raw.trim();
                    if (!text) return;
                    try {
                        const res = await fetch(commentsUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrf,
                                Accept: 'application/json',
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                body: text,
                                reply_to_id: replyTo?.id ?? null,
                            }),
                        });
                        if (!res.ok) return;
                        const json = await res.json();
                        if (json?.comment) {
                            comments = [json.comment, ...comments];
                            renderComments();
                        }
                        if (commentTextEl && 'value' in commentTextEl) commentTextEl.value = '';
                        replyTo = null;
                        if (commentTextEl && 'placeholder' in commentTextEl) {
                            commentTextEl.placeholder = 'Write a comment…';
                        }
                    } catch {
                        // ignore
                    }
                });

                const toast = (msg) => {
                    try {
                        const el = document.createElement('div');
                        el.textContent = msg;
                        el.className =
                            'fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur';
                        document.body.appendChild(el);
                        setTimeout(() => el.remove(), 1600);
                    } catch {
                        // ignore
                    }
                };

                const isLikelyIOS = () => {
                    const ua = navigator.userAgent || '';
                    return /iP(hone|od|ad)/.test(ua);
                };

                const openShareUrl = (url) => {
                    // iOS Safari / in-app browsers often block window.open from menu clicks.
                    // Prefer a direct navigation for better reliability.
                    if (isLikelyIOS()) {
                        window.location.assign(url);
                        return;
                    }
                    window.open(url, '_blank', 'noopener,noreferrer');
                };

                const trySystemShare = async () => {
                    if (!navigator.share) return false;
                    await navigator.share({ title: `${title} • VerseHub`, url: canonicalUrl });
                    return true;
                };

                const copyLink = async () => {
                    // Clipboard API requires secure context (https). Provide a fallback.
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(canonicalUrl);
                        return;
                    }

                    const ta = document.createElement('textarea');
                    ta.value = canonicalUrl;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                };

                // Share behavior (match SabbathSchool DayShow):
                // - Prefer native share if available
                // - Otherwise open WhatsApp share as a good mobile fallback
                // - Last resort: copy link
                shareBtn?.addEventListener('click', async (e) => {
                    e.preventDefault();
                    if (!requireMember()) return;
                    try {
                        const ok = await trySystemShare();
                        if (ok) return;

                        // Mobile-friendly fallback: WhatsApp
                        openShareUrl(`https://wa.me/?text=${encodeURIComponent(title + ' ' + canonicalUrl)}`);
                    } catch {
                        try {
                            await copyLink();
                            toast('Link copied');
                        } catch {
                            // ignore
                        }
                    }
                });

                const openOgModal = () => {
                    if (!ogModal) return;
                    ogModal.classList.remove('hidden');
                    document.documentElement.classList.add('vh-no-scroll');
                };

                const closeOgModal = () => {
                    if (!ogModal) return;
                    ogModal.classList.add('hidden');
                    document.documentElement.classList.remove('vh-no-scroll');
                };

                ogThumb?.addEventListener('click', openOgModal);
                ogClose?.addEventListener('click', closeOgModal);
                ogModal?.addEventListener('click', (e) => {
                    // Close when clicking backdrop, not the image itself
                    if (e.target === ogModal) closeOgModal();
                });
            })();
        </script>
    </body>
</html>

import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PageProps } from '@/types';
import DesktopSidebarNav from '@/Components/core/DesktopSidebarNav';
import FloatingBottomNav from '@/Components/core/FloatingBottomNav';
import MentorPanel from '@/Components/versehub/MentorPanel';
import SharePanel from '@/Components/versehub/SharePanel';
import EndOfChapterPrompt from '@/Components/versehub/EndOfChapterPrompt';
import ReflectionComposer from '@/Components/versehub/ReflectionComposer';
import { getUiNavItems } from '@/lib/ui-nav';
import { uiRoutes, type UiNavId } from '@/lib/ui-routes';
import {
    ArrowRight,
    ArrowRightCircle,
    Bookmark,
    Library,
    Compass,
    Heart,
    Highlighter,
    MessageSquareQuote,
    StickyNote,
    Play,
    RefreshCw,
    Scroll,
    Search,
    SendHorizontal,
    Wand2,
    History,
    Network,
    Zap,
    CircleCheckBig,
    X,
} from 'lucide-react';

type Book = {
    code: string;
    label: string;
    testament: 'ot' | 'nt';
};

type Verse = {
    verse: number;
    text: string;
    href: string;
    key: string;
};

type SearchMeta = {
    type: string;
    verses: number[];
} | null;

type CrossPanel = {
    title: string;
    verses: Verse[];
    range_text?: string;
};

type SuggestItem = {
    label?: string;
    value?: string;
    href?: string;
};

type ToastState = {
    message: string;
    ctaHref?: string;
    ctaLabel?: string;
};

type LandingPersona = 'new_believer' | 'returning_reader';
type LandingVariant = 'a' | 'b';

type ReaderProps = PageProps<{
    lang: 'id' | 'en';
    canonical_url: string;
    books: Book[];
    selected_book: string | null;
    selected_chapter: number | null;
    chapters: number[];
    chapter_label: string | null;
    verses: Verse[];
    prev_url: string | null;
    next_url: string | null;
    search_query: string;
    search_error: string | null;
    search_meta: SearchMeta;
    search_recommendations: Array<{ href?: string; label?: string }>;
    cross_panels: CrossPanel[];
    reflection_question: string;
    has_reflected: boolean;
    mentor_insights?: {
        theme_connections?: string[];
        historical_context?: string | null;
        relationships?: Array<{ ref: string; type: string; direction: string }>;
        themes?: Array<{ slug: string; name_id: string; name_en: string }>;
        suggested_paths?: Array<{ slug: string; title: string; description?: string }>;
    };
    og_image_url?: string | null;
}>;

type VerseState = {
    bookmarked: boolean;
    favorite: boolean;
    highlighted: boolean;
    highlightColor: 'yellow' | 'green' | 'blue';
    note: string;
};

type VerseComment = {
    id: number | string;
    author: string;
    body: string;
    created_at?: string | null;
    reply_to_id?: number | string | null;
    reply_to_author?: string | null;
};

const ACTION_KEY = 'versehub_actions_v2';
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function defaultState(): VerseState {
    return {
        bookmarked: false,
        favorite: false,
        highlighted: false,
        highlightColor: 'yellow',
        note: '',
    };
}

function parseVerseKey(verseKey: string) {
    const m = verseKey.match(/^([a-z0-9]+)-(\d+)-(\d+)$/i);
    if (!m) return null;
    return {
        book: String(m[1]).toLowerCase(),
        chapter: Number(m[2]),
        verse: Number(m[3]),
    };
}

function getHighlightClass(state: VerseState) {
    if (!state.highlighted) return '';
    if (state.highlightColor === 'green') return 'bg-emerald-50';
    if (state.highlightColor === 'blue') return 'bg-sky-50';
    return 'bg-amber-50';
}

export default function Reader() {
    const page = usePage<ReaderProps>();
    const {
        auth,
        lang,
        canonical_url,
        books,
        selected_book,
        selected_chapter,
        chapter_label,
        verses,
        prev_url,
        next_url,
        search_query,
        search_error,
        search_meta,
        search_recommendations,
        cross_panels,
        reflection_question,
        has_reflected,
        mentor_insights: initialMentorInsights,
    } = page.props;
    const isAuthenticated = Boolean(auth?.user);
    const defaultHomeHref = isAuthenticated ? '/today' : '/channels';
    const navItems = useMemo(() => getUiNavItems(isAuthenticated), [isAuthenticated]);

    const isChapter = Boolean(chapter_label);
    const [query, setQuery] = useState(search_query || '');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [tab, setTab] = useState<'ot' | 'nt'>(() => {
        const selected = books.find((b) => b.code === selected_book);
        return selected?.testament === 'nt' ? 'nt' : 'ot';
    });
    const [activeBook, setActiveBook] = useState<string | null>(selected_book || null);
    const [bookChapters, setBookChapters] = useState<number[]>(Array.isArray(page.props.chapters) ? page.props.chapters : []);
    const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
    const [actions, setActions] = useState<Record<string, VerseState>>({});
    const [toolsOpen, setToolsOpen] = useState(false);
    const [progressVerse, setProgressVerse] = useState(1);
    const [scrollProgressPercent, setScrollProgressPercent] = useState(0);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestIndex, setSuggestIndex] = useState(-1);
    const [readingMode, setReadingMode] = useState<'normal' | 'focus' | 'dark'>('normal');
    const [textSize, setTextSize] = useState<0 | 1 | 2>(1);
    const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
    const [noteDraft, setNoteDraft] = useState('');
    const [journeySummaryReady, setJourneySummaryReady] = useState(false);
    const [journeyTotalSaved, setJourneyTotalSaved] = useState(0);
    const [mentorInsights, setMentorInsights] = useState(initialMentorInsights || null);
    const [mentorLoading, setMentorLoading] = useState(false);
    const [mentorOpen, setMentorOpen] = useState(false);
    const [advancedToolsOpen, setAdvancedToolsOpen] = useState(false);
    const [shortcutHintOpen, setShortcutHintOpen] = useState(false);
    const [landingReady, setLandingReady] = useState(isChapter);
    const [continueHref, setContinueHref] = useState(defaultHomeHref);
    const [continueTitle, setContinueTitle] = useState('Lanjutkan ritme bacamu');
    const [continueMeta, setContinueMeta] = useState('Buka checkpoint ayat harian yang terakhir dibaca.');
    const [landingPersona, setLandingPersona] = useState<LandingPersona>('new_believer');
    const [landingVariant, setLandingVariant] = useState<LandingVariant>('a');
    const [landingSessionId, setLandingSessionId] = useState('');
    const [lastReadChip, setLastReadChip] = useState<{ label: string; relative: string } | null>(null);

    // Reflections logic
    const [reflectionComposerOpen, setReflectionComposerOpen] = useState(false);
    const [activeReflectionQuestion, setActiveReflectionQuestion] = useState(reflection_question || '');
    const [shareOpen, setShareOpen] = useState(false);
    const [verseCommentsOpen, setVerseCommentsOpen] = useState(false);
    const [verseCommentsLoading, setVerseCommentsLoading] = useState(false);
    const [verseComments, setVerseComments] = useState<VerseComment[]>([]);
    const [verseCommentDraft, setVerseCommentDraft] = useState('');
    const [guestCommentName, setGuestCommentName] = useState('');
    const [shareData, setShareData] = useState<{ title: string; subtitle?: string; url: string; ogImageUrl: string }>({
        title: '',
        url: '',
        ogImageUrl: '',
    });
    const searchWrapRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const pickerPanelRef = useRef<HTMLDivElement | null>(null);
    const toolsMobilePanelRef = useRef<HTMLDivElement | null>(null);
    const toolsDesktopPanelRef = useRef<HTMLElement | null>(null);
    const noteDrawerRef = useRef<HTMLElement | null>(null);
    const lastFocusRef = useRef<HTMLElement | null>(null);
    const longPressTimerRef = useRef<number | null>(null);
    const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
    const suppressClickRef = useRef(false);
    const touchIntentRef = useRef<{ moved: boolean; startScrollY: number }>({
        moved: false,
        startScrollY: 0,
    });
    const trackedLandingViewRef = useRef<string>('');

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const readingModeKey = `vh_reading_mode:${String(auth?.user?.id || 'guest')}:${String(lang || 'id')}`;
    const textSizeKey = `vh_text_size:${String(auth?.user?.id || 'guest')}:${String(lang || 'id')}`;
    const confettiOnceKey = `vh_confetti_first_save:${String(auth?.user?.id || 'guest')}:${String(lang || 'id')}`;
    const lastReadKey = `vh_last_read:${String(auth?.user?.id || 'guest')}:${String(lang || 'id')}`;
    const landingSessionKey = `vh_landing_sid:${String(auth?.user?.id || 'guest')}:${String(lang || 'id')}`;
    const landingFirstTouchKey = `vh_landing_first_touch:${String(auth?.user?.id || 'guest')}:${String(lang || 'id')}`;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const byTab = useMemo(() => books.filter((b) => b.testament === tab), [books, tab]);
    const selectedVerse = useMemo(() => verses.find((v) => v.key === activeVerseKey) || null, [verses, activeVerseKey]);
    const progressTotal = Math.max(1, verses.length);
    const bookLabelByCode = useMemo(
        () =>
            books.reduce<Record<string, string>>((acc, item) => {
                acc[item.code] = item.label;
                return acc;
            }, {}),
        [books],
    );

    useEffect(() => {
        try {
            const raw = localStorage.getItem(ACTION_KEY);
            if (raw) setActions(JSON.parse(raw));
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(ACTION_KEY, JSON.stringify(actions));
        } catch {
            // ignore
        }
    }, [actions]);

    useEffect(() => {
        try {
            const mode = localStorage.getItem(readingModeKey);
            if (mode === 'focus' || mode === 'dark' || mode === 'normal') {
                setReadingMode(mode);
            }
        } catch {
            // ignore
        }
        try {
            const raw = localStorage.getItem(textSizeKey);
            const parsed = Number(raw);
            if (parsed === 0 || parsed === 1 || parsed === 2) {
                setTextSize(parsed as 0 | 1 | 2);
            }
        } catch {
            // ignore
        }
    }, [readingModeKey, textSizeKey]);

    useEffect(() => {
        try {
            localStorage.setItem(readingModeKey, readingMode);
        } catch {
            // ignore
        }
    }, [readingMode, readingModeKey]);

    useEffect(() => {
        try {
            localStorage.setItem(textSizeKey, String(textSize));
        } catch {
            // ignore
        }
    }, [textSize, textSizeKey]);

    useEffect(() => {
        if (isAuthenticated) return;
        try {
            const saved = localStorage.getItem('vh_guest_comment_name') || '';
            setGuestCommentName(saved);
        } catch {
            // ignore
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) return;
        try {
            localStorage.setItem('vh_guest_comment_name', guestCommentName);
        } catch {
            // ignore
        }
    }, [guestCommentName, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setJourneySummaryReady(true);
            return;
        }
        fetch(`/versehub/${encodeURIComponent(lang)}/reader-actions/summary?limit=120&sort=recent`, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
                const counts = json?.counts && typeof json.counts === 'object' ? json.counts : {};
                const total = Number(counts?.favorites || 0) + Number(counts?.bookmarks || 0) + Number(counts?.notes || 0);
                setJourneyTotalSaved(total);
                setJourneySummaryReady(true);
            })
            .catch(() => {
                setJourneySummaryReady(true);
            });
    }, [isAuthenticated, lang]);

    useEffect(() => {
        if (isChapter) {
            setLandingReady(true);
            return;
        }
        setLandingReady(false);
        const tid = window.setTimeout(() => setLandingReady(true), 260);
        return () => window.clearTimeout(tid);
    }, [isChapter]);

    useEffect(() => {
        if (isChapter) return;
        let sid = '';
        try {
            sid = String(localStorage.getItem(landingSessionKey) || '');
            if (!sid) {
                sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
                localStorage.setItem(landingSessionKey, sid);
            }
        } catch {
            sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        }
        const hash = sid.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        setLandingSessionId(sid);
        setLandingVariant(hash % 2 === 0 ? 'a' : 'b');
    }, [isChapter, landingSessionKey]);

    useEffect(() => {
        if (!selected_book || !selected_chapter) return;
        try {
            localStorage.setItem(
                lastReadKey,
                JSON.stringify({
                    book: selected_book,
                    chapter: selected_chapter,
                    ts: Date.now(),
                }),
            );
        } catch {
            // ignore
        }
    }, [lastReadKey, selected_book, selected_chapter]);

    useEffect(() => {
        if (isChapter) return;
        let fallbackHref = defaultHomeHref;
        let fallbackTitle = 'Lanjutkan ritme bacamu';
        let hasLastRead = false;
        let nextLastReadChip: { label: string; relative: string } | null = null;
        const fallbackMeta = journeySummaryReady
            ? journeyTotalSaved > 0
                ? `Kamu sudah menyimpan ${journeyTotalSaved} momen. Lanjutkan dari tempat terakhir.`
                : 'Buka bacaan ayat harian pada checkpoint terakhir dibaca.'
            : 'Menyusun progres bacaan terakhir...';
        try {
            const raw = localStorage.getItem(lastReadKey);
            if (raw) {
                const parsed = JSON.parse(raw) as { book?: string; chapter?: number; ts?: number };
                const book = String(parsed?.book || '').toLowerCase();
                const chapter = Number(parsed?.chapter || 0);
                if (book && Number.isFinite(chapter) && chapter > 0) {
                    hasLastRead = true;
                    const label = bookLabelByCode[book] || book.toUpperCase();
                    fallbackHref = `/versehub/id/${encodeURIComponent(book)}-${encodeURIComponent(String(chapter))}`;
                    fallbackTitle = `Lanjutkan ${label} ${chapter}`;
                    const ts = Number(parsed?.ts || 0);
                    const relative = (() => {
                        if (!Number.isFinite(ts) || ts <= 0) return 'baru saja';
                        const diffMin = Math.max(1, Math.round((Date.now() - ts) / 60000));
                        if (diffMin < 60) return `${diffMin} menit lalu`;
                        const diffHour = Math.round(diffMin / 60);
                        if (diffHour < 24) return `${diffHour} jam lalu`;
                        return `${Math.round(diffHour / 24)} hari lalu`;
                    })();
                    nextLastReadChip = { label: `${label} ${chapter}`, relative };
                }
            }
        } catch {
            // ignore
        }
        setContinueHref(fallbackHref);
        setContinueTitle(fallbackTitle);
        setContinueMeta(fallbackMeta);
        setLandingPersona(hasLastRead || journeyTotalSaved > 0 ? 'returning_reader' : 'new_believer');
        setLastReadChip(nextLastReadChip);
    }, [bookLabelByCode, isChapter, journeySummaryReady, journeyTotalSaved, lastReadKey]);

    useEffect(() => {
        if (isChapter || !landingReady || !landingSessionId) return;
        const key = `${landingSessionId}:${landingPersona}:${landingVariant}`;
        if (trackedLandingViewRef.current === key) return;
        trackedLandingViewRef.current = key;
        trackLandingEvent('landing_view', {
            saved_total: journeyTotalSaved,
            continue_href: continueHref,
        });
    }, [continueHref, isChapter, journeyTotalSaved, landingPersona, landingReady, landingSessionId, landingVariant]);

    useEffect(() => {
        if (!isChapter) return;
        const focusFromHash = () => {
            const m = String(window.location.hash || '').match(/^#v(\d+)$/i);
            if (!m) return;
            const verseNo = Number(m[1]);
            if (!Number.isFinite(verseNo) || verseNo < 1) return;
            const el = document.getElementById(`vh-v-${verseNo}`);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.remove('vh-transient-focus');
            void el.clientHeight;
            el.classList.add('vh-transient-focus');
            window.setTimeout(() => el.classList.remove('vh-transient-focus'), 1600);
        };
        focusFromHash();
        window.addEventListener('hashchange', focusFromHash);
        return () => window.removeEventListener('hashchange', focusFromHash);
    }, [isChapter, verses]);

    useEffect(() => {
        if (!auth?.user || !selected_book || !selected_chapter) return;
        const url = `/versehub/${encodeURIComponent(lang)}/reader-actions?book=${encodeURIComponent(selected_book)}&chapter=${encodeURIComponent(String(selected_chapter))}`;
        fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
                if (!json?.actions || typeof json.actions !== 'object') return;
                const merged: Record<string, VerseState> = {};
                Object.entries(json.actions as Record<string, any>).forEach(([key, val]) => {
                    merged[key] = {
                        bookmarked: Boolean(val?.bookmarked),
                        favorite: Boolean(val?.favorite),
                        highlighted: Boolean(val?.highlighted),
                        highlightColor: (['yellow', 'green', 'blue'].includes(String(val?.highlightColor))
                            ? String(val?.highlightColor)
                            : 'yellow') as 'yellow' | 'green' | 'blue',
                        note: String(val?.note || ''),
                    };
                });
                setActions((prev) => ({ ...prev, ...merged }));
            })
            .catch(() => undefined);
    }, [auth?.user, lang, selected_book, selected_chapter]);

    useEffect(() => {
        if (!activeBook) return;
        fetch(`/versehub/id/chapters?book=${encodeURIComponent(activeBook)}`, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
                const ch = Array.isArray(json?.chapters) ? json.chapters.map((x: unknown) => Number(x)).filter((n: number) => Number.isFinite(n) && n > 0) : [];
                setBookChapters(ch);
            })
            .catch(() => setBookChapters([]));
    }, [activeBook]);

    useEffect(() => {
        if (activeBook && books.some((b) => b.code === activeBook)) return;
        const first = byTab[0];
        if (first?.code) setActiveBook(first.code);
    }, [activeBook, byTab, books]);

    useEffect(() => {
        if (!isChapter || verses.length === 0) return;
        const onScroll = () => {
            const doc = document.documentElement;
            const maxScrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
            const percent = Math.round(clamp(window.scrollY / maxScrollable, 0, 1) * 100);

            const centerY = window.innerHeight * 0.36;
            let best = 1;
            let bestDist = Number.POSITIVE_INFINITY;
            verses.forEach((v) => {
                const el = document.getElementById(`vh-v-${v.verse}`);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                if (rect.bottom < 64 || rect.top > window.innerHeight) return;
                const dist = Math.abs((rect.top + rect.bottom) / 2 - centerY);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = v.verse;
                }
            });
            setProgressVerse(best);
            setScrollProgressPercent((prev) => (prev === percent ? prev : percent));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [isChapter, verses]);

    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                window.clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const id = window.setTimeout(() => setToast(null), toast.ctaHref ? 2800 : 1700);
        return () => window.clearTimeout(id);
    }, [toast]);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 1) {
            setSuggestions([]);
            setSuggestOpen(false);
            setSuggestIndex(-1);
            return;
        }
        const tid = window.setTimeout(() => {
            fetch(`/versehub/${encodeURIComponent(lang)}/suggest?q=${encodeURIComponent(q)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            })
                .then((r) => (r.ok ? r.json() : null))
                .then((json) => {
                    const items = Array.isArray(json?.rich_items) ? (json.rich_items as SuggestItem[]) : [];
                    setSuggestions(items);
                    setSuggestOpen(items.length > 0);
                    setSuggestIndex(items.length > 0 ? 0 : -1);
                })
                .catch(() => {
                    setSuggestions([]);
                    setSuggestOpen(false);
                    setSuggestIndex(-1);
                });
        }, 180);
        return () => window.clearTimeout(tid);
    }, [lang, query]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!searchWrapRef.current || (target && searchWrapRef.current.contains(target))) return;
            setSuggestOpen(false);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    useEffect(() => {
        const isOverlayOpen = pickerOpen || toolsOpen || noteDrawerOpen;
        if (!isOverlayOpen) {
            if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
                lastFocusRef.current.focus();
            }
            return;
        }

        lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const activePanel = pickerOpen
            ? pickerPanelRef.current
            : noteDrawerOpen
                ? noteDrawerRef.current
                : ((window.matchMedia('(min-width: 640px)').matches
                    ? toolsDesktopPanelRef.current
                    : toolsMobilePanelRef.current) || toolsMobilePanelRef.current || toolsDesktopPanelRef.current);

        const getFocusable = () => {
            if (!activePanel) return [] as HTMLElement[];
            return Array.from(
                activePanel.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
            ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
        };

        window.setTimeout(() => {
            const focusables = getFocusable();
            if (focusables.length > 0) {
                focusables[0].focus();
                return;
            }
            activePanel?.focus();
        }, 0);

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (pickerOpen) setPickerOpen(false);
                if (toolsOpen) setToolsOpen(false);
                if (noteDrawerOpen) setNoteDrawerOpen(false);
                return;
            }
            if (e.key !== 'Tab') return;
            const focusables = getFocusable();
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey) {
                if (!active || active === first || !focusables.includes(active)) {
                    e.preventDefault();
                    last.focus();
                }
                return;
            }
            if (!active || active === last || !focusables.includes(active)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [pickerOpen, toolsOpen, noteDrawerOpen]);

    function handleBack() {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        window.location.assign('/versehub/id');
    }

    function submitSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSuggestOpen(false);
        setSuggestIndex(-1);
        if (!isChapter) {
            trackLandingEvent('search_submit', {
                q_len: query.trim().length,
                has_colon: query.includes(':'),
            });
        }
        router.get(`/versehub/${lang}`, { q: query }, { preserveScroll: true, preserveState: false });
    }

    function onPickSuggestion(item: SuggestItem) {
        setSuggestOpen(false);
        setSuggestIndex(-1);
        pulseHaptic('light');
        if (item.href) {
            window.location.assign(item.href);
            return;
        }
        const nextQuery = String(item.value || item.label || '').trim();
        if (!nextQuery) return;
        setQuery(nextQuery);
        router.get(`/versehub/${lang}`, { q: nextQuery }, { preserveScroll: true, preserveState: false });
    }

    function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!suggestOpen || suggestions.length === 0) {
            if (e.key === 'Escape') {
                setSuggestOpen(false);
                setSuggestIndex(-1);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSuggestIndex((prev) => {
                if (prev < 0) return 0;
                return (prev + 1) % suggestions.length;
            });
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSuggestIndex((prev) => {
                if (prev < 0) return suggestions.length - 1;
                return (prev - 1 + suggestions.length) % suggestions.length;
            });
            return;
        }
        if (e.key === 'Enter' && suggestIndex >= 0 && suggestIndex < suggestions.length) {
            e.preventDefault();
            onPickSuggestion(suggestions[suggestIndex]);
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            setSuggestOpen(false);
            setSuggestIndex(-1);
        }
    }

    function stateFor(key: string) {
        return actions[key] || defaultState();
    }

    function showToast(message: string, opts: { ctaHref?: string; ctaLabel?: string } = {}) {
        setToast({
            message,
            ctaHref: opts.ctaHref,
            ctaLabel: opts.ctaLabel,
        });
    }

    function requireMember(): boolean {
        return true;
    }

    function pulseHaptic(mode: 'light' | 'strong' = 'light') {
        if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
        try {
            navigator.vibrate(mode === 'strong' ? [18, 12, 22] : 12);
        } catch {
            // ignore
        }
    }

    function trackLandingEvent(eventName: string, meta: Record<string, unknown> = {}) {
        if (isChapter || !landingSessionId) return;
        const nowIso = new Date().toISOString();
        let firstTouchAt = '';
        let firstSession = false;
        try {
            firstTouchAt = String(localStorage.getItem(landingFirstTouchKey) || '');
            if (!firstTouchAt) {
                firstTouchAt = nowIso;
                firstSession = true;
                localStorage.setItem(landingFirstTouchKey, firstTouchAt);
            }
        } catch {
            firstSession = false;
        }

        const payload = {
            session_id: landingSessionId,
            persona: landingPersona,
            variant: landingVariant,
            event_name: eventName,
            occurred_at: nowIso,
            meta: {
                first_session: firstSession,
                first_touch_at: firstTouchAt || null,
                path: typeof window !== 'undefined' ? window.location.pathname : '/versehub/id',
                ...meta,
            },
        };

        const url = `/versehub/${encodeURIComponent(lang)}/landing-events`;
        try {
            void fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
        } catch {
            // ignore
        }
    }

    function runFirstSaveConfetti(sourceEl?: HTMLElement | null) {
        if (!isAuthenticated || prefersReducedMotion) return;
        if (!journeySummaryReady || journeyTotalSaved > 0) return;
        try {
            if (localStorage.getItem(confettiOnceKey) === '1') return;
        } catch {
            return;
        }

        const host = document.createElement('div');
        host.className = 'pointer-events-none fixed inset-0 z-[85]';
        const cloud = document.createElement('div');
        cloud.className = 'absolute h-16 w-44';
        const rect = sourceEl?.getBoundingClientRect?.();
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
        window.setTimeout(() => host.remove(), 1200);
        try {
            localStorage.setItem(confettiOnceKey, '1');
        } catch {
            // ignore
        }
    }

    async function persistState(key: string, next: VerseState) {
        if (!auth?.user || !csrf) return;
        const parsed = parseVerseKey(key);
        if (!parsed) return;
        await fetch(`/versehub/${encodeURIComponent(lang)}/reader-actions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                Accept: 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                book: parsed.book,
                chapter: parsed.chapter,
                verse: parsed.verse,
                favorite: next.favorite,
                bookmarked: next.bookmarked,
                highlighted: next.highlighted,
                highlightColor: next.highlightColor,
                note: next.note,
            }),
        });
    }

    function updateVerseAction(key: string, patch: Partial<VerseState>, toastLabel?: string, sourceEl?: HTMLElement | null) {
        if (!requireMember()) return;
        const current = stateFor(key);
        const next = { ...current, ...patch };
        setActions((prev) => ({ ...prev, [key]: next }));
        void persistState(key, next);
        const didAddSave = (!current.favorite && next.favorite) || (!current.bookmarked && next.bookmarked) || (String(current.note || '').trim() === '' && String(next.note || '').trim() !== '');
        if (toastLabel) {
            showToast(`${toastLabel} • barusan`, {
                ctaHref: didAddSave ? '/versehub/id/my-spiritual-journey' : undefined,
                ctaLabel: didAddSave ? 'Buka Journey →' : undefined,
            });
        }
        if (didAddSave) runFirstSaveConfetti(sourceEl);
    }

    function openVerseTools(verseKey: string) {
        if (!requireMember()) return;
        pulseHaptic('light');
        setNoteDrawerOpen(false);
        setAdvancedToolsOpen(false);
        setActiveVerseKey(verseKey);
        setToolsOpen(true);
    }

    async function loadVerseComments(verseKey: string) {
        setVerseCommentsLoading(true);
        try {
            const res = await fetch(`/versehub/${encodeURIComponent(lang)}/${encodeURIComponent(verseKey)}/comments`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('failed to load');
            const json = await res.json();
            const list = Array.isArray(json?.comments) ? (json.comments as VerseComment[]) : [];
            setVerseComments(list);
        } catch {
            setVerseComments([]);
        } finally {
            setVerseCommentsLoading(false);
        }
    }

    function openVerseComments(v: Verse) {
        setToolsOpen(false);
        setVerseCommentDraft('');
        setVerseCommentsOpen(true);
        void loadVerseComments(v.key);
    }

    function handleShareVerse(v: Verse) {
        if (!requireMember()) return;
        setToolsOpen(false);
        setShareOpen(true);
        setShareData({
            title: `${chapter_label}:${v.verse}`,
            subtitle: v.text,
            url: v.href,
            ogImageUrl: `/versehub/${lang}/${v.key}/og.png`,
        });
    }

    async function submitVerseComment() {
        if (!selectedVerse) return;
        const body = verseCommentDraft.trim();
        if (!body) return;

        try {
            const res = await fetch(`/versehub/${encodeURIComponent(lang)}/${encodeURIComponent(selectedVerse.key)}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    body,
                    author_name: isAuthenticated ? undefined : guestCommentName.trim(),
                }),
            });
            if (!res.ok) throw new Error('failed');
            setVerseCommentDraft('');
            await loadVerseComments(selectedVerse.key);
        } catch {
            showToast('Gagal mengirim komentar');
        }
    }

    function handleCrossReference(v: Verse) {
        const parsed = parseVerseKey(v.key);
        if (!parsed) return;
        const q = `${parsed.book.toUpperCase()} ${parsed.chapter}:${parsed.verse}`;
        setToolsOpen(false);
        router.get(`/versehub/${lang}`, { q }, { preserveScroll: false, preserveState: false });
    }

    function openNoteDrawerForDesktop() {
        if (!selectedVerse) return;
        const current = stateFor(selectedVerse.key);
        setNoteDraft(String(current.note || ''));
        setToolsOpen(false);
        setNoteDrawerOpen(true);
    }

    function openMentorForVerse(v: typeof selectedVerse) {
        if (!v) return;
        setActiveVerseKey(v.key);
        setToolsOpen(false);
        setMentorOpen(true);
    }

    function handlePathSelect(path: { slug: string }) {
        router.visit(`/versehub/${lang}/study/${path.slug}`);
    }

    function saveNoteFromDrawer() {
        if (!selectedVerse) return;
        const normalized = noteDraft.trim();
        updateVerseAction(selectedVerse.key, { note: normalized }, normalized ? 'Catatan tersimpan' : 'Catatan dihapus', noteDrawerRef.current);
        setNoteDrawerOpen(false);
    }

    function isMobileLongPressMode() {
        return window.matchMedia('(max-width: 767.98px), (pointer: coarse)').matches;
    }

    function onVersePointerDown(e: React.PointerEvent<HTMLElement>, verseKey: string) {
        if (!isMobileLongPressMode()) return;
        if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
        suppressClickRef.current = false;
        longPressStartRef.current = { x: e.clientX, y: e.clientY };
        touchIntentRef.current = {
            moved: false,
            startScrollY: window.scrollY,
        };
        longPressTimerRef.current = window.setTimeout(() => {
            suppressClickRef.current = true;
            openVerseTools(verseKey);
        }, 800);
    }

    function onVersePointerMove(e: React.PointerEvent<HTMLElement>) {
        if (!isMobileLongPressMode()) return;
        if (!longPressStartRef.current || !longPressTimerRef.current) return;
        const dx = Math.abs(e.clientX - longPressStartRef.current.x);
        const dy = Math.abs(e.clientY - longPressStartRef.current.y);
        if (dx > 22 || dy > 22) {
            touchIntentRef.current.moved = true;
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
            longPressStartRef.current = null;
        }
    }

    function onVersePointerEnd() {
        if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        longPressStartRef.current = null;
    }

    function handlePickChapter(ch: number) {
        if (!activeBook) return;
        pulseHaptic('strong');
        setPickerOpen(false);
        window.location.assign(`/versehub/id/${encodeURIComponent(activeBook)}-${encodeURIComponent(String(ch))}`);
    }

    function handleLandingStartHere() {
        pulseHaptic('strong');
        trackLandingEvent('cta_start_here_click', { href: defaultHomeHref });
        showToast('Target sesi: 3 menit • fokus 1 ayat dulu');
    }

    function handleLandingContinue() {
        pulseHaptic('light');
        trackLandingEvent('cta_continue_click', { href: continueHref });
    }

    function handleLandingExploreOpen() {
        pulseHaptic('light');
        trackLandingEvent('cta_explore_open');
        setPickerOpen(true);
    }

    function handleLandingPathClick(pathType: 'ot' | 'nt', href: string) {
        pulseHaptic('light');
        trackLandingEvent('cta_path_click', { path_type: pathType, href });
    }

    function handleBottomNavChange(id: string) {
        const navId = id as UiNavId;
        const raw = uiRoutes[navId] ?? defaultHomeHref;
        const href = !isAuthenticated && navId === 'settings' ? '/' : raw;
        if (href === window.location.pathname) return;
        router.visit(href, { preserveScroll: true });
    }

    function isTypingTarget(target: EventTarget | null): boolean {
        if (!(target instanceof HTMLElement)) return false;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
        return target.isContentEditable;
    }

    function getShortcutVerse(): Verse | null {
        if (selectedVerse) return selectedVerse;
        if (verses.length === 0) return null;
        return verses.find((v) => v.verse === progressVerse) || verses[0] || null;
    }

    useEffect(() => {
        const onShortcut = (e: KeyboardEvent) => {
            if (isTypingTarget(e.target)) return;

            const key = e.key.toLowerCase();
            if (key === '/' || (key === 'k' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }

            if (!isAuthenticated || !isChapter) return;
            const targetVerse = getShortcutVerse();
            if (!targetVerse) return;

            if (key === '?') {
                e.preventDefault();
                setShortcutHintOpen((prev) => !prev);
                return;
            }

            if (key === 'm') {
                e.preventDefault();
                openMentorForVerse(targetVerse);
                return;
            }
            if (key === 's') {
                e.preventDefault();
                updateVerseAction(targetVerse.key, { favorite: !stateFor(targetVerse.key).favorite }, 'Disimpan');
                return;
            }
            if (key === 'b') {
                e.preventDefault();
                updateVerseAction(targetVerse.key, { bookmarked: !stateFor(targetVerse.key).bookmarked }, 'Bookmark diperbarui');
                return;
            }
            if (key === 'h') {
                e.preventDefault();
                updateVerseAction(
                    targetVerse.key,
                    { highlighted: !stateFor(targetVerse.key).highlighted },
                    stateFor(targetVerse.key).highlighted ? 'Sorotan dihapus' : 'Sorotan aktif',
                );
                return;
            }
            if (key === 'n') {
                e.preventDefault();
                setActiveVerseKey(targetVerse.key);
                const current = stateFor(targetVerse.key);
                setNoteDraft(String(current.note || ''));
                setToolsOpen(false);
                setNoteDrawerOpen(true);
                return;
            }
            if (key === 'x') {
                e.preventDefault();
                handleCrossReference(targetVerse);
            }
        };

        window.addEventListener('keydown', onShortcut);
        return () => window.removeEventListener('keydown', onShortcut);
    }, [isAuthenticated, isChapter, progressVerse, selectedVerse, verses]);

    const selectedActions = selectedVerse ? stateFor(selectedVerse.key) : defaultState();
    const textSizeClass = textSize === 0 ? 'text-[0.98rem] leading-8' : textSize === 2 ? 'text-[1.2rem] leading-10' : 'text-base md:text-lg leading-8 md:leading-9';
    const isDarkMode = readingMode === 'dark';
    const isFocusMode = readingMode === 'focus';
    const metaTitle = chapter_label ? `${chapter_label} - VerseHub` : 'Alkitab - VerseHub';
    const metaDescription = chapter_label
        ? `Baca ${chapter_label} di VerseHub. Scripture-centered reading dengan Study Companion yang transparan.`
        : 'Baca Alkitab dengan pengalaman tenang dan berpusat pada Firman di VerseHub.';
    const rawOgImage = page.props.og_image_url || '/og/versehub-bg.png';
    const canonicalSafe = canonical_url || '/versehub/id';
    const ogImageAbsolute = (() => {
        if (/^https?:\/\//i.test(rawOgImage)) return rawOgImage;
        if (typeof window !== 'undefined') return `${window.location.origin}${rawOgImage}`;
        return rawOgImage;
    })();
    const otStarter = books.find((b) => b.testament === 'ot');
    const ntStarter = books.find((b) => b.testament === 'nt');
    const adaptiveHeroOverlay = Math.round(clamp(0.52 + (journeyTotalSaved > 10 ? 0.09 : 0), 0.5, 0.7) * 100);
    const personaCopy = useMemo(() => {
        if (landingPersona === 'returning_reader') {
            if (landingVariant === 'b') {
                return {
                    badge: 'RETURNING READER',
                    heroTitle: 'Ritme rohanimu sudah berjalan. Tinggal lanjutkan dari progres terakhir.',
                    heroBody: 'Satu klik untuk kembali ke chapter sebelumnya, lalu pertahankan kebiasaan harian dengan jalur bacaan yang konsisten.',
                    startCardTitle: 'Stabilkan fokus hari ini',
                    startCardBody: 'Gunakan ayat harian sebagai checkpoint.',
                    continueButtonLabel: 'Resume Progress',
                    continueTag: 'Resume',
                    exploreTitle: 'Continue Scripture Paths',
                    exploreBody: 'Lanjutkan learning path bacaan Alkitab harian anda.',
                };
            }
            return {
                badge: 'RETURNING READER',
                heroTitle: 'Selamat datang kembali. Lanjutkan firman dari titik terakhirmu.',
                heroBody: 'Masuk lagi tanpa friksi: lanjutkan progres, review momen tersimpan, lalu jelajahi kitab berikutnya.',
                startCardTitle: 'Refresh ritme hari ini',
                startCardBody: 'Mulai cepat dari ayat harian untuk menstabilkan fokus sebelum lanjut ke chapter berikutnya.',
                continueButtonLabel: 'Continue Journey',
                continueTag: 'Continue',
                exploreTitle: 'Re-enter Scripture Paths',
                exploreBody: 'Pilih jalur OT/NT untuk mempertahankan momentum bacaanmu.',
            };
        }
        if (landingVariant === 'b') {
            return {
                badge: 'NEW BELIEVER PATH',
                heroTitle: 'Mulai dari sederhana: baca, pahami, lalu terapkan satu langkah hari ini.',
                heroBody: 'Tidak perlu langsung banyak. Jalur ini membantu kamu bertumbuh secara bertahap tanpa merasa tertinggal.',
                startCardTitle: 'Langkah pertama paling aman',
                startCardBody: 'Ambil ayat harian sebagai fondasi agar sesi pertama terasa ringan dan jelas.',
                continueButtonLabel: 'Continue',
                continueTag: 'Continue',
                exploreTitle: 'Guided Scripture Paths',
                exploreBody: 'Jelajahi KItab Perjanjian Lama & Baru',
            };
        }
        return {
            badge: 'NEW BELIEVER PATH',
            heroTitle: 'Mulai baca Alkitab dengan jalur yang jelas, tenang, dan konsisten.',
            heroBody: 'Kamu tidak harus tahu semuanya dulu. Mulai dari langkah kecil hari ini, lalu lanjutkan sedikit demi sedikit.',
            startCardTitle: 'Mulai dari ayat harian',
            startCardBody: 'Pintu masuk paling mudah untuk sesi pertama: satu ayat, satu fokus, satu langkah iman.',
            continueButtonLabel: 'Continue',
            continueTag: 'Continue',
            exploreTitle: 'Explore Scripture Paths',
            exploreBody: 'Pilih jalur OT/NT untuk orientasi awal tanpa merasa overwhelm.',
        };
    }, [landingPersona, landingVariant]);
    const landingPrimaryHref = landingPersona === 'returning_reader' ? continueHref : defaultHomeHref;
    const landingPrimaryLabel = landingPersona === 'returning_reader' ? personaCopy.continueButtonLabel : 'Start Here';

    return (
        <>
            <Head title={metaTitle}>
                <link rel="canonical" href={canonicalSafe} />
                <meta name="description" content={metaDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={canonicalSafe} />
                <meta property="og:image" content={ogImageAbsolute} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={ogImageAbsolute} />
            </Head>
            <style>{`
                @keyframes vhConfettiFall {
                    0% { transform: translate3d(0,0,0) rotate(0deg); opacity: .95; }
                    100% { transform: translate3d(var(--vh-cx,0px), var(--vh-cy,64px),0) rotate(var(--vh-cr,120deg)); opacity: 0; }
                }
                .vh-transient-focus { animation: vhFocusFade 1.5s ease-out forwards; box-shadow: inset 0 0 0 1px rgba(71,85,105,.25); }
                @keyframes vhFocusFade {
                    0% { background: rgba(100,116,139,.22); }
                    45% { background: rgba(100,116,139,.14); }
                    100% { background: transparent; }
                }
            `}</style>

            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#FAFAF8] text-slate-900'}`}>
                <div className="mx-auto w-full max-w-6xl px-4 py-4 md:py-6">
                    <div className="flex items-start gap-8">
                        {!isFocusMode ? <DesktopSidebarNav activeId="bible" /> : null}

                        <div className="w-full md:flex-1">
                            <div className={`sticky top-0 z-30 border-b backdrop-blur ${isDarkMode ? 'border-slate-700 bg-slate-900/92' : 'border-slate-200/70 bg-[#FAFAF8]/92'}`}>
                                <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 ring-1 ${isDarkMode ? 'bg-slate-800 ring-slate-700 hover:bg-slate-700' : 'bg-white ring-slate-200 shadow-sm hover:ring-slate-300'}`}
                                        aria-label="Back"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                    <h1 className="tct-brand-gradient text-xl font-bold tracking-tight">{chapter_label || 'Alkitab'}</h1>
                                    <button
                                        type="button"
                                        onClick={() => setPickerOpen(true)}
                                        className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ring-1 ${isDarkMode ? 'bg-slate-800 ring-slate-700 hover:bg-slate-700' : 'bg-white ring-slate-200 shadow-sm hover:ring-slate-300'}`}
                                    >
                                        <Library className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.2} />
                                        Kitab/Pasal
                                    </button>
                                </div>
                                {isChapter ? (
                                    <div className={`mx-auto flex w-full max-w-3xl items-center gap-2 px-4 pb-2 text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <span>Ayat {progressVerse} dari {progressTotal}</span>
                                        <div className={`h-0.5 flex-1 overflow-hidden rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                            <div className={`h-full rounded-full ${isDarkMode ? 'bg-slate-300' : 'bg-slate-600'}`} style={{ width: `${scrollProgressPercent}%` }} />
                                        </div>
                                    </div>
                                ) : null}
                                {isChapter ? (
                                    <div className="mx-auto hidden w-full max-w-3xl items-center justify-end gap-2 px-4 pb-3 md:flex">
                                        <button type="button" onClick={() => setReadingMode('normal')} className={`rounded-xl px-2 py-1 text-[11px] font-semibold ring-1 ${readingMode === 'normal' ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200'}`}>Normal</button>
                                        <button type="button" onClick={() => setReadingMode('focus')} className={`rounded-xl px-2 py-1 text-[11px] font-semibold ring-1 ${readingMode === 'focus' ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200'}`}>Focus</button>
                                        <button type="button" onClick={() => setReadingMode('dark')} className={`rounded-xl px-2 py-1 text-[11px] font-semibold ring-1 ${readingMode === 'dark' ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200'}`}>Dark</button>
                                        <label htmlFor="vh-text-size" className="ml-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">Text Size</label>
                                        <input
                                            id="vh-text-size"
                                            type="range"
                                            min={0}
                                            max={2}
                                            step={1}
                                            value={textSize}
                                            onChange={(e) => setTextSize(Number(e.target.value) as 0 | 1 | 2)}
                                            className="w-24"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShortcutHintOpen((prev) => !prev)}
                                            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600"
                                        >
                                            Shortcuts
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 md:pb-10">
                                <div className="mx-auto max-w-3xl">
                                    <div ref={searchWrapRef} className="relative group">
                                        <form onSubmit={submitSearch} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-amber-500" strokeWidth={2.5} />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    onFocus={() => setSuggestOpen(suggestions.length > 0)}
                                                    onKeyDown={onSearchKeyDown}
                                                    placeholder="Cari referensi: yoh 3:16-18"
                                                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/5 shadow-sm"
                                                    role="combobox"
                                                    aria-autocomplete="list"
                                                    aria-expanded={suggestOpen}
                                                    aria-controls="vh-search-suggest-list"
                                                    aria-activedescendant={suggestIndex >= 0 ? `vh-suggest-opt-${suggestIndex}` : undefined}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-soft transition-all hover:bg-slate-800 active:scale-95"
                                            >
                                                Cari
                                            </button>
                                        </form>
                                        <p className="mt-1.5 text-[11px] text-slate-500">
                                            Tip: klik ayat untuk aksi cepat. Shortcut desktop: <kbd className="rounded bg-slate-100 px-1">/</kbd> cari, <kbd className="rounded bg-slate-100 px-1">?</kbd> bantuan.
                                        </p>
                                        {suggestOpen && suggestions.length ? (
                                            <div id="vh-search-suggest-list" role="listbox" className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                {suggestions.map((item, idx) => (
                                                    <button
                                                        id={`vh-suggest-opt-${idx}`}
                                                        key={`${item.href || item.value || item.label || 'suggest'}-${idx}`}
                                                        type="button"
                                                        onClick={() => onPickSuggestion(item)}
                                                        role="option"
                                                        aria-selected={idx === suggestIndex}
                                                        className={`block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50 ${idx === suggestIndex ? 'bg-slate-50' : ''}`}
                                                    >
                                                        {item.label || item.value || ''}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    {search_error ? <p className="mt-2 text-xs text-rose-500">{search_error}</p> : null}
                                    {search_meta?.verses?.length ? (
                                        <p className="mt-2 text-xs text-slate-500">Menampilkan ayat: {search_meta?.verses?.join(', ')}</p>
                                    ) : null}
                                    {shortcutHintOpen ? (
                                        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
                                            <p className="font-semibold text-slate-800">Keyboard shortcuts</p>
                                            <p className="mt-1">`/` fokus ke pencarian, `s` simpan, `b` bookmark, `h` sorot, `n` catatan, `m` mentor, `x` cross reference.</p>
                                        </div>
                                    ) : null}
                                    {search_recommendations.length ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {search_recommendations.map((r, idx) => (
                                                <a key={`${r.href || r.label || 'rec'}-${idx}`} href={r.href || '#'} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold">
                                                    {r.label || 'Buka rekomendasi'}
                                                </a>
                                            ))}
                                        </div>
                                    ) : null}

                                    {!isChapter ? (
                                        <>
                                            {!landingReady ? (
                                                <div className="mt-7 space-y-4">
                                                    <div className="h-44 animate-pulse rounded-3xl bg-slate-200/80" />
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
                                                        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
                                                    </div>
                                                    <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60" />
                                                </div>
                                            ) : (
                                                <div className="mt-7 space-y-4">
                                                    {lastReadChip ? (
                                                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
                                                            <History className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.2} />
                                                            Lanjut terakhir: {lastReadChip.label}
                                                            <span className="text-slate-400">•</span>
                                                            <span className="text-slate-500">{lastReadChip.relative}</span>
                                                        </div>
                                                    ) : null}
                                                    <section
                                                        className="relative overflow-hidden rounded-[2rem] p-7 text-white shadow-[0_32px_80px_-40px_rgba(2,6,23,0.8)] ring-1 ring-white/20"
                                                        style={{
                                                            backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.1), rgba(2,6,23,${adaptiveHeroOverlay / 100})), url('${ogImageAbsolute}')`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                        }}
                                                    >
                                                        <div className="relative z-[1] max-w-2xl">
                                                            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-widest backdrop-blur-md">
                                                                {personaCopy.badge}
                                                            </div>
                                                            <h2 className="mt-4 text-3xl font-bold leading-[1.15] sm:text-[2.2rem] tracking-tight">{personaCopy.heroTitle}</h2>
                                                            <p className="mt-3 text-base leading-relaxed text-white/90 font-medium">
                                                                {personaCopy.heroBody}
                                                            </p>
                                                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                                                <a
                                                                    href={landingPrimaryHref}
                                                                    onClick={landingPersona === 'returning_reader' ? handleLandingContinue : handleLandingStartHere}
                                                                    className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-slate-50 active:scale-95"
                                                                >
                                                                    <Zap className="h-5 w-5 text-amber-500" fill="currentColor" />
                                                                    {landingPrimaryLabel}
                                                                </a>
                                                                <a
                                                                    href={landingPersona === 'returning_reader' ? defaultHomeHref : continueHref}
                                                                    onClick={landingPersona === 'returning_reader' ? handleLandingStartHere : handleLandingContinue}
                                                                    className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-white/95 backdrop-blur-md ring-1 ring-white/30 transition-all hover:bg-white/10 active:scale-95"
                                                                >
                                                                    <History className="h-5 w-5 opacity-70" strokeWidth={2.2} />
                                                                    {landingPersona === 'returning_reader' ? 'Reset dari hari ini' : personaCopy.continueButtonLabel}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    {landingPersona === 'new_believer' ? (
                                                        <section className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-5 shadow-soft ring-1 ring-amber-100/50">
                                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">Start Plan • 3-5 menit</p>
                                                            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                                <div className="rounded-2xl border border-amber-100 bg-white/60 p-3.5">
                                                                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/50">
                                                                        <Library className="h-4 w-4 text-amber-700" strokeWidth={2.5} />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-slate-900">1. Read</p>
                                                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Buka ayat harian (1 menit).</p>
                                                                </div>
                                                                <div className="rounded-2xl border border-amber-100 bg-white/60 p-3.5">
                                                                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/50">
                                                                        <Compass className="h-4 w-4 text-amber-700" strokeWidth={2.5} />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-slate-900">2. Reflect</p>
                                                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Ambil satu pesan utama (2 menit).</p>
                                                                </div>
                                                                <div className="rounded-2xl border border-amber-100 bg-white/60 p-3.5">
                                                                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/50">
                                                                        <Bookmark className="h-4 w-4 text-amber-700" strokeWidth={2.5} />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-slate-900">3. Save</p>
                                                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Simpan ayat untuk besok (1 menit).</p>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    ) : null}

                                                    {/* Removed redundant cards section: Start Here, Continue, Explore */}

                                                    <section className="rounded-[2.25rem] border border-slate-200 bg-white p-7 shadow-soft ring-1 ring-slate-100/50">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <h3 className="inline-flex items-center gap-2.5 text-base font-bold text-slate-900">
                                                                <Compass className="h-5.5 w-5.5 text-amber-500" strokeWidth={1.8} />
                                                                {personaCopy.exploreTitle}
                                                            </h3>
                                                            <button
                                                                type="button"
                                                                onClick={handleLandingExploreOpen}
                                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95 shadow-sm"
                                                            >
                                                                Semua Kitab
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                        <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">{personaCopy.exploreBody}</p>
                                                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            {otStarter ? (
                                                                <a
                                                                    href={`/versehub/id/${encodeURIComponent(otStarter.code)}-1`}
                                                                    onClick={() =>
                                                                        handleLandingPathClick(
                                                                            'ot',
                                                                            `/versehub/id/${encodeURIComponent(otStarter.code)}-1`,
                                                                        )
                                                                    }
                                                                    className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white px-5 py-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-amber-300 shadow-sm"
                                                                >
                                                                    <div className="relative z-10 flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 opacity-80">Old Testament</p>
                                                                            <p className="mt-1.5 text-base font-bold text-slate-900 group-hover:text-amber-800">Mulai dari {otStarter.label} 1</p>
                                                                        </div>
                                                                        <Scroll className="h-6 w-6 text-amber-500 transition-transform group-hover:rotate-12 group-hover:scale-110" strokeWidth={1.5} />
                                                                    </div>
                                                                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-200/20 blur-2xl transition-all group-hover:bg-amber-300/30" />
                                                                </a>
                                                            ) : null}
                                                            {ntStarter ? (
                                                                <a
                                                                    href={`/versehub/id/${encodeURIComponent(ntStarter.code)}-1`}
                                                                    onClick={() =>
                                                                        handleLandingPathClick(
                                                                            'nt',
                                                                            `/versehub/id/${encodeURIComponent(ntStarter.code)}-1`,
                                                                        )
                                                                    }
                                                                    className="group relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/80 to-white px-5 py-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-sky-300 shadow-sm"
                                                                >
                                                                    <div className="relative z-10 flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700 opacity-80">New Testament</p>
                                                                            <p className="mt-1.5 text-base font-bold text-slate-900 group-hover:text-sky-800">Mulai dari {ntStarter.label} 1</p>
                                                                        </div>
                                                                        <ArrowRight className="h-6 w-6 text-sky-500 transition-transform group-hover:rotate-12 group-hover:scale-110" strokeWidth={1.5} />
                                                                    </div>
                                                                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-sky-200/20 blur-2xl transition-all group-hover:bg-sky-300/30" />
                                                                </a>
                                                            ) : null}
                                                        </div>
                                                    </section>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="mt-6 space-y-6">
                                                {verses.map((v) => {
                                                    const state = stateFor(v.key);
                                                    const selected = activeVerseKey === v.key;
                                                    return (
                                                        <p
                                                            key={v.key}
                                                            id={`vh-v-${v.verse}`}
                                                            className={`rounded-xl px-2 py-1 leading-8 md:leading-9 ${selected ? (isDarkMode ? 'bg-slate-800 ring-1 ring-slate-700' : 'bg-slate-100 ring-1 ring-slate-200') : ''} ${getHighlightClass(state)}`}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    if (suppressClickRef.current) {
                                                                        suppressClickRef.current = false;
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    if (isMobileLongPressMode()) {
                                                                        const scrolled = Math.abs(window.scrollY - touchIntentRef.current.startScrollY) > 8;
                                                                        if (touchIntentRef.current.moved || scrolled) {
                                                                            e.preventDefault();
                                                                            return;
                                                                        }
                                                                    }
                                                                    openVerseTools(v.key);
                                                                }}
                                                                onPointerDown={(e) => onVersePointerDown(e, v.key)}
                                                                onPointerMove={onVersePointerMove}
                                                                onPointerUp={onVersePointerEnd}
                                                                onPointerCancel={onVersePointerEnd}
                                                                onContextMenu={(e) => {
                                                                    if (isMobileLongPressMode()) e.preventDefault();
                                                                }}
                                                                className={`w-full cursor-pointer text-left ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} ${textSizeClass}`}
                                                            >
                                                                <sup className={`mr-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{v.verse}</sup>
                                                                {v.text}
                                                            </button>
                                                            {state.note.trim() ? <span className={`mt-2 block border-l-2 pl-3 text-sm italic ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>{state.note}</span> : null}
                                                        </p>
                                                    );
                                                })}
                                            </div>

                                            {isChapter && !has_reflected && (
                                                <EndOfChapterPrompt
                                                    lang={lang}
                                                    questionText={activeReflectionQuestion}
                                                    suggestedPaths={mentorInsights?.suggested_paths}
                                                    onReflect={() => setReflectionComposerOpen(true)}
                                                    onPathSelect={handlePathSelect}
                                                />
                                            )}
                                        </>
                                    )}

                                    {cross_panels.length ? (
                                        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {cross_panels.map((p, idx) => (
                                                <section key={`${p.title}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold">{p.title}</h3>
                                                        {p.range_text ? <span className="text-xs text-slate-500">{p.range_text}</span> : null}
                                                    </div>
                                                    <div className="space-y-4">
                                                        {p.verses.map((v) => (
                                                            <p key={v.key} className="text-sm leading-8 text-slate-800">
                                                                <sup className="mr-2 text-xs text-slate-400">{v.verse}</sup>
                                                                {v.text}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </main>
                        </div>
                    </div>
                </div>

                {isChapter ? (
                    <div className="fixed bottom-5 right-4 z-30 flex items-center gap-2 md:right-8">
                        {prev_url ? <a href={prev_url} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200" aria-label="Prev">←</a> : null}
                        {next_url ? <a href={next_url} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200" aria-label="Next">→</a> : null}
                    </div>
                ) : null}

                <div
                    className="fixed inset-x-0 z-40 flex justify-center md:hidden"
                    style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))' }}
                >
                    <FloatingBottomNav
                        items={navItems}
                        activeId="bible"
                        onPrefetch={(id) => {
                            const navId = id as UiNavId;
                            const raw = uiRoutes[navId] ?? defaultHomeHref;
                            const href = !isAuthenticated && navId === 'settings' ? '/' : raw;
                            try {
                                router.prefetch(href, { preserveScroll: true, preserveState: true }, { cacheFor: 60_000 });
                            } catch {
                                // no-op
                            }
                        }}
                        onChange={handleBottomNavChange}
                    />
                </div>

                {pickerOpen ? (
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Pilih kitab dan pasal">
                        <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setPickerOpen(false)} />
                        <div ref={pickerPanelRef} tabIndex={-1} className="relative w-full max-h-[88vh] overflow-hidden rounded-t-[2.5rem] bg-white shadow-2xl sm:max-h-[750px] sm:w-[580px] sm:rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-300">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                    <h3 className="text-xl font-bold tracking-tight text-slate-900">Jelajahi Alkitab</h3>
                                    <button
                                        type="button"
                                        onClick={() => setPickerOpen(false)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-90"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6 overflow-y-auto">
                                    <div className="mb-6 grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-100 p-1.5 shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => setTab('ot')}
                                            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tab === 'ot' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
                                        >
                                            Old Testament
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTab('nt')}
                                            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tab === 'nt' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
                                        >
                                            New Testament
                                        </button>
                                    </div>

                                    <div className="grid h-[56vh] min-h-0 grid-cols-1 gap-6 sm:h-[52vh] sm:grid-cols-5">
                                        <div className="sm:col-span-2 flex h-full min-h-0 flex-col gap-2 overflow-y-auto pr-2">
                                            {byTab.map((b) => (
                                                <button
                                                    key={b.code}
                                                    type="button"
                                                    onClick={() => setActiveBook(b.code)}
                                                    className={`group relative flex w-full items-center rounded-xl px-4 py-3 text-left transition-all ${activeBook === b.code ? (tab === 'ot' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200') : 'hover:bg-slate-50'}`}
                                                >
                                                    <span className={`text-sm ${activeBook === b.code ? 'font-bold' : 'font-medium text-slate-600'}`}>
                                                        {b.label}
                                                    </span>
                                                    {activeBook === b.code && (
                                                        <div className={`absolute right-3 h-1.5 w-1.5 rounded-full ${tab === 'ot' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="sm:col-span-3 flex h-full min-h-0 flex-col overflow-y-auto">
                                            {bookChapters.length ? (
                                                <div className="grid grid-cols-4 gap-2.5 pr-1 pb-24 sm:grid-cols-5">
                                                    {bookChapters.map((ch) => (
                                                        <button
                                                            key={ch}
                                                            type="button"
                                                            onClick={() => handlePickChapter(ch)}
                                                            className={`flex items-center justify-center rounded-xl aspect-square border text-sm font-bold transition-all active:scale-90 shadow-sm ${tab === 'ot' ? 'border-amber-100 bg-white hover:bg-amber-50 hover:border-amber-200 text-amber-900' : 'border-sky-100 bg-white hover:bg-sky-50 hover:border-sky-200 text-sky-900'}`}
                                                        >
                                                            {ch}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400 opacity-60">
                                                    <Compass className="h-10 w-10 mb-3 animate-pulse" strokeWidth={1.5} />
                                                    <p className="text-sm font-medium">Pilih kitab untuk melihat pasal</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {toolsOpen && selectedVerse ? (
                    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`Aksi ayat ${chapter_label}:${selectedVerse.verse}`}>
                        <button type="button" className="absolute inset-0 bg-black/20" onClick={() => setToolsOpen(false)} />
                        <div ref={toolsMobilePanelRef} tabIndex={-1} className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 sm:hidden">
                            <p className="text-sm font-semibold">{chapter_label}:{selectedVerse.verse}</p>
                            <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">{selectedVerse.text}</p>
                            <p className="mt-2 text-[11px] text-slate-500">Aksi utama untuk ayat aktif.</p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={(e) => updateVerseAction(selectedVerse.key, { favorite: !selectedActions.favorite }, 'Like diperbarui', e.currentTarget)}>
                                    <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" strokeWidth={2.2} /> Like</span>
                                </button>
                                <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={() => openVerseComments(selectedVerse)}>
                                    <span className="inline-flex items-center gap-2"><MessageSquareQuote className="h-4 w-4" strokeWidth={2.2} /> Comment</span>
                                </button>
                                <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={() => handleShareVerse(selectedVerse)}>
                                    <span className="inline-flex items-center gap-2"><SendHorizontal className="h-4 w-4" strokeWidth={2.2} /> Bagikan</span>
                                </button>
                                {isAuthenticated ? (
                                    <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={(e) => updateVerseAction(selectedVerse.key, { bookmarked: !selectedActions.bookmarked }, 'Bookmark diperbarui', e.currentTarget)}>
                                        <span className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4" strokeWidth={2.2} /> Bookmark</span>
                                    </button>
                                ) : null}
                                {isAuthenticated ? (
                                    <button className="rounded-xl bg-amber-50 px-3 py-2 text-left text-sm font-bold text-amber-700 ring-1 ring-amber-200" onClick={() => openMentorForVerse(selectedVerse)}>
                                        <span className="inline-flex items-center gap-2"><Wand2 className="h-4 w-4" strokeWidth={2.2} /> Scripture Guide</span>
                                    </button>
                                ) : null}
                            </div>
                            {isAuthenticated ? (
                                <button
                                    type="button"
                                    onClick={() => setAdvancedToolsOpen((prev) => !prev)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600"
                                >
                                    {advancedToolsOpen ? 'Sembunyikan aksi lanjutan' : 'Aksi lanjutan'}
                                </button>
                            ) : null}
                            {isAuthenticated && advancedToolsOpen ? (
                                <div className="mt-2 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={() => {
                                            const next = prompt('Tulis catatan:', selectedActions.note || '');
                                            if (next !== null) updateVerseAction(selectedVerse.key, { note: next.trim() }, next.trim() ? 'Catatan tersimpan' : 'Catatan dihapus');
                                        }}>
                                            <span className="inline-flex items-center gap-2"><StickyNote className="h-4 w-4" strokeWidth={2.2} /> Tambah Catatan</span>
                                        </button>
                                        <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={() => updateVerseAction(selectedVerse.key, { highlighted: !selectedActions.highlighted }, selectedActions.highlighted ? 'Sorotan dihapus' : 'Sorotan aktif')}>
                                            <span className="inline-flex items-center gap-2"><Highlighter className="h-4 w-4" strokeWidth={2.2} /> Sorot</span>
                                        </button>
                                        <button className="rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold" onClick={() => handleCrossReference(selectedVerse)}>
                                            <span className="inline-flex items-center gap-2"><Network className="h-4 w-4" strokeWidth={2.2} /> Cross Reference</span>
                                        </button>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-2">
                                        <p className="mb-2 text-[11px] font-semibold text-slate-500">Warna sorotan</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                aria-label="Yellow highlight"
                                                onClick={() => updateVerseAction(selectedVerse.key, { highlighted: true, highlightColor: 'yellow' }, 'Sorotan diubah')}
                                                className="h-8 rounded-lg ring-1 ring-slate-200"
                                                style={{ background: 'rgba(250, 204, 21, 0.28)' }}
                                            />
                                            <button
                                                type="button"
                                                aria-label="Green highlight"
                                                onClick={() => updateVerseAction(selectedVerse.key, { highlighted: true, highlightColor: 'green' }, 'Sorotan diubah')}
                                                className="h-8 rounded-lg ring-1 ring-slate-200"
                                                style={{ background: 'rgba(34, 197, 94, 0.22)' }}
                                            />
                                            <button
                                                type="button"
                                                aria-label="Blue highlight"
                                                onClick={() => updateVerseAction(selectedVerse.key, { highlighted: true, highlightColor: 'blue' }, 'Sorotan diubah')}
                                                className="h-8 rounded-lg ring-1 ring-slate-200"
                                                style={{ background: 'rgba(59, 130, 246, 0.20)' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <aside ref={toolsDesktopPanelRef} tabIndex={-1} className="absolute right-0 top-0 hidden h-full w-[360px] bg-white p-4 shadow-2xl sm:block">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold">{chapter_label}:{selectedVerse.verse}</p>
                                    <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">{selectedVerse.text}</p>
                                    <p className="mt-1 text-[11px] text-slate-500">Aksi utama lebih atas, aksi lanjutan di bawah.</p>
                                </div>
                                <button type="button" onClick={() => setToolsOpen(false)} className="text-xs text-slate-500">Close</button>
                            </div>
                            <div className="space-y-1 text-sm">
                                <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={(e) => updateVerseAction(selectedVerse.key, { favorite: !selectedActions.favorite }, 'Like diperbarui', e.currentTarget)}>
                                    <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" strokeWidth={1.8} /> Like <span className="ml-auto text-[10px] text-slate-500">S</span></span>
                                </button>
                                <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={() => openVerseComments(selectedVerse)}>
                                    <span className="inline-flex items-center gap-2"><MessageSquareQuote className="h-4 w-4" strokeWidth={1.8} /> Comment</span>
                                </button>
                                <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={() => handleShareVerse(selectedVerse)}>
                                    <span className="inline-flex items-center gap-2"><SendHorizontal className="h-4 w-4" strokeWidth={1.8} /> Bagikan</span>
                                </button>
                                {isAuthenticated ? (
                                    <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={(e) => updateVerseAction(selectedVerse.key, { bookmarked: !selectedActions.bookmarked }, 'Bookmark diperbarui', e.currentTarget)}>
                                        <span className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4" strokeWidth={1.8} /> Bookmark <span className="ml-auto text-[10px] text-slate-500">B</span></span>
                                    </button>
                                ) : null}
                                {isAuthenticated ? (
                                    <button className="mt-2 block w-full rounded-xl bg-amber-50 px-3 py-2.5 text-left text-sm font-bold text-amber-700 ring-1 ring-amber-200" onClick={() => openMentorForVerse(selectedVerse)}>
                                        <span className="inline-flex items-center gap-2"><Wand2 className="h-4 w-4" strokeWidth={1.8} /> Scripture Guide <span className="ml-auto text-[10px] text-amber-700/80">M</span></span>
                                    </button>
                                ) : null}
                            </div>
                            {isAuthenticated ? (
                                <button
                                    type="button"
                                    onClick={() => setAdvancedToolsOpen((prev) => !prev)}
                                    className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600"
                                >
                                    {advancedToolsOpen ? 'Sembunyikan aksi lanjutan' : 'Aksi lanjutan'}
                                </button>
                            ) : null}
                            {isAuthenticated && advancedToolsOpen ? (
                                <>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={openNoteDrawerForDesktop}>
                                            <span className="inline-flex items-center gap-2"><StickyNote className="h-4 w-4" strokeWidth={1.8} /> Tambah Catatan <span className="ml-auto text-[10px] text-slate-500">N</span></span>
                                        </button>
                                        <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={() => updateVerseAction(selectedVerse.key, { highlighted: !selectedActions.highlighted }, selectedActions.highlighted ? 'Sorotan dihapus' : 'Sorotan aktif')}>
                                            <span className="inline-flex items-center gap-2"><Highlighter className="h-4 w-4" strokeWidth={1.8} /> Sorot <span className="ml-auto text-[10px] text-slate-500">H</span></span>
                                        </button>
                                        <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100" onClick={() => handleCrossReference(selectedVerse)}>
                                            <span className="inline-flex items-center gap-2"><Network className="h-4 w-4" strokeWidth={1.8} /> Cross Reference <span className="ml-auto text-[10px] text-slate-500">X</span></span>
                                        </button>
                                    </div>
                                    <div className="mt-4 rounded-xl bg-slate-50 p-2">
                                        <p className="mb-2 text-[11px] font-semibold text-slate-500">Warna sorotan</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                aria-label="Yellow highlight"
                                                onClick={() => updateVerseAction(selectedVerse.key, { highlighted: true, highlightColor: 'yellow' }, 'Sorotan diubah')}
                                                className="h-8 rounded-lg ring-1 ring-slate-200"
                                                style={{ background: 'rgba(250, 204, 21, 0.28)' }}
                                            />
                                            <button
                                                type="button"
                                                aria-label="Green highlight"
                                                onClick={() => updateVerseAction(selectedVerse.key, { highlighted: true, highlightColor: 'green' }, 'Sorotan diubah')}
                                                className="h-8 rounded-lg ring-1 ring-slate-200"
                                                style={{ background: 'rgba(34, 197, 94, 0.22)' }}
                                            />
                                            <button
                                                type="button"
                                                aria-label="Blue highlight"
                                                onClick={() => updateVerseAction(selectedVerse.key, { highlighted: true, highlightColor: 'blue' }, 'Sorotan diubah')}
                                                className="h-8 rounded-lg ring-1 ring-slate-200"
                                                style={{ background: 'rgba(59, 130, 246, 0.20)' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </aside>
                    </div>
                ) : null}

                {verseCommentsOpen && selectedVerse ? (
                    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={`Komentar ${chapter_label}:${selectedVerse.verse}`}>
                        <button type="button" className="absolute inset-0 bg-black/35" onClick={() => setVerseCommentsOpen(false)} />
                        <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:bottom-4 md:rounded-3xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold">Comments</p>
                                    <p className="text-xs text-slate-500">{chapter_label}:{selectedVerse.verse}</p>
                                </div>
                                <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-slate-100" onClick={() => setVerseCommentsOpen(false)}>
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="max-h-[48vh] space-y-2 overflow-y-auto px-4 py-3">
                                <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                                    Ingin simpan hasil pembelajaran Alkitab? Posting di{' '}
                                    <a href="/channels/public-post" className="font-semibold text-slate-900 underline">
                                        Public Post
                                    </a>.
                                </p>
                                {verseCommentsLoading ? (
                                    <p className="text-sm text-slate-500">Memuat komentar...</p>
                                ) : verseComments.length ? (
                                    verseComments.map((item) => (
                                        <div key={String(item.id)} className="rounded-2xl bg-slate-50 px-3 py-2">
                                            <p className="text-xs font-semibold text-slate-700">{item.author}</p>
                                            <p className="mt-1 text-sm text-slate-800">{item.body}</p>
                                            <p className="mt-1 text-[11px] text-slate-500">{item.created_at || 'baru saja'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">Belum ada komentar.</p>
                                )}
                            </div>
                            <div className="border-t border-slate-200 px-4 py-3">
                                {!isAuthenticated ? (
                                    <input
                                        value={guestCommentName}
                                        onChange={(e) => setGuestCommentName(e.target.value)}
                                        placeholder="Nama (opsional)"
                                        maxLength={80}
                                        className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                                    />
                                ) : null}
                                <textarea
                                    value={verseCommentDraft}
                                    onChange={(e) => setVerseCommentDraft(e.target.value)}
                                    rows={3}
                                    placeholder="Tulis komentar..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                                />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={submitVerseComment}
                                        disabled={!verseCommentDraft.trim()}
                                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                        Kirim Komentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {noteDrawerOpen && selectedVerse ? (
                    <aside
                        ref={noteDrawerRef}
                        tabIndex={-1}
                        className="fixed bottom-6 right-6 z-[75] hidden w-[360px] rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-black/10 md:block"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Tambah catatan ayat"
                    >
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">Quick Note</p>
                            <button type="button" className="rounded-full px-2 py-1 text-xs text-slate-500 hover:bg-slate-100" onClick={() => setNoteDrawerOpen(false)}>Close</button>
                        </div>
                        <p className="text-xs font-medium text-slate-500">{chapter_label}:{selectedVerse.verse}</p>
                        <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            rows={6}
                            placeholder="Tulis refleksi singkat untuk ayat ini..."
                            className="mt-3 w-full resize-none rounded-2xl bg-slate-50 px-3 py-2 text-[14px] outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-400"
                        />
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <button type="button" className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600" onClick={() => setNoteDraft('')}>Clear</button>
                            <button type="button" className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white" onClick={saveNoteFromDrawer}>Save Note</button>
                        </div>
                    </aside>
                ) : null}

                {mentorOpen && selectedVerse && (
                    <MentorPanel
                        verseRef={selectedVerse.key}
                        lang={lang}
                        verseText={selectedVerse.text}
                        verseLabel={`${chapter_label}:${selectedVerse.verse}`}
                        isAuthenticated={isAuthenticated}
                        onClose={() => setMentorOpen(false)}
                    />
                )}

                {toast ? (
                    <div className="fixed left-1/2 top-4 z-[80] -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white">
                        <div className="flex items-center gap-3">
                            <span>{toast.message}</span>
                            {toast.ctaHref ? (
                                <a href={toast.ctaHref} className="text-[11px] font-semibold text-sky-200 hover:underline">
                                    {toast.ctaLabel || 'View now →'}
                                </a>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
            <SharePanel
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                title={shareData.title}
                subtitle={shareData.subtitle}
                url={shareData.url}
                ogImageUrl={shareData.ogImageUrl}
                lang={lang}
            />

            {isAuthenticated && (
                <ReflectionComposer
                    isOpen={reflectionComposerOpen}
                    onClose={() => setReflectionComposerOpen(false)}
                    verseRef={`${selected_book}-${selected_chapter}`}
                    questionText={activeReflectionQuestion}
                    lang={lang}
                />
            )}
        </>
    );
}
